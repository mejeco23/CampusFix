# CampusFix

CampusFix is a campus maintenance request and monitoring system designed to help students and staff report damaged or malfunctioning campus facilities and monitor repair progress.

## Technologies Used

- **Frontend:** React, Vite, JavaScript
- **Backend:** Laravel, PHP
- **Database:** MySQL

## Project Structure

- `backend/` — Laravel backend application and API
- `frontend/` — React frontend application

## Features

- User registration and login
- Maintenance request management
- Request status tracking
- Dashboard for monitoring requests

## Development Setup

### Backend

Open a terminal in the `backend/` directory and install the PHP dependencies:

```bash
composer install
```

Create `backend/.env` from `backend/.env.example`, then configure your local database.

For a fresh clone, generate the app key and run the migrations:

```bash
php artisan key:generate
php artisan migrate
```

To create an admin account in your local database, set these private values in `backend/.env`:

```dotenv
CAMPUSFIX_SUPER_ADMIN_NAME="Campus Fix Admin"
CAMPUSFIX_SUPER_ADMIN_EMAIL=your-admin-email@example.com
CAMPUSFIX_SUPER_ADMIN_PASSWORD=choose-a-strong-password
```

Then run the seeder from the `backend/` directory:

```bash
php artisan db:seed --class=SuperAdminSeeder
```

Do not commit `backend/.env` or share its password through GitHub. Each group member using a separate local database must seed their own admin account. To use the same account, both apps must connect to the same database.

Start the Laravel development server:

```bash
php artisan serve
```

### Email verification and password resets

The example environment uses `MAIL_MAILER=log` for local development. Verification and password-reset messages are written to `backend/storage/logs/laravel.log` instead of being delivered to an inbox. Configure an SMTP mailer in `backend/.env` to send real email. Keep `APP_URL` pointed at the Laravel API (default `http://127.0.0.1:8000`) and `FRONTEND_URL` pointed at Vite (default `http://127.0.0.1:5173`) so links open the correct app.

### Frontend

Open a terminal in the `frontend/` directory and run:

```bash
npm install
npm run dev
```

## Security

Do not commit `.env` files, passwords, API keys, or other sensitive credentials.