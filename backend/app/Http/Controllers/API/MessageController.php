<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        // Get distinct conversation partners
        $sentTo = Message::where('sender_id', $userId)->select('receiver_id as partner_id');
        $receivedFrom = Message::where('receiver_id', $userId)->select('sender_id as partner_id');

        $partnerIds = $sentTo->union($receivedFrom)->pluck('partner_id')->unique();

        $conversations = $partnerIds->map(function ($partnerId) use ($userId) {
            $partner = User::with('profile')->find($partnerId);
            $lastMessage = Message::where(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })->orWhere(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })
                ->latest()
                ->first();

            $unreadCount = Message::where('sender_id', $partnerId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            return [
                'partner' => $partner,
                'last_message' => $lastMessage,
                'unread_count' => $unreadCount,
            ];
        })->values();

        return response()->json($conversations);
    }

    public function messages(Request $request, $partnerId)
    {
        $userId = $request->user()->id;

        $messages = Message::where(function ($q) use ($userId, $partnerId) {
            $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
        })->orWhere(function ($q) use ($userId, $partnerId) {
            $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
        })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark as read
        Message::where('sender_id', $partnerId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        // Notify receiver
        Notification::create([
            'user_id' => $request->receiver_id,
            'type' => 'message',
            'message' => $request->user()->name . ' sent you a message',
            'data' => ['message_id' => $message->id],
        ]);

        return response()->json([
            'message' => 'Message sent',
            'data' => $message->load('sender'),
        ], 201);
    }
}
