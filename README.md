# Wedding Planner

Wedding Planner is a full-stack npm-workspaces application with a React/Vite frontend, Express REST API, Prisma, and SQLite.

## Quick Start

Prerequisites: Node.js 20+ and npm.

```bash
git clone https://github.com/kozakmarian/WeddingPlanner.git
cd WeddingPlanner
npm install
```

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Then initialize the database and start the application:

```bash
npm run db:init
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

`db:init` automatically creates a fresh SQLite database, applies the committed migrations, and loads demonstration data. It never resets or overwrites an existing database.

## Demo account

- Email: `demo@weddingplanner.test`
- Password: `password123`

## Available commands

| Command                                     | Purpose                                                          |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                               | Run the API and frontend concurrently in development mode.       |
| `npm run build`                             | Build both workspaces for production.                            |
| `npm run typecheck`                         | Type-check both workspaces.                                      |
| `npm run format:check`                      | Check formatting with Prettier.                                  |
| `npm run format`                            | Format project files with Prettier.                              |
| `npm run db:init`                           | Create a fresh database, apply migrations, and load demo data.   |
| `npm run db:migrate`                        | Apply committed migrations to an existing database.              |
| `npm run db:migrate:dev`                    | Create and apply a Prisma migration during development.          |
| `npm run db:generate`                       | Generate the Prisma client.                                      |
| `npm run db:seed`                           | Run the Prisma demo-data seed.                                   |
| `npm test --workspace=@wedding-planner/api` | Run backend integration tests using an isolated SQLite database. |
| `npm test --workspace=@wedding-planner/web` | Run frontend unit tests.                                         |

## REST API

API base URL: `http://localhost:3000/api`. All endpoints except authentication require `Authorization: Bearer <token>`.

| Method           | Endpoint         | Description                      |
| ---------------- | ---------------- | -------------------------------- |
| POST             | `/auth/register` | Create an account and wedding.   |
| POST             | `/auth/login`    | Obtain a JWT.                    |
| GET              | `/auth/me`       | Get the authenticated user.      |
| GET, PUT         | `/wedding`       | Read or update wedding settings. |
| GET, POST        | `/guests`        | List or create guests.           |
| GET, PUT, DELETE | `/guests/:id`    | Manage a guest.                  |
| GET, POST        | `/budget`        | List or create budget items.     |
| GET, PUT, DELETE | `/budget/:id`    | Manage a budget item.            |
| GET, POST        | `/tasks`         | List or create tasks.            |
| GET, PUT, DELETE | `/tasks/:id`     | Manage a task.                   |

`/budget-items` is available as a compatibility alias.

## Project structure

```text
apps/api/src/       Express API modules, validation, and middleware
apps/api/prisma/    Prisma schema, migrations, and seed
apps/api/tests/     API integration tests
apps/web/src/       React application and feature pages
apps/web/tests/     Frontend unit tests
```

## Database migrations

Use `npm run db:init` only for a new database. For an existing database, run `npm run db:migrate`; it applies migrations without reseeding or deleting data. Use `npm run db:migrate:dev` only when developing a new schema migration.

## Troubleshooting

- Ensure `.env` is copied from `.env.example`; `VITE_API_URL` must include `/api`.
- The frontend runs on `http://localhost:5173`; the API runs on `http://localhost:3000`.
- On Windows, use `npm run db:init` for fresh SQLite setup. It resolves the database path, creates the file safely, and avoids relative-path issues that can occur with Prisma on some Windows/Node environments.
