# Requirements
## FinSight — Technical & Functional Requirements Specification

**Version:** 1.1.0  
**Date:** April 2026

---

## 1. Functional Requirements

### 1.1 Authentication & Sessions

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-AUTH-01 | Users can register with email, password, first name, last name | 201 returned with user object (no password field); email stored lowercase |
| F-AUTH-02 | Users can log in with email + password | 200 with accessToken + refreshToken + user object; 401 on wrong credentials |
| F-AUTH-03 | Access tokens expire in 15 minutes | Expired token returns 401; client automatically attempts refresh |
| F-AUTH-04 | Refresh tokens expire in 7 days | Expired refresh returns 401; user must log in again |
| F-AUTH-05 | Refresh token rotation: each use invalidates the old token | Old token is deleted from Redis; new token issued; old token cannot be reused |
| F-AUTH-06 | Logout invalidates the refresh token | Redis key `refresh:{userId}` deleted on logout; token cannot be reused |
| F-AUTH-07 | Inactive users cannot log in | 403 Forbidden with message "Account is inactive" |
| F-AUTH-08 | Duplicate email registration rejected | 409 Conflict returned |

---

### 1.2 User Management

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-USR-01 | Admin can list all users with pagination | Returns `{ data[], meta: { total, page, limit, totalPages } }` |
| F-USR-02 | Admin can create a user with a specific role | User created; password hashed with bcrypt; role one of VIEWER/ANALYST/ADMIN |
| F-USR-03 | Admin can update a user's role | PATCH /users/:id with `{ role }` updates immediately |
| F-USR-04 | Admin can deactivate or reactivate a user | PATCH /users/:id with `{ isActive: false }` prevents future login |
| F-USR-05 | Any authenticated user can view their own profile | GET /users/me returns user object without password |
| F-USR-06 | Any authenticated user can update their own name | PATCH /users/me accepts `{ firstName, lastName }` |
| F-USR-07 | Any authenticated user can change their password | PATCH /users/me accepts `{ currentPassword, newPassword }`; validates old password before updating |
| F-USR-08 | VIEWER and ANALYST cannot access user management | GET/POST /users returns 403 for non-ADMIN |

---

### 1.3 Financial Records

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-REC-01 | ANALYST and ADMIN can create a financial record | POST /records returns 201 with created record |
| F-REC-02 | All authenticated users can list records | GET /records returns paginated data |
| F-REC-03 | Records filterable by type, category, date range | Filters applied as AND conditions in SQL WHERE clause |
| F-REC-04 | Records sortable by field and direction | `sortBy` and `sortOrder` params work; only whitelisted columns allowed |
| F-REC-05 | Records searchable by description | `search` param uses PostgreSQL `ILIKE '%term%'` on description column |
| F-REC-06 | ANALYST and ADMIN can update a record | PATCH /records/:id accepts partial fields; returns updated record |
| F-REC-07 | Only ADMIN can delete a record | DELETE /records/:id returns 403 for VIEWER and ANALYST |
| F-REC-08 | Deletion is soft — record not physically removed from database | `is_deleted = TRUE`, `deleted_at = NOW()` set; record excluded from all GET queries |
| F-REC-09 | Deleted records not visible in listings | `WHERE is_deleted = FALSE` applied in all record queries |
| F-REC-10 | `amount` must be positive with max 2 decimal places | Zod validation + PostgreSQL `CHECK (amount > 0)` constraint |
| F-REC-11 | `type` must be INCOME or EXPENSE | PostgreSQL ENUM type + Zod enum validation |
| F-REC-12 | `date` is required and must be a valid date | Zod regex `/^\d{4}-\d{2}-\d{2}$/` + PostgreSQL DATE type validation |

---

