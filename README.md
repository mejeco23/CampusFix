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

CampusFix sends email verification and password-reset messages through the Brevo Transactional Email API; it does not require SMTP. Set these environment variables in `backend/.env` locally and in the Render backend service:

| Variable | Purpose |
| --- | --- |
| `BREVO_API_KEY` | Private Brevo API key. Keep it on the backend; never use a `VITE_` variable. |
| `MAIL_FROM_ADDRESS` | Email address for a sender verified in Brevo. |
| `MAIL_FROM_NAME` | Sender display name, for example `CampusFix`. |
| `APP_URL` | Public base URL of the Laravel backend, used to create signed verification links. |
| `FRONTEND_URL` | Public base URL of the React app, used by verification redirects and reset links. |
| `AUTH_VERIFICATION_EXPIRE` | Verification-link lifetime in minutes; defaults to `60`. |

In Brevo, configure and verify the sender address used for `MAIL_FROM_ADDRESS`. Set `APP_URL` and `FRONTEND_URL` to the deployed service URLs in Render, without a trailing slash. After changing Render environment variables, redeploy and ensure any Laravel configuration cache is regenerated with the deployed environment values. Locally, run `php artisan config:clear` from `backend/` after changing `.env`.

Do not commit or share `backend/.env` or the Brevo API key.

### Frontend

Open a terminal in the `frontend/` directory and run:

```bash
npm install
npm run dev
```

## Security

Do not commit `.env` files, passwords, API keys, or other sensitive credentials.