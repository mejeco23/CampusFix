# CampusFix

CampusFix is split into a Laravel API backend and a React frontend.

## Folders

- `backend/` - Laravel 12 application, API, migrations, and tests.
- `frontend/` - React 19 and Vite application.
- `CampusFix.code-workspace` - VS Code workspace for the complete project.

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the file map.

## Setup

Install PHP/Composer dependencies from `backend/`:

```text
cd backend
composer install
```

If this is a fresh setup, copy `backend/.env.example` to `backend/.env`, configure the database, then run:

```text
php artisan key:generate
php artisan migrate
php artisan storage:link
```

Install frontend dependencies from the project root:

```text
npm --prefix frontend install
```

## Development

From the project root:

```text
npm run dev:all
```

This starts the API at `http://127.0.0.1:8000` and Vite at `http://127.0.0.1:5173`.

You can also start them separately with `npm run dev:api` and `npm run dev`.

## Checks

```text
npm run build
npm test
```