### 1.4 Dashboard Summaries

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F-DASH-01 | GET /dashboard/summary returns total income, expenses, net balance | PostgreSQL SUM aggregation; excludes soft-deleted records |
| F-DASH-02 | Summary accepts optional date range (from, to) | Date filters applied to all aggregations |
| F-DASH-03 | GET /dashboard/monthly-trends returns last 12 months | 12 data points via `DATE_TRUNC('month', date)` GROUP BY |
| F-DASH-04 | GET /dashboard/category-breakdown returns totals by category | Sorted by total DESC; includes count and percentage via window function |
| F-DASH-05 | GET /dashboard/recent-activity returns last 10 records | Ordered by date DESC; includes creator name via JOIN |
| F-DASH-06 | GET /dashboard/weekly-summary returns current month week-by-week | Week buckets based on `DATE_TRUNC('week', date)` |
| F-DASH-07 | All dashboard endpoints accessible to all authenticated roles | VIEWER, ANALYST, ADMIN all receive 200 OK |

---

## 2. Non-Functional Requirements

### 2.1 Security

| ID | Requirement |
|----|-------------|
| NF-SEC-01 | Passwords hashed with bcryptjs, cost factor 12 |
| NF-SEC-02 | No password field returned in any API response (explicit column exclusion in SQL) |
| NF-SEC-03 | JWT secrets minimum 32 characters, separate secrets for access and refresh |
| NF-SEC-04 | All routes except `/auth/login` and `/auth/register` require valid JWT |
| NF-SEC-05 | RBAC enforced in `authorize()` middleware — cannot be bypassed via URL manipulation |
| NF-SEC-06 | Zod validation strips unknown fields (`strip()` default behavior) |
| NF-SEC-07 | SQL injection prevented: all queries use parameterized statements (`$1`, `$2`, ...) |
| NF-SEC-08 | Whitelist-only `sortBy` column names — no raw user input passed into ORDER BY |
| NF-SEC-09 | `helmet()` middleware sets security headers on all responses |
| NF-SEC-10 | CORS restricted to `ALLOWED_ORIGIN` env variable |
| NF-SEC-11 | Raw error stack traces never returned in production (`NODE_ENV=production`) |
| NF-SEC-12 | Rate limiting: 100 requests per minute per IP |

---

### 2.2 Performance

| ID | Requirement |
|----|-------------|
| NF-PERF-01 | Dashboard summary API responds within 300ms (p95) under normal load |
| NF-PERF-02 | Records list API responds within 200ms for paginated queries |
| NF-PERF-03 | PostgreSQL indexes on: `type`, `category`, `date`, `is_deleted`, `created_by_id` |
| NF-PERF-04 | Partial indexes (`WHERE is_deleted = FALSE`) for common filtered queries |
| NF-PERF-05 | Pagination default: 20; maximum: 100 — enforced by Zod validation |
| NF-PERF-06 | `node-postgres` connection pool (default: 10 connections) |

---

### 2.3 Reliability

| ID | Requirement |
|----|-------------|
| NF-REL-01 | All unhandled Express errors caught by global `errorHandler` middleware |
| NF-REL-02 | PostgreSQL pool handles connection errors with automatic retry |
| NF-REL-03 | Redis unavailability degrades gracefully (rate limiting skipped; token validation falls back to JWT signature only) |
| NF-REL-04 | Application validates `DATABASE_URL` at startup and exits with message if missing |
| NF-REL-05 | `process.on('unhandledRejection')` and `uncaughtException` logged before exit |

---

### 2.4 Developer Experience

| ID | Requirement |
|----|-------------|
| NF-DX-01 | OpenAPI 3.0 spec auto-generated; Swagger UI at `http://localhost:4000/api/docs` |
| NF-DX-02 | `docker-compose up -d` starts Postgres + Redis in one command |
| NF-DX-03 | `npm run seed` populates database with 3 test users and 50 sample records |
| NF-DX-04 | `.env.example` committed with all required variables, types, and descriptions |
| NF-DX-05 | `npm run dev` from root starts both backend and Next.js frontend concurrently |
| NF-DX-06 | New developer can run the full stack locally in under 10 minutes |
| NF-DX-07 | TypeScript strict mode (`"strict": true`) enabled on both frontend and backend |

---

### 2.5 Code Quality

