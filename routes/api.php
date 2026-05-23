<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::controller(AuthController::class)->group(function () {
    Route::post('/auth/register', 'store');
    Route::post('/auth/login', 'login');
    Route::post('/auth/logout', 'logout')->middleware('auth:sanctum');
});

Route::controller(PasswordResetController::class)->group(function () {
    Route::post('/auth/forgot-password', 'sendResetLinkEmail');
    Route::post('/auth/reset-password', 'reset');
});

// Routes publiques
Route::get('/categories', [CategoryController::class, 'index']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Profil
    Route::patch('/user/profile', [ProfileController::class, 'update']);
    Route::post('/user/avatar', [ProfileController::class, 'updateAvatar']);
    Route::delete('/user/avatar', [ProfileController::class, 'deleteAvatar']);

    // Liens
    Route::get('/links/trash', [LinkController::class, 'trash']);
    Route::get('/links/history', [LinkController::class, 'history']);
    Route::post('/links/{id}/restore', [LinkController::class, 'restore']);
    Route::delete('/links/{id}/force', [LinkController::class, 'forceDelete']);
    Route::get('/links', [LinkController::class, 'index']);
    Route::get('/links/{id}', [LinkController::class, 'show']);
    Route::post('/links', [LinkController::class, 'store']);
    Route::post('/links/{id}', [LinkController::class, 'update']);
    Route::delete('/links/{id}', [LinkController::class, 'destroy']);

    // Catégories (Administration simple)
    Route::post('/categories', [CategoryController::class, 'store']);
});