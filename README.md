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
│   │   ├── database/           # SQL Server connection
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
- SQL Server (existing from PHP setup)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
copy .env.example .env
# Edit .env with your SQL Server credentials
npm run start:dev
```

Backend will run on http://localhost:3001
API docs available at http://localhost:3001/api/docs

### 2. Frontend Setup

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

## Features Preserved

- CSV upload with delimiter detection
- Attendance statistics (Present/Absent counts)
- Job cards with Friday holiday calculation
- Monthly reports with day-by-day view
- Employee CRUD with image/signature uploads
- Search by name, emp code, or AC number
- Date range filtering
- Print-friendly views

## Migration Notes

The database schema remains unchanged - the new system uses the same SQL Server database as the PHP version. Upload the CSV files again or copy the existing `attendance_cache.csv` to the backend directory.
