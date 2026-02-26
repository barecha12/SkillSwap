# SkillSwap | Web-Based Skill Exchange Platform

SkillSwap is a premium web platform where users exchange skills instead of money. "Learn what you want by teaching what you know."

## 🚀 Getting Started

### 1. Requirements
* PHP 8.2+
* Composer
* Node.js & npm
* MySQL (via XAMPP)

### 2. Backend Setup (Laravel)
1. Open XAMPP and start **Apache** and **MySQL**.
2. Open a terminal in `backend/`:
   ```bash
   cd backend
   composer install
   php artisan migrate --seed
   php artisan serve
   ```
   *Note: Ensure the `skillswap` database exists in MySQL.*

### 3. Frontend Setup (React)
1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🛠️ Tech Stack
* **Frontend**: React, Vite, Lucide Icons, Axios, React Hot Toast.
* **Backend**: Laravel 11, Sanctum (Auth), MySQL.
* **Design**: Custom Vanilla CSS with Glassmorphism and Dark Mode.

## 🔑 Demo Credentials
* **Admin**: `admin@skillswap.com` / `password`
* **Demo User**: `john@example.com` / `password`

## ✨ Core Features
* **Authentication**: Secure login/register with roles.
* **Skill Matching**: Smart algorithm suggesting users offering what you want.
* **Messaging**: Real-time chat (polling) for swap negotiations.
* **Swap System**: Request, Accept/Reject, and Complete swaps.
* **Rating System**: Build reputation scores after successful swaps.
* **Notifications**: Integrated alerts for requests, messages, and status updates.
* **Admin Panel**: Full control over users, skills, and platform statistics.
