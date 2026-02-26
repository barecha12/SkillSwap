<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\SkillController;
use App\Http\Controllers\API\SwapController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\RatingController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\AdminController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public skill browsing
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/skills/{id}', [SkillController::class, 'show']);
Route::get('/categories', [SkillController::class, 'categories']);
Route::get('/profile/{userId}', [ProfileController::class, 'show']);
Route::get('/ratings/{userId}', [RatingController::class, 'userRatings']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile
    Route::put('/profile', [ProfileController::class, 'update']);

    // Skills
    Route::post('/skills', [SkillController::class, 'store']);
    Route::put('/skills/{id}', [SkillController::class, 'update']);
    Route::delete('/skills/{id}', [SkillController::class, 'destroy']);
    Route::get('/my-skills', [SkillController::class, 'mySkills']);
    Route::get('/skills-match', [SkillController::class, 'match']);

    // Swaps
    Route::get('/swaps', [SwapController::class, 'index']);
    Route::post('/swaps', [SwapController::class, 'store']);
    Route::get('/swaps/{id}', [SwapController::class, 'show']);
    Route::patch('/swaps/{id}/status', [SwapController::class, 'updateStatus']);

    // Messages
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/{partnerId}', [MessageController::class, 'messages']);
    Route::post('/messages', [MessageController::class, 'send']);

    // Ratings
    Route::post('/ratings', [RatingController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Admin
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{id}/block', [AdminController::class, 'blockUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/skills', [AdminController::class, 'skills']);
        Route::delete('/skills/{id}', [AdminController::class, 'deleteSkill']);
        Route::get('/swaps', [AdminController::class, 'swaps']);
    });
});
