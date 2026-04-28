<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug'];

    /**
     * Les liens associés à cette catégorie.
     */
    public function links()
    {
        return $this->belongsToMany(Link::class);
    }
}
