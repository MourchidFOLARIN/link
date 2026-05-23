<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Supprimer la contrainte unique globale sur 'name' et 'slug'
        // et la remplacer par une contrainte unique composite (user_id, name) et (user_id, slug)
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->dropUnique(['slug']);
            $table->unique(['user_id', 'name']);
            $table->unique(['user_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'name']);
            $table->dropUnique(['user_id', 'slug']);
            $table->unique('name');
            $table->unique('slug');
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
