<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['user_id', 'category_id', 'skill_name', 'description', 'type', 'level'];

    public function user()
    {
        return $this->belongsTo(User::class)->with('profile');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function offeredInRequests()
    {
        return $this->hasMany(SwapRequest::class, 'offered_skill_id');
    }

    public function requestedInRequests()
    {
        return $this->hasMany(SwapRequest::class, 'requested_skill_id');
    }
}
