<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = ['swap_id', 'rater_id', 'rated_id', 'rating', 'review'];

    public function swap()
    {
        return $this->belongsTo(SwapRequest::class, 'swap_id');
    }

    public function rater()
    {
        return $this->belongsTo(User::class, 'rater_id')->with('profile');
    }

    public function rated()
    {
        return $this->belongsTo(User::class, 'rated_id')->with('profile');
    }
}
