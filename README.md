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

The seed creates `demo@weddingplanner.test` with password `password123` plus a complete sample wedding. Authentication and CRUD behaviour are intentionally scaffolded for the next implementation phase.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run API and frontend in watch mode |
| `npm run build` | Build both applications |
| `npm run typecheck` | Type-check both applications |
| `npm run db:init` | Safely initialize a new SQLite database from the committed migration and seed it |
| `npm run db:migrate` | Apply committed Prisma migrations |
| `npm run db:migrate:dev` | Create a new migration during development |

## Project layout

```
apps/api/src/modules/  # Express feature modules: routes → controllers → services → Prisma
apps/api/prisma/       # SQLite schema, migrations, seed
apps/web/src/features/ # React feature areas and route pages
```

All wedding-bound access will be scoped to the authenticated user's one-to-one `Wedding` record. The API exposes `/api/wedding` (singular) for wedding settings, alongside CRUD route skeletons for guests, budget items, and tasks.

### SQLite initialization on Windows

Prisma's migration engine can fail with relative SQLite URLs on some Windows/Node 24 environments. `npm run db:init` is the reliable, automated setup command: it resolves the database path, refuses to overwrite an existing file, applies the committed `migration.sql` through Prisma, and runs the seed. To initialize a disposable database, set `DATABASE_URL` to an unused path before running the command.
