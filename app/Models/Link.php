<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Link extends Model
{
    /** @use HasFactory<\Database\Factories\LinkFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'url',
        'title',
        'description',
        'preview_image',
        'source_domain',
        'status',
        'processing_status',
        'views_count',
        'last_viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'last_viewed_at' => 'datetime',
        ];
    }

    /**
     * L'auteur du lien.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Les catégories associées au lien.
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }
}
