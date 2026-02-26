<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $query = Skill::with(['user', 'category']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('skill_name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        $skills = $query->latest()->paginate(12);

        return response()->json($skills);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'skill_name' => 'required|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => 'required|in:offer,request',
            'level' => 'sometimes|in:beginner,intermediate,advanced',
            'category_id' => 'sometimes|exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $skill = Skill::create([
            'user_id' => $request->user()->id,
            'skill_name' => $request->skill_name,
            'description' => $request->description,
            'type' => $request->type,
            'level' => $request->level ?? 'intermediate',
            'category_id' => $request->category_id,
        ]);

        return response()->json([
            'message' => 'Skill added successfully',
            'skill' => $skill->load('category'),
        ], 201);
    }

    public function show($id)
    {
        $skill = Skill::with(['user.profile', 'category'])->findOrFail($id);
        return response()->json($skill);
    }

    public function update(Request $request, $id)
    {
        $skill = Skill::findOrFail($id);

        if ($skill->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'skill_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => 'sometimes|in:offer,request',
            'level' => 'sometimes|in:beginner,intermediate,advanced',
            'category_id' => 'sometimes|exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $skill->update($request->only(['skill_name', 'description', 'type', 'level', 'category_id']));

        return response()->json([
            'message' => 'Skill updated successfully',
            'skill' => $skill->load('category'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $skill = Skill::findOrFail($id);

        if ($skill->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $skill->delete();
        return response()->json(['message' => 'Skill deleted']);
    }

    public function mySkills(Request $request)
    {
        $skills = $request->user()->skills()->with('category')->get();
        return response()->json($skills);
    }

    public function match(Request $request)
    {
        $user = $request->user();
        // Get skills the user wants
        $wantedSkills = $user->skills()->where('type', 'request')->pluck('skill_name');

        // Find users offering those skills (excluding self)
        $matches = Skill::whereIn('skill_name', $wantedSkills)
            ->where('type', 'offer')
            ->where('user_id', '!=', $user->id)
            ->with(['user.profile', 'category'])
            ->get();

        return response()->json($matches);
    }

    public function categories()
    {
        return response()->json(Category::all());
    }
}
