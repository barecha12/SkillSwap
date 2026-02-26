<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Category;
use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@skillswap.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        Profile::create(['user_id' => $admin->id, 'bio' => 'Platform Administrator', 'location' => 'Global']);

        // Create categories
        $categories = [
            ['name' => 'Programming', 'icon' => '💻'],
            ['name' => 'Design', 'icon' => '🎨'],
            ['name' => 'Music', 'icon' => '🎵'],
            ['name' => 'Languages', 'icon' => '🌍'],
            ['name' => 'Sports', 'icon' => '⚽'],
            ['name' => 'Cooking', 'icon' => '🍳'],
            ['name' => 'Photography', 'icon' => '📷'],
            ['name' => 'Marketing', 'icon' => '📈'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Create demo users with skills
        $users = [
            ['name' => 'John Doe', 'email' => 'john@example.com', 'offer' => ['Guitar', 'Piano'], 'request' => ['Python', 'React']],
            ['name' => 'Sarah Ahmed', 'email' => 'sarah@example.com', 'offer' => ['Photoshop', 'UI/UX'], 'request' => ['Guitar', 'Spanish']],
            ['name' => 'Ali Hassan', 'email' => 'ali@example.com', 'offer' => ['Python', 'Django'], 'request' => ['Photography', 'Piano']],
            ['name' => 'Emma Wilson', 'email' => 'emma@example.com', 'offer' => ['Spanish', 'French'], 'request' => ['Photoshop', 'Cooking']],
            ['name' => 'Carlos Mendez', 'email' => 'carlos@example.com', 'offer' => ['Photography'], 'request' => ['React', 'Django']],
            ['name' => 'Aisha Noor', 'email' => 'aisha@example.com', 'offer' => ['React', 'Vue.js'], 'request' => ['French', 'UI/UX']],
        ];

        foreach ($users as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            Profile::create([
                'user_id' => $user->id,
                'location' => 'Demo City',
                'bio' => 'Passionate about learning and sharing skills.',
            ]);

            foreach ($u['offer'] as $skillName) {
                Skill::create([
                    'user_id' => $user->id,
                    'skill_name' => $skillName,
                    'type' => 'offer',
                    'level' => 'intermediate',
                    'category_id' => Category::inRandomOrder()->first()->id,
                ]);
            }
            foreach ($u['request'] as $skillName) {
                Skill::create([
                    'user_id' => $user->id,
                    'skill_name' => $skillName,
                    'type' => 'request',
                    'level' => 'beginner',
                    'category_id' => Category::inRandomOrder()->first()->id,
                ]);
            }
        }
    }
}
