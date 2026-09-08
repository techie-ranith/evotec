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
  backend/            Express API (+ Vercel serverless in backend/api)
  frontend/           Vite React app
  db/init/            PostgreSQL init SQL (Docker)
  docker-compose.yml  Local PostgreSQL container
```

## Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (used by the running API today)
- Docker Desktop (optional — for local PostgreSQL)

## Local PostgreSQL with Docker

The API currently uses **MongoDB Atlas**. This Compose setup provides a local **PostgreSQL 16** database (schema in `db/init/`) if you want Postgres for development or a future migration.

```bash
# start
docker compose up -d

# check health
docker compose ps
docker exec evotec-postgres pg_isready -U evotec -d evotec

# stop (keep data)
docker compose down

# stop and wipe data
docker compose down -v
```

Defaults (override via a root `.env` — see `.env.docker.example`):

| Setting | Value |
| ------- | ----- |
| Host / port | `localhost:5432` |
| User | `evotec` |
| Password | `evotec_secret` |
| Database | `evotec` |
| URL | `postgresql://evotec:evotec_secret@localhost:5432/evotec` |

Init scripts under `db/init/` create `users` and `form_submissions` tables on **first** container start only.

## Environment variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` for local development:


| Variable              | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `PORT`                | Local API port (default `5000`) — not used on Vercel               |
| `MONGODB_URI`         | MongoDB connection string                                          |
| `JWT_ACCESS_SECRET`   | Secret for access tokens (use a long random string in prod)        |
| `JWT_REFRESH_SECRET`  | Secret for refresh tokens                                          |
| `JWT_ACCESS_EXPIRES`  | Access token lifetime (e.g. `15m`)                                 |
| `JWT_REFRESH_EXPIRES` | Refresh token lifetime (e.g. `7d`)                                 |
| `SEED_ADMIN_EMAIL`    | Admin email created on first boot                                  |
| `SEED_ADMIN_PASSWORD` | Password for the seeded admin                                      |
| `CORS_ORIGIN`         | Comma-separated allowed origins (local + your frontend Vercel URL) |


### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env` for local development:


| Variable       | Description                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Backend URL, e.g. `https://evotec-backend.vercel.app`. Leave empty locally — Vite proxies `/api` to `http://localhost:5000` |


## MongoDB Atlas Network Access

Network Access is already set to `0.0.0.0/0` (Allow Access from Anywhere). Localhost and Vercel both connect to the database automatically — you do not need to add your IP.

## Run the project

Use two terminals. Copy env files first if you do not already have them:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Leave `VITE_API_URL` empty in `frontend/.env` for local use.

### Backend

```bash
cd backend
npm i
npm run dev
```

- `npm run dev` — start the API in development ([http://localhost:5000](http://localhost:5000))
- `npm run build` — compile TypeScript
- `npm start` — run the compiled API (`dist/`)

### Frontend

```bash
cd frontend
npm i
npm run dev
```

- `npm run dev` — start the UI in development ([http://localhost:5173](http://localhost:5173))
- `npm run build` — production build (`dist/`)

Vite proxies `/api` to `http://localhost:5000` while you develop.

## Hosted application

- **Frontend:** [https://evotec-frontend.vercel.app](https://evotec-frontend.vercel.app)
- **Backend:** [https://evotec-backend.vercel.app](https://evotec-backend.vercel.app)

## Default seeded admin

Use these credentials on the hosted app or locally (`/admin/login`):

- **Email:** `admin@evotec.local`
- **Password:** `Admin123!`

## API endpoints

### Auth


| Method | Path                          | Access | Description                                                |
| ------ | ----------------------------- | ------ | ---------------------------------------------------------- |
| POST   | `/api/auth/customer/register` | Public | Register customer (`email`, `password`, `confirmPassword`) |
| POST   | `/api/auth/customer/login`    | Public | Customer login → access + refresh JWT                      |
| POST   | `/api/auth/admin/login`       | Public | Admin login → access + refresh JWT                         |
| POST   | `/api/auth/admin/create`      | ADMIN  | Create admin; returns `generatedPassword`                  |
| POST   | `/api/auth/refresh`           | Public | Exchange refresh token for new token pair                  |


### Forms


| Method | Path                         | Access   | Description                                            |
| ------ | ---------------------------- | -------- | ------------------------------------------------------ |
| POST   | `/api/forms`                 | CUSTOMER | Submit application form                                |
| GET    | `/api/forms?gender=&search=` | ADMIN    | List submissions (optional gender filter, name search) |
| PUT    | `/api/forms/:id`             | ADMIN    | Update submission                                      |
| DELETE | `/api/forms/:id`             | ADMIN    | Delete submission                                      |


### Health


| Method | Path          | Description  |
| ------ | ------------- | ------------ |
| GET    | `/api/health` | Health check |


All protected routes require `Authorization: Bearer <accessToken>`.

### Form body fields

`firstName`, `lastName`, `email`, `gender` (`MALE`  `FEMALE`  `OTHER`), `mobileNumber` (Sri Lankan: `07XXXXXXXX` or `+947XXXXXXXX`), `address`, optional `feedback`.

## Frontend pages


| Route              | Description                           |
| ------------------ | ------------------------------------- |
| `/`                | Home / landing                        |
| `/register`        | Customer registration                 |
| `/login`           | Customer login                        |
| `/application`     | Customer application form (protected) |
| `/admin/login`     | Admin login                           |
| `/admin/dashboard` | Admin submissions table (protected)   |


