<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'user_id'];

    /**
     * L'utilisateur propriétaire de cette catégorie.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Les liens associés à cette catégorie.
     */
    public function links()
    {
        return $this->belongsToMany(Link::class);
    }
}
