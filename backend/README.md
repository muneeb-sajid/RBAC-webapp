# Sentinel — RBAC Admin API (Express.js backend)

A standalone Express.js REST API implementing authentication, users, roles,
and permissions for the Sentinel RBAC Admin Panel frontend. Ships with an
in-memory data store seeded with realistic data, so it runs out of the box
with zero external dependencies (no database required) — swap the data layer
for a real database later without touching any route or controller code.

---

## 1. Installation

Requires Node.js 18+.

```bash
npm install
cp .env.example .env
```

## 2. Running the server

```bash
npm run dev     # auto-restarts on file changes (node --watch)
npm start        # plain node
```

The API listens on `http://localhost:4000` by default (configurable via `PORT`
in `.env`). A health check is available at `GET /health`.

## 3. Demo accounts

The same three accounts seeded on the frontend are seeded here too, with real
bcrypt-hashed passwords:

| Email                | Password     | Role    |
|-----------------------|--------------|---------|
| admin@example.com     | Admin123!    | Admin   |
| manager@example.com   | Manager123!  | Manager |
| viewer@example.com    | Viewer123!   | Viewer  |

91 additional filler users are seeded for the Users list (pagination/search
demo data) — they exist in the directory but have no password and cannot log
in, matching the frontend's original mock behavior.

---

## 4. Project structure

```
server.js                    # entry point — inits the store, starts Express
src/
├── app.js                   # Express app: middleware, routes, error handling
├── config/
│   └── env.js                # loads and validates environment variables
├── data/
│   ├── store.js              # in-memory "database" + all query functions
│   ├── seedPermissions.js
│   ├── seedRoles.js
│   └── seedUsers.js
├── middleware/
│   ├── auth.js                # requireAuth — verifies JWT, loads req.user
│   ├── permission.js          # requirePermission('x.y') — RBAC enforcement
│   ├── notFound.js
│   └── errorHandler.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── roleController.js
│   └── permissionController.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── roleRoutes.js
│   └── permissionRoutes.js
└── utils/
    ├── ApiError.js            # typed error class -> consistent JSON errors
    ├── asyncHandler.js        # wraps async route handlers
    └── jwt.js                 # sign/verify helpers
```

---

## 5. API reference

All routes are prefixed with `/api`. Every route except `POST /auth/login`
and `POST /auth/register` requires an `Authorization: Bearer <token>` header.

### Auth

| Method | Route              | Auth | Description                          |
|--------|---------------------|------|----------------------------------------|
| POST   | `/auth/login`        | —    | `{ email, password }` → `{ user, token }` |
| POST   | `/auth/register`     | —    | `{ name, email, password, role? }` → `{ user, token }` |
| POST   | `/auth/logout`       | ✓    | `{ success: true }` |
| GET    | `/auth/me`           | ✓    | Current user + effective permissions |

### Users — requires `users.*` permissions

| Method | Route                     | Permission        |
|--------|----------------------------|--------------------|
| GET    | `/users`                    | `users.view`       |
| POST   | `/users`                    | `users.create`     |
| GET    | `/users/:id`                | `users.view`       |
| PUT    | `/users/:id`                | `users.update`     |
| DELETE | `/users/:id`                | `users.delete`     |
| GET    | `/users/:id/permissions`    | `users.view`       |

`GET /users` accepts `page`, `pageSize`, `search`, `status`, `role` query
params and returns `{ items, total, page, pageSize }`.

### Roles — requires `roles.*` permissions

| Method | Route             | Permission     |
|--------|---------------------|-----------------|
| GET    | `/roles`             | `roles.view`    |
| GET    | `/roles/all/list`    | `roles.view`    |
| POST   | `/roles`             | `roles.create`  |
| GET    | `/roles/:id`         | `roles.view`    |
| PUT    | `/roles/:id`         | `roles.update`  |
| DELETE | `/roles/:id`         | `roles.delete`  |

`GET /roles` accepts a `search` query param and returns `{ items, total }`
with `usersCount`/`permissionsCount` computed per role. `GET /roles/all/list`
returns the raw role array (unpaginated) for populating dropdowns.

### Permissions — requires `permissions.*` permissions

