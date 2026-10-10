# Task Management Application

A full-stack task management application with a React + TypeScript frontend and a Node.js + Express + TypeScript backend. The frontend is deployed on Vercel and the backend on Render.

## Live Demo

- **Frontend:** https://frontend-moxnowq2s-adityasharma736630-2653.vercel.app
- **Backend:** https://task-management-application-1-wg8y.onrender.com

> The backend root URL may return `404` if no route is defined at `/`. Test the actual API endpoints instead.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- API client in `src/api/`
- Vercel

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM (Prisma 7)
- PostgreSQL
- JWT access authentication
- Refresh-token authentication using cookies
- Winston logging with daily log rotation
- Render

## Features

- User registration and login
- Authenticated task management
- Task status tracking
- Task due dates
- Refresh-token session handling
- Logout/session management, where implemented by the backend

> Available features depend on the routes and UI in the current repository.

## Repository Structure

```text
Task-Management-Application/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── backend/
    ├── prisma/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    ├── package.json
    ├── prisma7.config.ts
    └── tsconfig.json
```

Some filenames or folders may differ slightly in the current repository.

## Prerequisites

- Node.js version supported by both packages (the deployed Render service currently runs Node.js 24)
- npm
- PostgreSQL database
- Git

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/adityasharma36/Task-Management-Application.git
cd Task-Management-Application
```

### 2. Configure and run the backend

```bash
cd backend
npm install
```

Create `backend/.env` with the environment variables required by the backend. Example names (confirm exact names and formats against your source code):

```env
DATABASE_URL=your_postgresql_connection_string
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_ISSUER=task-management-api
JWT_AUDIENCE=task-management-client
JWT_REFRESH_EXPIRES_DAYS=7
```

Build and generate the Prisma client using the scripts configured in `backend/package.json`:

```bash
npm run build
npm start
```

For development, use the development script defined in `package.json` (commonly `npm run dev`). If Prisma 7 configuration is in `prisma7.config.ts`, follow that file's datasource/client setup.

### 3. Configure and run the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

If `src/api/client.ts` expects the complete API base path, append the actual prefix (for example `/api/v1`). Check the API client before choosing the value.

Start Vite:

```bash
npm run dev
```

The development URL is usually `http://localhost:5173`.

## Environment Variables

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL used by the Vite frontend |

Vite environment variables are embedded at build time. Configure `VITE_API_URL` in Vercel project settings as well as locally.

### Backend

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | HTTP port; hosting may supply this value |
| `FRONTEND_ORIGIN` | Exact allowed frontend origin for CORS, including `https://` and no trailing slash |
| `JWT_ACCESS_SECRET` | Private secret for signing access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime |
| `JWT_ISSUER` | JWT issuer value |
| `JWT_AUDIENCE` | JWT audience value |
| `JWT_REFRESH_EXPIRES_DAYS` | Refresh-token lifetime in days |

Confirm all variable names and defaults in the backend code. Never expose backend secrets through frontend variables or commit real `.env` files.

## Deployment

### Frontend — Vercel

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- Configure `VITE_API_URL` in Vercel → Project Settings → Environment Variables.

### Backend — Render

- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- Configure the database URL and JWT settings in Render → Service → Environment.
- Set `FRONTEND_ORIGIN` to the exact deployed frontend origin:

```env
FRONTEND_ORIGIN=https://frontend-moxnowq2s-adityasharma736630-2653.vercel.app
```

Configure Express CORS before mounting API routes. Enable credentials if refresh-token authentication uses cookies, and make sure the allowed origin exactly matches the browser's `Origin` header.

## API

Endpoints observed in the deployed frontend include:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`

Check the backend route files for the full endpoint list, HTTP methods, payload schemas, and response formats.

## Git Hygiene

A typical `.gitignore` should exclude generated files and secrets:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
logs/
*.log
.DS_Store
*.tsbuildinfo
coverage/
```

Commit source code, `package.json`, lockfiles, Prisma schema/migrations, and safe `.env.example` files. Never commit real database URLs, JWT secrets, or production credentials.

## Troubleshooting

- **CORS error:** Verify `FRONTEND_ORIGIN` exactly matches the frontend origin, including `https://`.
- **Frontend cannot connect:** Verify `VITE_API_URL`, the API prefix, and backend availability.
- **404 at backend root:** This may be expected if no `/` route exists; test a real API endpoint.
- **Prisma/database errors:** Check `DATABASE_URL`, Prisma configuration, generated client, and migrations.
- **Refresh-cookie issues:** Check `credentials: "include"` (or Axios `withCredentials: true`), CORS credentials, and secure cookie settings for cross-site production requests.

## License

Add a license if you intend to distribute this project publicly.
