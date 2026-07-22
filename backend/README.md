# School Management Backend

Offline-first Node.js, TypeScript, Express, and PostgreSQL backend for a small school management system.

## Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL with `pg`
- JWT authentication
- bcrypt password hashing
- Zod validation
- Multer uploads
- Jest and Supertest

## Setup

1. Install PostgreSQL.
2. Create the `school_management` database.
3. Run your existing SQL schema file so the `school_ms` schema and tables exist.
4. Copy `.env.example` to `.env` and update values.
5. Install dependencies:

```powershell
npm install
```

6. Create the first administrator:

```powershell
npm run create-admin
```

7. Start development:

```powershell
npm run dev
```

## Build

```powershell
npm run build
npm start
```

## Base URL

`http://localhost:5000/api/v1`

## Health Check

`GET /api/v1/health`

## Documentation

Swagger UI is available at `GET /api/docs`.

## Manual Restore

Use a local PostgreSQL restore command manually. Example on Windows:

```powershell
psql -U postgres -d school_management -f C:\path\to\backup.sql
```

## Important

The development admin password created by the seed or admin script must be changed immediately after first login.
