<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Skill;
use App\Models\SwapRequest;
use App\Models\Rating;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    protected function authorize(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Admin access required');
        }
    }

    public function stats(Request $request)
    {
        $this->authorize($request);

        return response()->json([
            'total_users' => User::count(),
            'total_skills' => Skill::count(),
            'total_swaps' => SwapRequest::count(),
            'pending_swaps' => SwapRequest::where('status', 'pending')->count(),
            'completed_swaps' => SwapRequest::where('status', 'completed')->count(),
            'total_ratings' => Rating::count(),
        ]);
    }

    public function users(Request $request)
    {
        $this->authorize($request);

        $users = User::with('profile')
            ->withCount(['skills', 'sentRequests', 'receivedRequests'])
            ->paginate(15);

        return response()->json($users);
    }

    public function blockUser(Request $request, $id)
    {
        $this->authorize($request);

        $user = User::findOrFail($id);
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot block admin'], 403);
        }

        $user->update(['is_blocked' => !$user->is_blocked]);

        return response()->json([
            'message' => $user->is_blocked ? 'User blocked' : 'User unblocked',
            'user' => $user,
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $this->authorize($request);

        $user = User::findOrFail($id);
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot delete admin'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function skills(Request $request)
    {
        $this->authorize($request);

        $skills = Skill::with(['user.profile', 'category'])->latest()->paginate(15);
        return response()->json($skills);
    }

    public function deleteSkill(Request $request, $id)
    {
        $this->authorize($request);

        Skill::findOrFail($id)->delete();
        return response()->json(['message' => 'Skill deleted']);
    }

    public function swaps(Request $request)
    {
        $this->authorize($request);

        $swaps = SwapRequest::with(['sender', 'receiver', 'offeredSkill', 'requestedSkill'])
            ->latest()
            ->paginate(15);

        return response()->json($swaps);
    }
}