| ID | Requirement |
|----|-------------|
| NF-CQ-01 | No `any` types without an explanatory comment |
| NF-CQ-02 | All SQL in repository files — never in controllers or services |
| NF-CQ-03 | All parameterized queries — no string concatenation in SQL |
| NF-CQ-04 | No hardcoded secrets, URLs, or config values in source code |
| NF-CQ-05 | ESLint + Prettier enforced; no warnings on CI |
| NF-CQ-06 | Controllers are thin: extract from req, call service, return response — no business logic |

---

## 3. Input Validation (Zod Schemas)

### User Registration / Creation

| Field | Zod Rule |
|-------|----------|
| `email` | `z.string().email().max(255).toLowerCase()` |
| `password` | `z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/)` |
| `firstName` | `z.string().min(1).max(50).trim()` |
| `lastName` | `z.string().min(1).max(50).trim()` |
| `role` | `z.enum(['VIEWER', 'ANALYST', 'ADMIN'])` |

### Financial Record Create / Update

| Field | Zod Rule |
|-------|----------|
| `amount` | `z.number().positive().multipleOf(0.01).max(999_999_999_999.99)` |
| `type` | `z.enum(['INCOME', 'EXPENSE'])` |
| `category` | `z.string().min(1).max(100)` |
| `date` | `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` |
| `description` | `z.string().max(500).optional()` |

### Record Query Params

| Param | Zod Rule |
|-------|----------|
| `page` | `z.coerce.number().int().min(1).default(1)` |
| `limit` | `z.coerce.number().int().min(1).max(100).default(20)` |
| `type` | `z.enum(['INCOME', 'EXPENSE']).optional()` |
| `category` | `z.string().max(100).optional()` |
| `dateFrom` | `z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()` |
| `dateTo` | `z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()` |
| `sortBy` | `z.enum(['date', 'amount', 'category', 'created_at']).optional()` |
| `sortOrder` | `z.enum(['asc', 'desc']).default('desc')` |
| `search` | `z.string().max(200).optional()` |

---

## 4. Predefined Categories

In v1, categories are fixed constants (not user-managed entities). Stored as VARCHAR in the database — the frontend enforces the allowed list via a select dropdown.

**Income:** `Sales`, `Services`, `Investment Returns`, `Grants`, `Refunds`, `Other Income`

**Expense:** `Rent`, `Salaries`, `Software & Subscriptions`, `Office Supplies`, `Marketing`, `Travel`, `Utilities`, `Legal & Compliance`, `Contractor Fees`, `Equipment`, `Other Expense`

---

## 5. Assumptions

1. **Single organization** — All users belong to one organization; no multi-tenancy in v1
2. **Currency** — All amounts are USD; stored as `NUMERIC(15,2)`; no currency conversion
3. **Timezone** — All dates stored and returned as UTC / ISO 8601; frontend formats to local TZ
4. **Registration control** — `/auth/register` is open in development for quick bootstrapping; production deployments should restrict to Admin-only user creation via `/users`
5. **Password reset** — Not implemented in v1; Admins reset passwords via PATCH /users/:id
6. **Audit log** — Only `created_by_id` and `created_at` / `updated_at` are tracked; full audit trail deferred to v1.1
7. **Decimal safety** — Financial calculations use PostgreSQL's `NUMERIC` type and string representation in API responses; JavaScript `Number` is never used for summation
8. **Sorting security** — `sortBy` column names are validated against an explicit whitelist before being interpolated into SQL ORDER BY clauses

---

## 6. Constraints

| Constraint | Value / Detail |
|-----------|----------------|
| Max records per query | 100 (enforced by Zod `limit` validation) |
| Max amount | `999,999,999,999.99` (15 digits, 2 decimal) |
| Amount precision | 2 decimal places — enforced by Zod + PostgreSQL NUMERIC(15,2) |
| Soft deletes only | Hard delete disabled at application layer in v1 |
| Refresh token storage | Redis; one active token per user (per login session) |
| SQL injection protection | All values via `pg` parameterized queries (`$1`, `$2`); column names whitelisted |
| Connection pool | `pg.Pool` default: 10 concurrent PostgreSQL connections |
