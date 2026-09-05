# Evotec Full-Stack Form Management App

Full-stack web application for the Evotec Software Developer technical assignment: JWT authentication with role-based access, customer form submissions, and an admin dashboard with filter/search.

## Tech stack

- **Frontend:** React + Vite + TypeScript, React Router, Ant Design
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB Atlas with Mongoose
- **Auth:** bcrypt password hashing, JWT access + refresh tokens
- **Hosting:** Vercel (static Vite app + Express as a serverless `/api` function)

## Project structure

```
evotec/
  api/           Vercel serverless entry (wraps Express)
  backend/       Express API (local + shared with Vercel)
  frontend/      Vite React app
  vercel.json    Vercel build + rewrites
```

## Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster
- Vercel account (for production)

## Environment variables

Copy `backend/.env.example` to `backend/.env` for local development:

| Variable | Description |
|----------|-------------|
| `PORT` | Local API port (default `5000`) — not used on Vercel |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens (use a long random string in prod) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRES` | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token lifetime (e.g. `7d`) |
| `SEED_ADMIN_EMAIL` | Admin email created on first boot |
| `SEED_ADMIN_PASSWORD` | Password for the seeded admin |
| `CORS_ORIGIN` | Comma-separated allowed origins (local + your frontend Vercel URL) |
| `VITE_API_URL` | **Frontend only (Vercel):** backend URL, e.g. `https://evotec-backend.vercel.app` (leave empty locally) |

## MongoDB Atlas Network Access (required)

1. Open [MongoDB Atlas](https://cloud.mongodb.com/) → **Network Access**
2. **Add IP Address**
3. For **local**: add your current IP  
   For **Vercel**: add `0.0.0.0/0` (Allow Access from Anywhere) — Vercel uses dynamic IPs
4. Wait about a minute, then restart / redeploy

## Setup & run locally

From the repo root (npm workspaces):

```bash
npm install
cp backend/.env.example backend/.env   # then edit values
```

Terminal 1 — API:

```bash
npm run dev:backend
```

Terminal 2 — UI:

```bash
npm run dev:frontend
```

- App: `http://localhost:5173` (Vite proxies `/api` → `http://localhost:5000`)
- API: `http://localhost:5000`

## Deploy to Vercel (production)

You can deploy **frontend** and **backend** as two Vercel projects (recommended if you already have `evotec-backend`).

### Backend project

- Root Directory: `backend` (or repo root with `api/` serverless entry — match how you already deploy)
- Env vars: `MONGODB_URI`, `JWT_*`, `SEED_ADMIN_*`, and:

```text
CORS_ORIGIN=https://YOUR-FRONTEND.vercel.app,http://localhost:5173
```

### Frontend project

- Root Directory: `frontend`
- Build: `npm run build` / Output: `dist`
- Env var (Production):

```text
VITE_API_URL=https://evotec-backend.vercel.app
```

Redeploy the frontend after setting `VITE_API_URL` (Vite bakes it in at build time).

### CLI (optional)

```bash
npx vercel login
npx vercel        # preview
npx vercel --prod # production
```

## Default seeded admin

- Email: value of `SEED_ADMIN_EMAIL` (default `admin@evotec.local`)
- Password: value of `SEED_ADMIN_PASSWORD`

## API endpoints

### Auth

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/customer/register` | Public | Register customer (`email`, `password`, `confirmPassword`) |
| POST | `/api/auth/customer/login` | Public | Customer login → access + refresh JWT |
| POST | `/api/auth/admin/login` | Public | Admin login → access + refresh JWT |
| POST | `/api/auth/admin/create` | ADMIN | Create admin; returns `generatedPassword` |
| POST | `/api/auth/refresh` | Public | Exchange refresh token for new token pair |

### Forms

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/forms` | CUSTOMER | Submit application form |
| GET | `/api/forms?gender=&search=` | ADMIN | List submissions (optional gender filter, name search) |
| PUT | `/api/forms/:id` | ADMIN | Update submission |
| DELETE | `/api/forms/:id` | ADMIN | Delete submission |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

All protected routes require `Authorization: Bearer <accessToken>`.

### Form body fields

`firstName`, `lastName`, `email`, `gender` (`MALE` \| `FEMALE` \| `OTHER`), `mobileNumber` (Sri Lankan: `07XXXXXXXX` or `+947XXXXXXXX`), `address`, optional `feedback`.

## Frontend pages

| Route | Description |
|-------|-------------|
| `/` | Home / landing |
| `/register` | Customer registration |
| `/login` | Customer login |
| `/application` | Customer application form (protected) |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Admin submissions table (protected) |

## Submission

Share your GitHub repository link with: **contact@evotec.software**
