# Attendance System - NextJS + NestJS

Complete restructure of the PHP Attendance System into a modern TypeScript architecture.

## Project Structure

```
attendance/
├── backend/           # NestJS API Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── attendance/     # Attendance processing module
│   │   │   └── employees/      # Employee CRUD module
│   │   ├── database/           # PostgreSQL connection
│   │   └── config/             # Configuration constants
│   └── package.json
│
└── frontend/          # NextJS Web Application
    ├── src/
    │   ├── app/                  # NextJS App Router
    │   ├── components/           # React components
    │   ├── services/             # API service layer
    │   └── types/                # TypeScript interfaces
    └── package.json
```

## Prerequisites

- Node.js 18+
- Docker Desktop (for PostgreSQL database)
- npm or yarn

## Setup Instructions

### 1. Start the PostgreSQL database (Docker Desktop)

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on `localhost:5432` and creates the
`attendance_db` database with the full schema and seed data on first boot.

- Database: `attendance_db`
- User / Password: `postgres` / `postgres`
- To reset the database and re-run the init scripts: `docker compose down -v && docker compose up -d`

### 2. Backend Setup

```bash
cd backend
npm install
copy .env.example .env
# Edit .env with your PostgreSQL credentials if you changed them in docker-compose.yml
npm run start:dev
```

Backend will run on http://localhost:3001
API docs available at http://localhost:3001/api/docs

> No PostgreSQL available? Set `USE_MOCK_DB=true` in `backend/.env` to run with
> the in-memory mock database (data is not persisted).

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

## API Endpoints

### Attendance
- `POST /attendance/upload` - Upload CSV file
- `DELETE /attendance/clear` - Clear all data
- `GET /attendance/records` - Get records with pagination
- `GET /attendance/stats` - Get statistics
- `GET /attendance/job-cards` - Get job card data
- `GET /attendance/monthly` - Get monthly report data

### Employees
- `GET /employees` - List all employees
- `GET /employees/:id` - Get single employee
- `POST /employees` - Create employee (with file uploads)
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Health / Auth
- `GET /health` - Liveness/DB check (public, throttled)
- `POST /auth/register` - Create an account (public, rate-limited)
- `POST /auth/login` - Login, returns a JWT (public, rate-limited)

## Security

- **Authentication**: every endpoint except `@Public()` routes requires a valid
  JWT (`Authorization: Bearer <token>`), enforced by a global guard.
- **Passwords**: bcrypt (salted). Legacy unsalted SHA-256 hashes are detected on
  login and transparently upgraded to bcrypt.
- **Rate limiting**: global 60 req/min; auth endpoints limited to 5 req/min.
- **Headers**: `helmet` is enabled (CSP, HSTS, nosniff, frame protection).
- **Error responses**: a global exception filter returns a consistent shape and
  never leaks stack traces in production.
- **API docs** (`/api/docs`): development only - disabled when `NODE_ENV=production`
  or `SWAGGER_ENABLED=false`.
- **Production startup**: the server refuses to start if `JWT_SECRET` is unset or
  still the development default. Generate one with `openssl rand -hex 32`.
- **Uploaded attendance files** are written to `uploads/temp`, are never served
  statically, and stale files are cleaned on startup.

## Audit trail

Every mutating API request (create/update/delete on any module) is written to
the append-only `audit_logs` table with the authenticated actor, target entity,
sanitized request body, and IP. Auth events (register, login, failed login) are
recorded explicitly. Audit writes never fail the request they record, and
password-like fields are stripped before storage.

## Tests

```bash
cd backend
npm test
```

Covers authentication (login, legacy hash migration, registration), the
JWT guard (public bypass, missing/invalid tokens), and the audit trail
(entry shape, secret stripping, failure paths).

## Features Preserved

- CSV upload with delimiter detection
- Attendance statistics (Present/Absent counts)
- Job cards with Friday holiday calculation
- Monthly reports with day-by-day view
- Employee CRUD with image/signature uploads
- Search by name, emp code, or AC number
- Date range filtering
- Print-friendly views

## Database Notes

- The backend uses PostgreSQL (via the `pg` driver).
- Schema is defined in `backend/database/init-postgres.sql` (auto-run by Docker on first boot).
- The `logs` (attendance), `employee_addresses`, `employee_education` and `auth_users`
  tables are also auto-created by the backend on startup if they are missing.
- Upload the CSV files again or copy the existing `attendance_cache.csv` to the backend directory.
