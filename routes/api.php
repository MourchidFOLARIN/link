<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Authentification (public + rate limiting) ──────────────────────────────
Route::middleware('throttle:10,1')->controller(AuthController::class)->group(function () {
    Route::post('/auth/register', 'store');
    Route::post('/auth/login',    'login');
});

// Authentification Google (OAuth 2.0)
Route::controller(AuthController::class)->group(function () {
    Route::get('/auth/google/redirect', 'redirectToGoogle');
    Route::get('/auth/google/callback', 'handleGoogleCallback');
});

Route::middleware(['auth:sanctum', 'throttle:10,1'])->post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('throttle:6,1')->controller(PasswordResetController::class)->group(function () {
    Route::post('/auth/forgot-password', 'sendResetLinkEmail');
    Route::post('/auth/reset-password',  'reset');
});

// ── Catégories publiques ───────────────────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);

// ── Routes protégées ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Utilisateur courant
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Administration (secrète)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'getStats']);
    });

    // Profil
    Route::patch('/user/profile',  [ProfileController::class, 'update']);
    Route::post('/user/avatar',    [ProfileController::class, 'updateAvatar']);
    Route::delete('/user/avatar',  [ProfileController::class, 'deleteAvatar']);

    // Liens — routes spécifiques AVANT les routes paramétrées
    Route::get('/links/trash',           [LinkController::class, 'trash']);
    Route::get('/links/history',         [LinkController::class, 'history']);
    Route::post('/links/{id}/restore',   [LinkController::class, 'restore']);
    Route::delete('/links/{id}/force',   [LinkController::class, 'forceDelete']);

    // Liens — CRUD standard
    Route::get('/links',           [LinkController::class, 'index']);
    Route::get('/links/{id}',      [LinkController::class, 'show']);
    Route::post('/links',          [LinkController::class, 'store']);
    Route::post('/links/{id}',     [LinkController::class, 'update']);
    Route::delete('/links/{id}',   [LinkController::class, 'destroy']);

    // Catégories (création)
    Route::post('/categories', [CategoryController::class, 'store']);
});