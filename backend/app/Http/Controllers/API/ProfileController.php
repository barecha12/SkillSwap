<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function show($userId)
    {
        $profile = Profile::with('user')
            ->where('user_id', $userId)
            ->firstOrFail();

        $user = $profile->user;
        $avgRating = $user->ratingsReceived()->avg('rating');
        $completedSwaps = $user->sentRequests()
            ->where('status', 'completed')
            ->count() + $user->receivedRequests()->where('status', 'completed')->count();

        return response()->json([
            'profile' => $profile,
            'user' => $user,
            'avg_rating' => round($avgRating ?? 0, 1),
            'total_swaps' => $completedSwaps,
            'skills_offered' => $user->skills()->where('type', 'offer')->with('category')->get(),
            'skills_wanted' => $user->skills()->where('type', 'request')->with('category')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:1000',
            'location' => 'sometimes|string|max:255',
            'photo' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update User
        if ($request->has('name')) {
            $user->name = $request->input('name');
            $user->save();
        }

        // Find or create profile
        $profile = Profile::firstOrCreate(['user_id' => $user->id]);

        // Update Profile
        if ($request->has('bio'))
            $profile->bio = $request->input('bio');
        if ($request->has('location'))
            $profile->location = $request->input('location');

        if ($request->hasFile('photo')) {
            if ($profile->photo) {
                Storage::disk('public')->delete($profile->photo);
            }
            $path = $request->file('photo')->store('profiles', 'public');
            $profile->photo = $path;
        }

        $profile->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()->load('profile'),
        ]);
    }
}
