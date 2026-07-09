# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a monorepo with two independent sub-projects, each with its own `package.json`, `node_modules`, and git history:

- `api/` — NestJS 11 REST API (TypeScript, PostgreSQL + TypeORM, Redis, Cloudinary)
- `rct/` — React 19 frontend (Create React App, Redux, MUI) — has its own `rct/CLAUDE.md` with detailed frontend guidance

All commands below must be run from inside the relevant sub-directory.

---

## `api/` — NestJS backend

### Commands

```bash
cd api

npm run start:dev      # dev server with file-watch (port 3001)
npm run build          # compile to dist/
npm run start:prod     # run compiled output
npm run lint           # ESLint --fix
npm run format         # Prettier --write
npm test               # Jest unit tests (rootDir: src, *.spec.ts)
npm run test:e2e       # e2e tests (test/jest-e2e.json)
npm run test:cov       # coverage report

# Run a single test file
npx jest src/auth/auth.service.spec.ts

# Start Redis locally (required for dev)
docker-compose up -d   # spins up redis:alpine on port 6379
```

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `PORT` | API listen port (default 3001) |
| `DB_HOST/PORT/USERNAME/PASSWORD/NAME` | PostgreSQL connection |
| `JWT_SECRET` | Access token secret (1 min expiry) |
| `JWT_REFRESH` | Refresh token secret (5 day expiry) |
| `CORS_ORIGIN` | Allowed frontend origin |
| `REDIS_HOST/PORT/PASSWORD` | Redis connection |
| `CLOUDINARY_*` | Image storage credentials |

`TypeORM` runs with `synchronize: true` — schema is auto-migrated on every start. Do not use manual migrations unless this is changed.

### Architecture

**Modules:** `User`, `Auth`, `Token`, `Product`, `Cart`, `Order`, `Redis`, `Cloudinary`. Each follows the standard NestJS module pattern (module / controller / service / entities / dto).

**Auth & token flow:**
- `POST /auth/register` and `POST /auth/login` return `{ access_token, refresh_token, user }`.
- Access token: JWT signed with `JWT_SECRET`, expires in **1 minute**.
- Refresh token: JWT signed with `JWT_REFRESH`, expires in **5 days**. A bcrypt hash of it is stored in Redis under key `{userId}:token` with a matching TTL. On refresh, the raw token is compared against the stored hash — the stored value is replaced on every refresh.
- Guards: `JwtAuthGuard` (passport-jwt strategy, validates `Authorization: Bearer` header) + `RolesGuard` (reads `@Role('admin')` decorator from the handler). Both guards are applied together wherever role protection is needed.
- `POST /token/refresh` reads the refresh token from the `refreshToken` cookie.

**Redis usage:**
- Cart is stored entirely in Redis (`cart:{userId}`, TTL 7 days) — there is no DB table for cart.
- Product list/detail responses are cached in Redis (`products:list:*`, `product:{id}`, TTL 5 min). Writes/deletes invalidate the relevant keys.
- Refresh tokens are stored in Redis, not in the database.

**Product & image flow:**
- `POST /product` and `PATCH /product/:id` accept `multipart/form-data` with an optional `file` field.
- `CloudinaryService` handles upload (`uploadFile`) and deletion (`deleteFile`). On product update, the old Cloudinary image is deleted before uploading the new one.
- Only the product owner or an admin can update/delete a product.

**Order flow:**
- `POST /order` creates an order from the current user's Redis cart: validates stock, snapshots title/price into `OrderItem` rows, decrements `product.stock`, then clears the cart.
- Order cancellation restores stock. Delivered orders cannot be cancelled.
- `GET /order/admin/all` and status updates are admin-only.

**Role enforcement:**
- `UserRole` enum: `'user'` | `'admin'`.
- `RolesGuard` compares `request.user.role` (set by JWT strategy) against the `@Role()` decorator value. No role decorator = public to authenticated users.

**Path aliases:** `tsconfig.json` defines `"paths": { "src/*": ["src/*"] }` — use `src/...` absolute imports throughout, not relative `../..` chains.

**Code comments** in the existing codebase are in Russian — match that when adding comments to files that already use Russian.

---

## `rct/` — React frontend

See `rct/CLAUDE.md` for detailed frontend guidance. Quick reference:

```bash
cd rct
npm start        # CRA dev server (port 3000)
npm run build    # production build
npm test -- --watchAll=false   # single Jest run
```

`REACT_APP_API_URL` in `rct/.env` must point to the running `api/` server.
