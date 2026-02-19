# PixsaLink – Multi-Tenant SaaS (MERN)

License-based multi-tenant SaaS with **Super Admin**, **Company**, and **Direct Client** roles.

## Stack

- **Backend:** Node.js, Express, MongoDB (Atlas), JWT, bcrypt
- **Frontend:** React (Vite), React Router, Axios, Context API

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, PORT
npm install
```

**Create first Super Admin** (no users exist yet):

```bash
# Set in .env or pass inline:
# FIRST_ADMIN_EMAIL=admin@example.com
# FIRST_ADMIN_PASSWORD=yourpassword
node scripts/seedSuperAdmin.js
```

Then start the API:

```bash
npm run dev
```

API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd client
cp .env.example .env
# Optional: set VITE_API_URL=http://localhost:5000/api (default)
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## API Overview

| Area        | Endpoints |
|------------|-----------|
| Auth       | `POST /api/auth/login`, `POST /api/auth/register` (super_admin only), `GET /api/auth/me` |
| Super Admin| `POST/GET /api/admin/companies`, `PUT/DELETE /api/admin/company/:id`, `POST /api/admin/issue-license`, `GET /api/admin/vendors` |
| Vendors    | `POST/GET /api/vendors`, `PUT/DELETE /api/vendors/:id` (company/direct_client, scoped by clientId) |
| Payments   | `POST/GET /api/payments`, `DELETE /api/payments/:id` (vendor balance auto-updated) |

## Roles

- **super_admin:** Manage companies, issue licenses, view all vendors. Cannot manage vendors per tenant.
- **company:** Belongs to a company; can manage vendors and payments for that company (license required).
- **direct_client:** Same as company but scoped to their own user (license required).

## License rules

- Checked at login and on protected vendor/payment routes.
- **Expired** licenses block access.
- **Limited** licenses enforce `maxUsers` (user count for that client).

## Project structure

- `server/`: models, controllers, routes, middleware, config, utils, `server.js`
- `client/src/`: pages, components, layouts, context, services, `App.jsx`