| Method | Route                   | Permission            |
|--------|---------------------------|------------------------|
| GET    | `/permissions`             | `permissions.view`     |
| POST   | `/permissions`             | `permissions.create`   |
| POST   | `/permissions/assign`      | `permissions.update`   |
| POST   | `/permissions/revoke`      | `permissions.update`   |

`GET /permissions` accepts `search`, `module`, `type` query params.
`POST /permissions/assign` and `/revoke` both take `{ roleId, permissionNames }`
and return the updated role.

### Errors

Every error response has the shape:

```json
{ "error": { "message": "..." } }
```

`400` validation errors, `401` missing/expired/invalid token, `403` missing
permission, `404` not found, `409` conflict (duplicate email/name), `500`
unexpected server error.

---

## 6. Connecting the React frontend

1. In the frontend project, copy `.env.example` to `.env` and set:
   ```
   VITE_API_URL=http://localhost:4000/api
   ```
2. Open `src/services/api.js` in the frontend and set:
   ```js
   export const USE_MOCKS = false
   ```
3. Start this backend (`npm run dev`) and the frontend (`npm run dev`) side
   by side. Update `CLIENT_ORIGIN` in this backend's `.env` if your frontend
   runs on a different port than `5173`.

**One known adjustment needed:** the frontend's `getRolesForAssignment()` in
`src/services/permission.js` calls `GET /roles` and expects a raw array back
(this matches its own mock branch, but not the paginated shape this — and
any sane — real `/roles` endpoint returns). Point it at the unpaginated
endpoint instead:

```diff
 export async function getRolesForAssignment() {
   if (USE_MOCKS) { ... }
-  const { data } = await api.get('/roles')
+  const { data } = await api.get('/roles/all/list')
   return data
 }
```

Every other frontend service function matches this backend's response shapes
exactly — no other changes are required.

---

## 7. How authorization works

- `requireAuth` verifies the JWT, loads the user from the store, and computes
  their **effective permissions fresh on every request** (role → permissions
  lookup, plus any direct grants) — so revoking a role's permission takes
  effect immediately on a user's next request, without requiring them to log
  in again.
- `requirePermission('users.create')` is applied per-route in `src/routes/*`
  and returns `403 Forbidden` if the authenticated user lacks it.
- This mirrors the frontend's `hasPermission()` / `<Can>` / `PermissionGuard`
  pattern, but — critically — this is the layer that actually enforces
  authorization. The frontend checks are UI/UX only.

## 8. Data persistence

This backend uses a single in-memory store (`src/data/store.js`) that resets
whenever the process restarts. That's intentional for a drop-in, zero-config
demo backend. To persist data, swap the arrays and functions in `store.js`
for calls to a real database (Postgres + Prisma, MongoDB + Mongoose, etc.) —
every controller only imports functions from that one file, so it's the only
module that needs to change.

## 9. Security notes

- Passwords are hashed with bcrypt (10 salt rounds) — never stored in plain
  text, never returned in any API response (`sanitizeUser` strips
  `passwordHash` before every response).
- `helmet` sets standard security headers; `cors` is locked to
  `CLIENT_ORIGIN`; `express-rate-limit` throttles all `/api` routes.
- JWTs are signed with `JWT_SECRET` — **change this in `.env` before any
  real deployment.** The default in `.env.example` is for local dev only.

┌─────────────────────────────────────────────────────────┐
│                  RBAC Admin Panel                       │
├─────────────────────────────────────────────────────────┤
│                    Frontend Layer                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │           BACKEND LAYER (Embedded)             │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │         Logger Middleware (Core)         │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │         RBAC Middleware                 │  │   │
│  │  │  - Authentication                       │  │   │
│  │  │  - Authorization                        │  │   │
│  │  │  - Role Validation                       │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │         API Routes/Controllers           │  │   │
│  │  │  - User Management                       │  │   │
│  │  │  - Role Management                       │  │   │
│  │  │  - Permission Management                 │  │   │
│  │  │  - Audit Logs                           │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    MongoDB Database                      │
│  - Users Collection                                      │
│  - Roles Collection                                      │
│  - Permissions Collection                                │
│  - Audit Logs Collection                                 │
│  - Sessions Collection                                   │
└─────────────────────────────────────────────────────────┘