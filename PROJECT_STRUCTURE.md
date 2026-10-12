# CampusFix Project Layout

The active application is physically split into `backend/` and `frontend/`. Open `CampusFix.code-workspace` to browse both from one VS Code workspace.

## Backend: `backend/`

Laravel 12 API, Sanctum authentication, migrations, tests, and Composer dependencies.

- API routes: `backend/routes/api.php`
- Controllers and models: `backend/app/Http/Controllers/` and `backend/app/Models/`
- Database migrations and seeders: `backend/database/`
- Local environment: `backend/.env`
- Tests: `backend/tests/`
- Run API: `npm run dev:api` from the project root, or `cd backend` then `php artisan serve`
- Run tests: `cd backend` then `php artisan test`

## Frontend: `frontend/`

React 19 and Vite application. Student, admin, and maintenance interfaces are in `frontend/src/`.

- Student request submission and list: `frontend/src/RequestForm.jsx` and `frontend/src/Requests.jsx`
- Admin dashboard: `frontend/src/AdminDashboard.jsx`
- Maintenance dashboard: `frontend/src/MaintenanceDashboard.jsx`
- Shared staff work-order table: `frontend/src/RequestQueueTable.jsx`
- Run frontend: `npm run dev` from the project root
- Build frontend: `npm run build` from the project root
- Run both services: `npm run dev:all` from the project root

## Project root

The root `package.json` orchestrates the backend and frontend commands. `CampusFix.code-workspace` and this document describe the layout. The uploaded `campusfix-team` reference folder is not currently present in the workspace; the maintenance screen has already been adapted to the active app's schema and API.
