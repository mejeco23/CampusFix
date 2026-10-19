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

The example environment is configured for Gmail SMTP. To send verification and password-reset messages:

1. Enable 2-Step Verification on the Google account that will send CampusFix emails.
2. Create an App Password for CampusFix in that Google account's security settings.
3. Set `MAIL_USERNAME` to the sending Gmail address, `MAIL_PASSWORD` to the App Password, and `MAIL_FROM_ADDRESS` to the same sending address in `backend/.env`.
4. Clear cached Laravel configuration with `php artisan config:clear` from `backend/`.

Never use your regular Google password as `MAIL_PASSWORD`, and do not commit or share `backend/.env`. Keep `APP_URL` pointed at the Laravel API (default `http://127.0.0.1:8000`) and `FRONTEND_URL` pointed at Vite (default `http://127.0.0.1:5173`) so links open the correct app. If email delivery is not configured, the local `log` mailer can be used instead; its messages are written to `backend/storage/logs/laravel.log`.

### Frontend

Open a terminal in the `frontend/` directory and run:

```bash
npm install
npm run dev
```

## Security

Do not commit `.env` files, passwords, API keys, or other sensitive credentials.