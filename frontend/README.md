# Sentinel — RBAC Admin Panel

A production-style, enterprise-grade React frontend for managing Role-Based
Access Control (users, roles, and permissions). Built with Vite, React
Router, Tailwind CSS, and Axios. Ships with a complete mock data/API layer so
it runs standalone, and is structured to drop straight into a Node.js /
Express backend later with minimal changes.

---

## 1. Installation

Requires Node.js 18+.

```bash
npm install
```

## 2. Running the app

```bash
npm run dev
```

The app starts at `http://localhost:5173`. Sign in with one of the demo
accounts shown on the login screen (or below).

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## 3. Demo accounts (mock authentication)

| Email                | Password     | Role    |
|-----------------------|--------------|---------|
| admin@example.com     | Admin123!    | Admin   |
| manager@example.com   | Manager123!  | Manager |
| viewer@example.com    | Viewer123!   | Viewer  |

You can also register a new account from `/register` — it's stored in memory
for the duration of the session.

---

## 4. Project structure

```
src/
├── assets/
├── components/
│   ├── common/        # Button, Input, Select, Modal, ConfirmDialog, Badge,
│   │                   Avatar, Card, StatCard, Pagination, SearchBar,
│   │                   Dropdown, Tabs, Breadcrumb, PageHeader, LoadingSpinner,
│   │                   EmptyState, ErrorState, StatusBadge, RoleBadge,
│   │                   PermissionBadge
│   ├── layout/         # Sidebar, Topbar
│   ├── tables/          # DataTable (sortable, loading + empty states)
│   └── permissions/    # PermissionMatrix (shared module-grouped checkboxes)
│
├── context/
│   ├── AuthContext.jsx     # user, login, register, logout, hasPermission…
│   ├── ToastContext.jsx    # toast notifications
│   └── ThemeContext.jsx    # dark mode, persisted to localStorage
│
├── hooks/
│   ├── useDebounce.js
│   └── usePermission.js
│
├── layouts/
│   └── AppShell.jsx    # Sidebar + Topbar + <Outlet />
│
├── pages/
│   ├── auth/            Login, Register
│   ├── dashboard/        Dashboard
│   ├── users/            Users, UserCreate, UserDetails, UserPermissions,
│   │                     UserPermissionsLookup
│   ├── roles/            Roles, RoleCreate, RoleDetails
│   ├── permissions/       Permissions, PermissionCreate, AssignPermission,
│   │                       RevokePermission
│   ├── profile/          Profile
│   ├── settings/          Settings
│   └── errors/            Unauthorized (401), Forbidden (403), NotFound (404),
│                          ServerError (500)
│
├── routes/
│   ├── AppRoutes.jsx      # all route definitions
│   ├── ProtectedRoute.jsx # redirects to /login if not authenticated
│   ├── PermissionGuard.jsx# route + inline (`<Can>`) permission guard
│   └── RoleGuard.jsx      # role-based route guard
│
├── services/
│   ├── api.js          # Axios instance, JWT header, 401 handling
│   ├── auth.js         # login/register/logout (mock now, swap for real API)
│   ├── user.js
│   ├── role.js
│   └── permission.js
│
├── utils/
│   ├── format.js       # date/number formatting, time-ago, initials
│   └── validators.js   # email validation, password strength
│
├── data/
│   └── mockData.js     # seed users, roles, permissions, activity, stats
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## 5. Available routes

```
/login
/register

/dashboard

/users
/users/create
/users/:id
/users/:id/permissions
/users/lookup/permissions   (search any user, view effective permissions)

/roles
/roles/create
/roles/:id

/permissions
/permissions/create
/permissions/assign
/permissions/revoke

/profile
/settings

/401
/403
/404 (catch-all)
/500
```

---

## 6. Mock authentication

Authentication currently runs entirely against an in-memory mock in
`src/services/auth.js` — no network calls are made. `AuthContext` stores the
logged-in user and a fake JWT in `localStorage` under `rbac_token` /
`rbac_user`, exactly the shape a real backend integration would use.

```js
const { user, isAuthenticated, login, register, logout, hasPermission, hasRole } = useAuth()
```

## 7. Permission system

Permissions are plain strings like `users.view`, `roles.create`,
`permissions.delete`. They're attached to roles, and a user's *effective*
permissions are the union of the permissions of every role they hold (see
`getUserEffectivePermissions` in `services/user.js`).

**Route-level guarding:**

```jsx
<Route
  path="/users/create"
  element={
    <PermissionGuard permission="users.create">
      <UserCreate />
    </PermissionGuard>
  }
/>
```

**Inline UI guarding** (hide a button, disable an action):

```jsx
import { Can } from './routes/PermissionGuard.jsx'

<Can permission="users.delete">
  <Button variant="danger">Delete</Button>
</Can>
```

**Role-based guarding** (`RoleGuard`) works the same way, using
`roles={['Admin', 'Manager']}`.

> ⚠️ **Important:** all of the above is UI/UX convenience only. It hides or
> disables affordances the current user shouldn't use, but it does **not**
> replace server-side authorization. Your Express backend must independently
> verify every request against the user's real permissions.

---

## 8. Connecting to your Node.js / Express backend

Every data operation goes through `src/services/*.js`, and each function is
already written with two branches:

```js
export async function getUsers(params) {
  if (USE_MOCKS) {
    // in-memory mock implementation
  }
  const { data } = await api.get('/users', { params })
  return data
}
```

To switch over:

1. Set `VITE_API_URL` in a `.env` file (copy `.env.example`) to point at your
   Express server, e.g. `VITE_API_URL=http://localhost:4000/api`.
2. Open `src/services/api.js` and set `export const USE_MOCKS = false`.
3. Implement matching REST endpoints on your backend. The expected shapes are
   documented by the mock branches themselves — e.g. `GET /users` should
   accept `page`, `pageSize`, `search`, `status`, `role` query params and
   return `{ items, total, page, pageSize }`.
4. On login, your backend should return `{ user, token }`, where `token` is a
   JWT. The Axios instance in `api.js` already attaches
   `Authorization: Bearer <token>` to every request from `localStorage`, and
   automatically redirects to `/login` on a `401` response.

No component code needs to change — everything consumes the `services/*`
functions, not mock data directly.

---

## 9. Environment variables

| Variable        | Description                                   | Default                        |
|------------------|------------------------------------------------|----------------------------------|
| `VITE_API_URL`   | Base URL for the real backend API              | `http://localhost:4000/api`     |

Copy `.env.example` to `.env` and adjust as needed. Never commit `.env` with
real secrets — it's already in `.gitignore`.

---

## 10. Tech stack

- React 18 + Vite 6
- React Router v6
- Tailwind CSS (custom design tokens in `tailwind.config.js`)
- Axios (centralized instance with interceptors)
- Lucide React icons
- Context API for auth / toast / theme state

---

## 11. Notes on design decisions

- **DataTable** is a single reusable component powering Users, Roles, and
  Permissions — sorting, loading skeletons, and empty states are all built
  in, not duplicated per page.
- **PermissionMatrix** is shared by Create Role, Assign Permissions, and
  (in a simplified form) Revoke Permissions, so the module-grouped checkbox
  UI only exists once.
- Dark mode is available via the sun/moon toggle in the topbar and persists
  across reloads.
- All destructive actions (delete user, delete role, revoke permissions) go
  through `ConfirmDialog` before executing.



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
