# Wedding Planner

A full-stack wedding planning application built as an npm-workspaces monorepo.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Getting started

1. Copy `.env.example` to `.env` at the repository root. The supplied SQLite URL works as-is.
2. Install dependencies: `npm install`
3. Initialize a new database: `npm run db:init`
4. Start the API and web app: `npm run dev`

The API starts at `http://localhost:3000` and Vite prints the web URL (normally `http://localhost:5173`). The health endpoint is `GET /api/health`.

The seed creates `demo@weddingplanner.test` with password `password123` plus a complete sample wedding.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run API and frontend concurrently in watch mode (both logs remain visible) |
| `npm run build` | Build both applications |
| `npm run typecheck` | Type-check both applications |
| `npm run db:init` | Safely initialize a new SQLite database from the committed migration and seed it |
| `npm run db:migrate` | Apply committed Prisma migrations |
| `npm run db:migrate:dev` | Create a new migration during development |
| `npm test --workspace=@wedding-planner/api` | Initialize an isolated database in `C:/tmp` and run API integration tests |

## API

All non-auth endpoints require `Authorization: Bearer <token>`. Registration creates the user's only wedding automatically. Bodies and URL ids are validated; errors use `{ "error": { "code", "message" } }` (validation errors also include `details`).

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account, wedding, and JWT |
| POST | `/api/auth/login` | Obtain a JWT |
| GET | `/api/auth/me` | Get the authenticated user |
| GET, PUT | `/api/wedding` | Read or update the caller's wedding settings |
| GET, POST | `/api/guests` | List or create guests |
| GET, PUT, DELETE | `/api/guests/:id` | Manage one guest |
| GET, POST | `/api/budget` | List or create budget items |
| GET, PUT, DELETE | `/api/budget/:id` | Manage one budget item |
| GET, POST | `/api/tasks` | List or create tasks |
| GET, PUT, DELETE | `/api/tasks/:id` | Manage one task |

`/api/budget-items` remains available as a compatibility alias. Set `JWT_SECRET` to a long random value and optionally set `FRONTEND_ORIGIN` (defaults to `http://localhost:5173`) for CORS.

## Project layout

```
apps/api/src/modules/  # Express feature modules: routes → controllers → services → Prisma
apps/api/prisma/       # SQLite schema, migrations, seed
apps/web/src/features/ # React feature areas and route pages
```

All wedding-bound access will be scoped to the authenticated user's one-to-one `Wedding` record. The API exposes `/api/wedding` (singular) for wedding settings, alongside CRUD route skeletons for guests, budget items, and tasks.

### SQLite initialization on Windows

Prisma's migration engine can fail with relative SQLite URLs on some Windows/Node 24 environments. `npm run db:init` is the reliable, automated setup command: it resolves the database path, refuses to overwrite an existing file, applies the committed `migration.sql` through Prisma, and runs the seed. To initialize a disposable database, set `DATABASE_URL` to an unused path before running the command.
