# Taskflow — React + TypeScript frontend

A responsive task-management UI built with React, TypeScript, Vite, React Router, Axios, and Lucide icons. It includes login/register screens, session restoration via an HttpOnly refresh cookie, access-token refresh, task CRUD, task status filters, search, due-date sorting, and a responsive dashboard.

## Requirements

- Node.js 20.19+ (or a version supported by your installed Vite release)
- The Task Management API running locally or deployed

## Run locally

```bash
npm install
cp .env.example .env
# Edit VITE_API_URL if your backend uses another URL
npm run dev
```

Default API URL: `http://localhost:3002/api/v1`.

## Build / type-check

```bash
npm run typecheck
npm run build
npm run preview
```

## Expected API contract

- `POST /auth/register` body `{ name, email, password }`
- `POST /auth/login` body `{ email, password }`
- `POST /auth/refresh` reads the HttpOnly `refreshToken` cookie and returns `{ data: { accessToken } }`
- `POST /auth/logout` revokes the refresh cookie session
- `GET /users/me` returns a user profile
- `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`

Auth responses should return `{ data: { user, accessToken } }`; the refresh token should be set as an HttpOnly cookie, not returned in JSON. Task list responses can be an array, `{ data: [...] }`, or `{ data: { tasks: [...] } }`. Task mutation responses can return a task directly or in `data`.

## Backend configuration

Configure backend CORS to allow the exact frontend origin and `credentials: true`. For browser auth routes, the backend origin/CSRF check must allow the frontend origin. `VITE_API_URL` is public client configuration only; never put database credentials, JWT secrets, or other server secrets in a `VITE_` variable.

## Folder structure

```text
src/
├── api/            # Axios client, auth and task API calls
├── components/     # Reusable UI and protected route
├── context/        # Authentication state and session restore
├── layouts/        # Sidebar and app shell
├── pages/          # Login/register and dashboard
├── routes/         # React Router definitions
├── types/          # Shared TypeScript types
├── utils/          # Error helpers
├── main.tsx
└── styles.css
```
