<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SwapRequest extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'offered_skill_id',
        'requested_skill_id',
        'status',
        'message'
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id')->with('profile');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id')->with('profile');
    }

    public function offeredSkill()
    {
        return $this->belongsTo(Skill::class, 'offered_skill_id');
    }

    public function requestedSkill()
    {
        return $this->belongsTo(Skill::class, 'requested_skill_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'swap_id');
    }
}
