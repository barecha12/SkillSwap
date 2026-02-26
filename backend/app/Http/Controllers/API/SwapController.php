<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SwapRequest;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SwapController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $swaps = SwapRequest::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->with(['sender', 'receiver', 'offeredSkill', 'requestedSkill'])
            ->latest()
            ->paginate(10);

        return response()->json($swaps);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id',
            'offered_skill_id' => 'required|exists:skills,id',
            'requested_skill_id' => 'required|exists:skills,id',
            'message' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if ($request->receiver_id == $user->id) {
            return response()->json(['message' => 'Cannot send request to yourself'], 422);
        }

        // Check for existing pending request
        $existing = SwapRequest::where('sender_id', $user->id)
            ->where('receiver_id', $request->receiver_id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending request with this user'], 422);
        }

        $swap = SwapRequest::create([
            'sender_id' => $user->id,
            'receiver_id' => $request->receiver_id,
            'offered_skill_id' => $request->offered_skill_id,
            'requested_skill_id' => $request->requested_skill_id,
            'status' => 'pending',
            'message' => $request->message,
        ]);

        // Create notification
        Notification::create([
            'user_id' => $request->receiver_id,
            'type' => 'swap_request',
            'message' => $user->name . ' sent you a swap request',
            'data' => ['swap_id' => $swap->id],
        ]);

        return response()->json([
            'message' => 'Swap request sent',
            'swap' => $swap->load(['sender', 'receiver', 'offeredSkill', 'requestedSkill']),
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,rejected,completed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $swap = SwapRequest::findOrFail($id);
        $user = $request->user();

        // Only receiver can accept/reject, both can mark complete
        if ($request->status !== 'completed' && $swap->receiver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (
            $request->status === 'completed' &&
            $swap->sender_id !== $user->id && $swap->receiver_id !== $user->id
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $swap->update(['status' => $request->status]);

        // Notify sender
        $notifyUserId = ($user->id === $swap->sender_id) ? $swap->receiver_id : $swap->sender_id;
        Notification::create([
            'user_id' => $notifyUserId,
            'type' => 'swap_' . $request->status,
            'message' => 'Your swap request was ' . $request->status,
            'data' => ['swap_id' => $swap->id],
        ]);

        return response()->json([
            'message' => 'Swap status updated',
            'swap' => $swap->load(['sender', 'receiver', 'offeredSkill', 'requestedSkill']),
        ]);
    }

    public function show($id)
    {
        $swap = SwapRequest::with(['sender', 'receiver', 'offeredSkill', 'requestedSkill', 'ratings'])
            ->findOrFail($id);
        return response()->json($swap);
    }
}
