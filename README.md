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

Configure your local environment using `.env.example`, then configure your database.

Start the Laravel development server:

```bash
php artisan serve
```

### Frontend

Open a terminal in the `frontend/` directory and run:

```bash
npm install
npm run dev
```

## Security

Do not commit `.env` files, passwords, API keys, or other sensitive credentials.