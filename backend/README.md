# Task Tracker — Backend

A REST API for a small task tracker with JWT authentication and two roles
(`user`, `admin`). Users can manage their own tasks; admins can see and
manage everyone's.

## Stack

- **Node.js + Express** — HTTP layer
- **TypeORM + SQLite** (via `better-sqlite3`) — data layer, zero external
  services to set up
- **bcryptjs** — password hashing
- **jsonwebtoken** — auth tokens
- **express-validator** — request validation
- **Jest + Supertest** — unit and API tests

## Project structure

```
src/
  app.js               Express app (routes + middleware wired up)
  server.js             Entry point: connects the DB, then starts listening
  config/
    data-source.js       TypeORM connection config
  entities/
    User.js, Task.js     TypeORM entity schemas
  middleware/
    auth.js               JWT verification + role guard
    validate.js            Runs express-validator chains, formats errors
    errorHandler.js         Central error handler + 404 handler
  controllers/
    auth.controller.js     register / login
    user.controller.js     profile, admin user management
    task.controller.js     task CRUD with ownership rules
  routes/                 Express routers, one per resource
  scripts/
    makeAdmin.js            CLI script to promote a user to admin
tests/
  setup.js                Shared in-memory DB setup for tests
  jwt.unit.test.js
  authMiddleware.unit.test.js
  auth.api.test.js
  task.api.test.js
```

## Setup

```bash
npm install
cp .env.example .env      # edit JWT_SECRET before using this for real
npm start                  # runs on http://localhost:5000 by default
```

The SQLite database file is created automatically on first run at the path
set by `DATABASE_PATH` (defaults to `./data/database.sqlite`).

## Running tests

```bash
npm test
```

Tests run against an in-memory SQLite database (see `tests/setup.js`), so
they never touch your real data file.

## Creating an admin

There's no public endpoint to become an admin — that's intentional. Register
a normal account first, then promote it from the command line:

```bash
npm run make-admin -- your-email@example.com
```

## API reference

All request/response bodies are JSON. Protected routes require
`Authorization: Bearer <token>`.

### Auth

| Method | Route            | Body                             | Notes                     |
|--------|------------------|-----------------------------------|----------------------------|
| POST   | `/auth/register` | `name, email, password (min 6)`   | New accounts are always `user` role |
| POST   | `/auth/login`    | `email, password`                 | Returns a JWT              |

### Users

| Method | Route        | Auth        | Notes                                  |
|--------|--------------|-------------|------------------------------------------|
| GET    | `/users/me`  | any user    | Your own profile                         |
| GET    | `/users`     | admin only  | List every user                          |
| DELETE | `/users/:id` | admin only  | Can't delete your own account            |

### Tasks

| Method | Route        | Auth      | Notes                                                      |
|--------|--------------|-----------|--------------------------------------------------------------|
| POST   | `/tasks`     | any user  | `title` required, `status` optional (`pending`/`completed`)  |
| GET    | `/tasks`     | any user  | Admin sees every task; a regular user sees only their own    |
| PUT    | `/tasks/:id` | any user  | Only the owner or an admin can update; others get 404         |
| DELETE | `/tasks/:id` | any user  | Same ownership rule as update                                  |

A non-owner gets a **404**, not a 403, on someone else's task — this avoids
confirming that a given task ID exists to a user who isn't allowed to see it.

### Errors

Validation failures return:

```json
{ "message": "Validation failed", "errors": [{ "field": "email", "message": "A valid email is required" }] }
```

All other errors return `{ "message": "..." }` with an appropriate status
code (401, 403, 404, 409, 500).

## Sample requests

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ankush","email":"ankush@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ankush@example.com","password":"password123"}'

# Create a task (replace $TOKEN with the token from login/register)
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Finish assignment","description":"Backend + frontend"}'

# List your tasks
curl http://localhost:5000/tasks -H "Authorization: Bearer $TOKEN"

# Update a task
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE http://localhost:5000/tasks/1 -H "Authorization: Bearer $TOKEN"
```

## Design notes

- **Why TypeORM over Prisma:** Prisma's CLI needs to download query-engine
  binaries at install/generate time. TypeORM with `better-sqlite3` needs
  nothing beyond `npm install`, which made it the more reliable choice here.
- **Ownership checks live in the controller**, not the route, since "is this
  admin or the owner" needs the fetched row to decide.
- **`synchronize: true`** on the TypeORM data source auto-creates tables from
  the entities — fine for a project this size; a production app would use
  migrations instead.
