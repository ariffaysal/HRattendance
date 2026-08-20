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
- Docker Desktop (running) - provides the PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Start Docker Desktop

Start Docker Desktop and wait until the engine reports **Running** (the whale
icon in the system tray stops animating). Verify the daemon is reachable:

```bash
docker info
```

### 2. Start the PostgreSQL database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container named `attendance-postgres` and creates
the `attendance_db` database with the full schema and seed data on **first** boot.

- Host: `localhost`
- **Port: `5434`** (the container maps to host port 5434 because this machine
  already runs a local PostgreSQL on 5432 and another project's container on
  5433 - adjust the port mapping and `DB_PORT` if yours are different)
- Database: `attendance_db`
- User / Password: `postgres` / `postgres`

Confirm the database is healthy before starting the backend:

```bash
docker compose ps          # status should be "running (healthy)"
```

> **Port 5434 is taken or you prefer another port?** Change the compose
> mapping (e.g. `"5432:5432"`) and set the matching `DB_PORT` in
> `backend/.env`. The init SQL is baked into the image via
> `backend/database/Dockerfile`, so no host file sharing is required.

### 3. Backend Setup

A working `backend/.env` is already committed/created for this machine
(`USE_MOCK_DB=false`, `DB_PORT=5434`). To create one from scratch:

```bash
cd backend
npm install
copy .env.example .env
# Edit .env: set DB_PORT to match docker-compose.yml (5434),
# USE_MOCK_DB=false, and generate a strong JWT_SECRET (`openssl rand -hex 32`)
npm run start:dev
```

Backend will run on http://localhost:3001
API docs available at http://localhost:3001/api/docs

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

### Data persistence & resetting

- All data lives in the named Docker volume `postgres_data`, so **accounts and
  attendance data survive backend and container restarts** (unlike the mock DB).
- Wipe the database and re-run the init scripts from scratch:
  `docker compose down -v && docker compose up -d`

### Development fallback (no Docker)

No Docker/PostgreSQL available? Set `USE_MOCK_DB=true` in `backend/.env` to run
with the in-memory mock database. **Warning:** the mock database is not
persisted - accounts and data disappear when the backend restarts.

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
- `POST /auth/login` - Login, returns a JWT (public, rate-limited)

**There is no public registration.** Accounts are created by an admin only:

### User Management (admin only - `POST /auth/users`, etc.)
- `POST /auth/users` - Create an employee / HR / admin account
- `GET /auth/users` - List all accounts
- `PATCH /auth/users/:id` - Change role or activate/deactivate an account
- `POST /auth/users/:id/reset-password` - Reset an account's password

Each account has a `role` (`admin`, `hr`, or `employee`). The system refuses to
demote or deactivate the last active admin. On first boot (or in mock mode) a
default admin is seeded: employee ID `admin`, password `Admin@123`
(override via `DEFAULT_ADMIN_PASSWORD` in `.env`). Change it after first login.

## Security

- **Authentication**: every endpoint except `@Public()` routes requires a valid
  JWT (`Authorization: Bearer <token>`), enforced by a global guard.
- **Roles**: routes marked `@Roles('admin')` are further protected by a global
  roles guard using the `role` claim embedded in the JWT.
- **Passwords**: bcrypt (salted). Legacy unsalted SHA-256 hashes are detected on
  login and transparently upgraded to bcrypt.
- **Rate limiting**: global 60 req/min; login limited to 5 req/min.
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

- The backend uses PostgreSQL (via the `pg` driver), configured in `backend/.env`.
- Schema is defined in `backend/database/init-postgres.sql`, baked into the
  image by `backend/database/Dockerfile` and auto-run by Docker on first boot.
- The `logs` (attendance), `employee_addresses`, `employee_education`, `auth_users`
  and `audit_logs` tables are also auto-created (and migrated) by the backend on
  startup if they are missing - e.g. when reusing an older volume.
- On first boot a default admin account is seeded: employee ID `admin`,
  password `Admin@123` (override with `DEFAULT_ADMIN_PASSWORD` in `.env`).
  Change it after the first login.
- Upload the CSV files again or copy the existing `attendance_cache.csv` to the backend directory.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `docker: ... daemon is not running` | Start Docker Desktop and wait for the engine to be ready, then re-run `docker compose up -d`. |
| `password authentication failed` or `Connection refused` on start | You're connecting to the wrong PostgreSQL (e.g. a local install on 5432 or another project's container). Run `docker compose up -d`, check `docker compose ps` shows `(healthy)`, and confirm `DB_PORT` in `backend/.env` matches the compose host port (5434). |
| `port is already allocated` | Another service occupies the host port - change the compose mapping and `DB_PORT` in `backend/.env` to a free port (this repo uses 5434). |
| `OCI runtime create failed ... error mounting ... init-postgres.sql` | Docker Desktop on Windows cannot bind-mount a single host file. Re-pull the image so the init SQL is baked in: `docker compose down -v && docker compose up -d --build`. |
| Accounts "disappear" after a restart | You're on the mock DB (`USE_MOCK_DB=true`). Switch to PostgreSQL: `USE_MOCK_DB=false` + `docker compose up -d`. |
