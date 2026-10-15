# Wedding Planner

Full-stack wedding-planning application built as an npm-workspaces monorepo: React/Vite frontend, Express REST API, and Prisma with SQLite.

## Prerequisites

- Node.js 20 or newer (as specified in `package.json`)
- npm (included with Node.js)

## Installation and database setup

```bash
git clone https://github.com/kozakmarian/WeddingPlanner.git
cd WeddingPlanner
npm install
```

Copy `.env.example` to `.env` in the repository root. The example is ready for local use; change `JWT_SECRET` to a long random value when appropriate. `VITE_API_URL` must include the `/api` suffix.

```bash
npm run db:init
```

`db:init` is for a fresh SQLite database. It creates a new empty database, applies all committed Prisma migrations, and seeds demonstration data. It never resets or overwrites an existing database, so no database tables need to be created manually.

For an existing database, use `npm run db:migrate` instead. It applies committed Prisma migrations (and safely handles the expected legacy database baseline); it does not seed a new database. Do not run `db:init` against an existing database.

## Run the application

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`

The default `.env.example` configures the frontend for this local API URL. The API accepts `FRONTEND_ORIGIN` optionally for CORS (default: `http://localhost:5173`).

## Demo account and seeded data

**Email:** `demo@weddingplanner.test`<br>
**Password:** `password123`

A freshly initialized database includes:

- Wedding — Groom: Marian; Bride: Kristina; date: 2026-10-25; total budget: 20000 EUR
- Guests: 3
- Budget items: 4
- Tasks: 3
- Total expenses: 12095 EUR; remaining budget: 7905 EUR

## Commands

| Command                                     | Purpose                                                              |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                               | Run API and frontend concurrently in development mode.               |
| `npm run db:init`                           | Initialize a fresh SQLite database, migrate it, and seed demo data.  |
| `npm run db:migrate`                        | Apply committed Prisma migrations to an existing database.           |
| `npm test --workspace=@wedding-planner/api` | Run backend integration tests with an isolated database in `C:/tmp`. |
| `npm test --workspace=@wedding-planner/web` | Run frontend unit tests.                                             |
| `npm run typecheck`                         | Type-check both workspaces.                                          |
| `npm run format:check`                      | Check formatting with Prettier.                                      |
| `npm run build`                             | Build both applications for production.                              |

## API

All non-auth endpoints require `Authorization: Bearer <token>`. Registration creates the user's only wedding automatically. Bodies and URL ids are validated; errors use `{ "error": { "code", "message" } }` (validation errors also include `details`).

| Method           | Endpoint             | Description                                  |
| ---------------- | -------------------- | -------------------------------------------- |
| POST             | `/api/auth/register` | Create an account, wedding, and JWT          |
| POST             | `/api/auth/login`    | Obtain a JWT                                 |
| GET              | `/api/auth/me`       | Get the authenticated user                   |
| GET, PUT         | `/api/wedding`       | Read or update the caller's wedding settings |
| GET, POST        | `/api/guests`        | List or create guests                        |
| GET, PUT, DELETE | `/api/guests/:id`    | Manage one guest                             |
| GET, POST        | `/api/budget`        | List or create budget items                  |
| GET, PUT, DELETE | `/api/budget/:id`    | Manage one budget item                       |
| GET, POST        | `/api/tasks`         | List or create tasks                         |
| GET, PUT, DELETE | `/api/tasks/:id`     | Manage one task                              |

`/api/budget-items` remains available as a compatibility alias. Set `JWT_SECRET` to a long random value and optionally set `FRONTEND_ORIGIN` (defaults to `http://localhost:5173`) for CORS.

## Project layout

```
apps/api/src/modules/  # Express feature modules: routes → controllers → services → Prisma
apps/api/prisma/       # SQLite schema, migrations, seed
apps/web/src/features/ # React feature areas and route pages
```

All wedding-bound access will be scoped to the authenticated user's one-to-one `Wedding` record. The API exposes `/api/wedding` (singular) for wedding settings, alongside CRUD route skeletons for guests, budget items, and tasks.

### SQLite initialization on Windows

Prisma's migration engine can fail with relative SQLite URLs on some Windows/Node 24 environments. `npm run db:init` is the reliable, automated setup command: it resolves the database path, creates its parent directory and a new empty SQLite file, refuses to overwrite an existing file, applies the committed migrations through Prisma, and runs the seed. Use `db:init` only for a new database; use `npm run db:migrate` for an existing database. To initialize a disposable database, set `DATABASE_URL` to an unused path before running the command.
