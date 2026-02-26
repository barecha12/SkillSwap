<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\SwapRequest;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'swap_id' => 'required|exists:swap_requests,id',
            'rated_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $swap = SwapRequest::findOrFail($request->swap_id);

        if ($swap->status !== 'completed') {
            return response()->json(['message' => 'Can only rate completed swaps'], 422);
        }

        if ($swap->sender_id !== $user->id && $swap->receiver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check for duplicate rating
        $existing = Rating::where('swap_id', $request->swap_id)
            ->where('rater_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already rated this swap'], 422);
        }

        $rating = Rating::create([
            'swap_id' => $request->swap_id,
            'rater_id' => $user->id,
            'rated_id' => $request->rated_id,
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        // Update reputation score
        $avgRating = Rating::where('rated_id', $request->rated_id)->avg('rating');
        $profile = Profile::where('user_id', $request->rated_id)->first();
        if ($profile) {
            $profile->update(['reputation_score' => round($avgRating, 2)]);
        }

        return response()->json([
            'message' => 'Rating submitted',
            'rating' => $rating->load(['rater', 'rated']),
        ], 201);
    }

    public function userRatings($userId)
    {
        $ratings = Rating::where('rated_id', $userId)
            ->with(['rater.profile', 'swap'])
            ->latest()
            ->get();

        $avgRating = $ratings->avg('rating');

        return response()->json([
            'ratings' => $ratings,
            'avg_rating' => round($avgRating ?? 0, 1),
            'total' => $ratings->count(),
        ]);
    }
}
