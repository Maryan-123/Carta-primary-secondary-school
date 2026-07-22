# CARTA Primary & Secondary School Management System

Complete school management system for CARTA School with:

- `backend/` — Node.js + Express + TypeScript API
- `web/` — React web app for the public website and protected school portal
- `mobile/` — Expo React Native mobile app for student, parent, and teacher access

## Project Structure

```text
SCHOOL MS/
├── backend/
├── web/
└── mobile/
```

## Main Stack

- PostgreSQL
- Node.js
- Express
- TypeScript
- React
- Expo React Native

## Database

- Database name: `school_management`
- Schema: `school_ms`

Use the existing PostgreSQL schema you already created from your SQL file.

## Backend Setup

```powershell
cd "D:\school ms\backend"
npm install
npm run dev
```

Backend default local URL:

```text
http://localhost:5000/api/v1
```

## Web Setup

```powershell
cd "D:\school ms\web"
npm install
npm run dev
```

Build for production:

```powershell
npm run build
```

## Mobile Setup

For Android emulator, the mobile app uses:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api/v1
```

Run mobile:

```powershell
cd "D:\school ms\mobile"
npm install
npx expo start
```

Then press `a` to open Android emulator.

## Recommended Run Order

1. Start PostgreSQL
2. Start backend
3. Start web or mobile

## Build Checks

Backend:

```powershell
cd "D:\school ms\backend"
npm run build
```

Web:

```powershell
cd "D:\school ms\web"
npm run build
```

Mobile:

```powershell
cd "D:\school ms\mobile"
npm run typecheck
npm test
```

## Notes

- The mobile app supports `STUDENT`, `PARENT`, and `TEACHER`
- Other roles should continue using the web portal
- All data access goes through the existing backend API
- Do not connect frontend or mobile directly to PostgreSQL

## Repository

GitHub:

```text
https://github.com/Maryan-123/Carta-primary-secondary-school
```
