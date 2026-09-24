# Task Tracker — Frontend

A React app for the Task Tracker API: register/login, a dashboard with your
tasks, and — for admins — a view of every user's tasks plus a user list.

## Stack

- **React 19 + Vite** — app shell and dev server
- **React Router** — routing and protected routes
- **Axios** — API client, with a request interceptor that attaches the JWT
  and a response interceptor that logs the user out on a 401
- **Tailwind CSS v4** — styling, via `@tailwindcss/vite`
- **Vitest + React Testing Library** — component and integration tests

## Project structure

```
src/
  api/client.js            Axios instance (base URL from env, JWT injection, 401 handling)
  context/AuthContext.jsx  Current user + login/register/logout, backed by localStorage
  components/
    ProtectedRoute.jsx       Redirects to /login if not authenticated
    Navbar.jsx                Top bar with user info + logout
    TaskForm.jsx               Create-task form with client-side validation
    TaskRow.jsx                 One task: toggle status, inline edit, delete
    StatusBadge.jsx              Pending/Completed pill
    AdminUsers.jsx                Admin-only: list + delete users
  pages/
    Login.jsx, Register.jsx    Auth screens
    Dashboard.jsx                User info + tasks (+ admin tabs for users)
  App.jsx                    Routes
  main.jsx                   Entry point
tests/
  setup.js                        jest-dom matchers for Vitest
  StatusBadge.test.jsx            component test
  TaskForm.test.jsx               component test (validation + submit)
  Login.test.jsx                  component test (API error handling)
  Dashboard.integration.test.jsx  integration test (loads tasks, creates a task, empty & error states)
```

## Setup

```bash
npm install
cp .env.example .env       # point VITE_API_URL at your running backend
npm run dev                 # http://localhost:5173
```

The backend must be running (see its own README) for login/register and the
dashboard to work — this app has no fallback/mock data.

## Environment variables

| Variable       | Purpose                          | Example                 |
|----------------|-----------------------------------|--------------------------|
| `VITE_API_URL` | Base URL of the backend API       | `http://localhost:5000` |

No API keys or secrets live in the frontend — only this one URL, and it's
read from the environment rather than hardcoded, as required.

## Running tests

```bash
npm test
```

10 tests across 4 files: component tests for `StatusBadge`, `TaskForm`, and
`Login`, plus an integration test for `Dashboard` that mocks the API client
and checks loading, success, empty, and error states, and that creating a
task round-trips through the (mocked) API into the rendered list.

## Building for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Notable design decisions

- **Ownership is enforced by the backend, not hidden by the UI.** A regular
  user's `/tasks` response only ever contains their own tasks, so the
  dashboard doesn't need extra client-side filtering for that; the `filter`
  buttons only filter by status.
- **401 handling is centralized** in the Axios response interceptor, so any
  screen making an API call automatically gets logged out and redirected on
  an expired/invalid token, instead of every page having to check for it.
- **The JWT is stored in `localStorage`.** This is the common approach for a
  project like this; the trade-off (XSS exposure vs. the complexity of an
  httpOnly-cookie flow with a Vite dev server on a different origin) is worth
  noting if this were headed to production.
