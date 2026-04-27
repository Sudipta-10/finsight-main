# Project Status
## FinSight — Development Progress Tracker

**Version:** 1.1.0  
**Last Updated:** April 5, 2026  
**Overall Status:** 🟡 In Planning / Ready to Build

---

## 1. Progress Overview

```
Backend (Express)  [░░░░░░░░░░░░░░░░░░░░]  0%   — Not started
Frontend (Next.js) [░░░░░░░░░░░░░░░░░░░░]  0%   — Not started
DevOps             [░░░░░░░░░░░░░░░░░░░░]  0%   — Not started
Documentation      [████████████████████] 100%  — Complete ✓
```

---

## 2. Milestone Plan

| # | Milestone | When | Status |
|---|-----------|------|--------|
| M1 | Planning & documentation | Week 0 | ✅ Complete |
| M2 | Monorepo scaffold + Docker Compose | W1 D1 | 🔲 |
| M3 | PostgreSQL schema + SQL migrations | W1 D1 | 🔲 |
| M4 | Express app setup + middleware stack | W1 D2 | 🔲 |
| M5 | Auth module (login, refresh, logout) | W1 D2 | 🔲 |
| M6 | Users module + RBAC middleware | W1 D3 | 🔲 |
| M7 | Records module (CRUD + filtering) | W1 D4–5 | 🔲 |
| M8 | Dashboard module (SQL aggregations) | W2 D1 | 🔲 |
| M9 | Zod validation + global error handler + seed | W2 D2 | 🔲 |
| M10 | Swagger/OpenAPI documentation | W2 D2 | 🔲 |
| M11 | Backend tests (unit + integration) | W2 D3 | 🔲 |
| M12 | Next.js 14 setup + design system | W2 D4 | 🔲 |
| M13 | Login page | W2 D5 | 🔲 |
| M14 | App shell (sidebar + topbar) | W3 D1 | 🔲 |
| M15 | Dashboard page + KPI cards + Recharts | W3 D2 | 🔲 |
| M16 | Records page (table + filters + pagination) | W3 D3 | 🔲 |
| M17 | Record create / edit / delete (modal + forms) | W3 D4 | 🔲 |
| M18 | Users management page (Admin) | W3 D5 | 🔲 |
| M19 | Profile page | W4 D1 | 🔲 |
| M20 | Frontend polish (animations, responsive, empty states) | W4 D2 | 🔲 |
| M21 | End-to-end integration testing | W4 D3 | 🔲 |
| M22 | README + deployment documentation | W4 D4 | 🔲 |

---

## 3. Backend Task Breakdown

### 📦 Infrastructure & Setup
| Task | Status | Notes |
|------|--------|-------|
| Initialize backend folder with `npm init` + TypeScript | 🔲 | tsconfig strict mode |
| Install Express + dependencies | 🔲 | express, cors, helmet, morgan, compression |
| Configure ESLint + Prettier | 🔲 | |
| Docker Compose: PostgreSQL + Redis containers | 🔲 | docker-compose.yml |
| `db/index.ts` — pg Pool + typed query helper | 🔲 | `pool.query<T>()` wrapper |
| Create `.env` + `.env.example` | 🔲 | All vars documented |
| `server.ts` — HTTP server entry point | 🔲 | |
| `app.ts` — Express setup, middleware, routes | 🔲 | |

### 🗄️ Database Migrations (plain SQL)
| Task | Status | Notes |
|------|--------|-------|
| `001_create_users.sql` | 🔲 | UUID, ENUM role, bcrypt password col |
| `002_create_refresh_tokens.sql` | 🔲 | FK to users, expires_at |
| `003_create_financial_records.sql` | 🔲 | NUMERIC(15,2), ENUM type, soft delete cols |
| Create all indexes | 🔲 | Partial indexes for `is_deleted = FALSE` |
| node-pg-migrate runner script | 🔲 | `npm run migrate` |
| Database seed script (`scripts/seed.ts`) | 🔲 | 3 users + 50 records |

### 🔐 Auth Module
| Task | Status | Notes |
|------|--------|-------|
| `authRepository` — findByEmail, storeRefreshToken, revokeToken | 🔲 | Raw SQL |
| `authService.register()` — hash password, insert user | 🔲 | bcryptjs |
| `authService.login()` — verify password, generate tokens | 🔲 | jsonwebtoken |
| `authService.refresh()` — verify, rotate Redis token | 🔲 | ioredis |
| `authService.logout()` — delete Redis key | 🔲 | |
| `authController` — POST /register, /login, /refresh, /logout | 🔲 | |
| `auth.routes.ts` | 🔲 | |

### 🛡️ Middleware
| Task | Status | Notes |
|------|--------|-------|
| `authenticate.ts` — JWT verification, attach req.user | 🔲 | jsonwebtoken |
| `authorize.ts` — role check factory function | 🔲 | `authorize(Role.ADMIN)` |
| `validate.ts` — Zod middleware factory | 🔲 | body / query / params |
| `errorHandler.ts` — global Express error handler | 🔲 | AppError class + 500 fallback |
| `AppError` + `ValidationError` classes | 🔲 | `types/errors.ts` |
| Rate limiter (`express-rate-limit` + Redis store) | 🔲 | |

### 👤 Users Module
| Task | Status | Notes |
|------|--------|-------|
| `userRepository` — findAll, findById, findByEmail, create, update | 🔲 | Raw SQL; never return password |
| `userService` — list, create, update, getMe, updateMe | 🔲 | |
| `userController` | 🔲 | |
| `user.routes.ts` | 🔲 | ADMIN guard on all except /me |
| `user.schema.ts` — Zod schemas | 🔲 | |

### 💳 Records Module
| Task | Status | Notes |
|------|--------|-------|
| `recordRepository.findAll(filters)` — dynamic WHERE + pagination | 🔲 | Parameterized, whitelisted sortBy |
| `recordRepository.findById` | 🔲 | |
| `recordRepository.create` | 🔲 | RETURNING * |
| `recordRepository.update` | 🔲 | Partial update |
| `recordRepository.softDelete` | 🔲 | is_deleted + deleted_at |
| `recordService` — business logic layer | 🔲 | |
| `recordController` | 🔲 | |
| `record.routes.ts` | 🔲 | Role guards per route |
| `record.schema.ts` — Zod schemas | 🔲 | create, update, query |

### 📊 Dashboard Module
| Task | Status | Notes |
|------|--------|-------|
| `dashboardRepository.getSummary(from, to)` | 🔲 | SUM CASE WHEN |
| `dashboardRepository.getMonthlyTrends()` | 🔲 | DATE_TRUNC + GROUP BY |
| `dashboardRepository.getCategoryBreakdown(type)` | 🔲 | Window function percentage |
| `dashboardRepository.getRecentActivity()` | 🔲 | JOIN users, LIMIT 10 |
| `dashboardRepository.getWeeklySummary()` | 🔲 | DATE_TRUNC('week') |
| `dashboardService` + `dashboardController` | 🔲 | |
| `dashboard.routes.ts` | 🔲 | All roles allowed |

### 📖 API Documentation
| Task | Status | Notes |
|------|--------|-------|
| swagger-jsdoc setup | 🔲 | |
| swagger-ui-express at /api/docs | 🔲 | |
| JSDoc annotations on all routes | 🔲 | |

### 🧪 Testing
| Task | Status | Notes |
|------|--------|-------|
| Jest + ts-jest configuration | 🔲 | |
| `authService` unit tests | 🔲 | Mock pg pool |
| `recordService` unit tests | 🔲 | |
| `dashboardService` unit tests | 🔲 | |
| Auth integration tests (Supertest) | 🔲 | |
| Records integration tests (Supertest) | 🔲 | |
| RBAC enforcement tests | 🔲 | Each forbidden endpoint |

---

## 4. Frontend Task Breakdown

### 🎨 Design System & Setup
| Task | Status | Notes |
|------|--------|-------|
| `npx create-next-app@latest` with TypeScript + Tailwind | 🔲 | App Router |
| Configure `tailwind.config.ts` with custom colors/fonts | 🔲 | |
| `globals.css` — CSS variables (design tokens) | 🔲 | |
| `next/font/google` — DM Serif Display + DM Sans + JetBrains Mono | 🔲 | |
| Radix UI install | 🔲 | Dialog, DropdownMenu, Select, Tabs |
| Framer Motion install | 🔲 | |
| Lucide React install | 🔲 | |

### 🧩 UI Component Library (Design System Atoms)
| Task | Status | Notes |
|------|--------|-------|
| `Button` (primary, secondary, ghost, danger variants) | 🔲 | |
| `Input` (with label, error state) | 🔲 | |
| `Select` (Radix primitive) | 🔲 | |
| `Badge` (role badge, record type badge) | 🔲 | |
| `Card` (surface container with shadow) | 🔲 | |
| `Modal` (Radix Dialog) | 🔲 | |
| `Table` (sortable headers, hover rows) | 🔲 | |
| `Skeleton` (shimmer loading placeholder) | 🔲 | |
| `Toast` (slide-in notifications) | 🔲 | |
| `Spinner` (loading indicator) | 🔲 | |
| `EmptyState` (no data placeholder) | 🔲 | |
| `ConfirmDialog` (delete confirmation) | 🔲 | |

### 🔌 API & State Layer
| Task | Status | Notes |
|------|--------|-------|
| `lib/api.ts` — Axios instance + interceptors (auto refresh) | 🔲 | |
| `store/auth.store.ts` — Zustand + persist middleware | 🔲 | |
| TanStack Query v5 provider setup | 🔲 | |
| `lib/formatters.ts` — currency, date, percent | 🔲 | |
| `lib/constants.ts` — CATEGORIES, ROLES | 🔲 | |
| `types/` — shared TypeScript interfaces | 🔲 | |
| API function files (auth, records, users, dashboard) | 🔲 | |

### 🗂️ Routing & Auth Guards
| Task | Status | Notes |
|------|--------|-------|
| App Router group layouts `(auth)` and `(dashboard)` | 🔲 | |
| `middleware.ts` — Next.js edge middleware for route protection | 🔲 | |
| Role-based redirect for `/users` (ADMIN only) | 🔲 | |

### 📱 Layout
| Task | Status | Notes |
|------|--------|-------|
| `app/(dashboard)/layout.tsx` — Shell with Sidebar + Topbar | 🔲 | |
| `components/layout/Sidebar.tsx` | 🔲 | Active link, role-conditional items |
| `components/layout/Topbar.tsx` | 🔲 | User menu, logout |
| `components/layout/PageHeader.tsx` | 🔲 | Title + actions slot |

### 📱 Pages
| Task | Status | Notes |
|------|--------|-------|
| `app/(auth)/login/page.tsx` — Split panel login | 🔲 | Framer animations |
| `app/(dashboard)/dashboard/page.tsx` | 🔲 | Server Component initial fetch |
| `app/(dashboard)/records/page.tsx` | 🔲 | |
| `app/(dashboard)/records/[id]/page.tsx` | 🔲 | |
| `app/(dashboard)/users/page.tsx` | 🔲 | Admin only |
| `app/(dashboard)/profile/page.tsx` | 🔲 | |
| `app/not-found.tsx` | 🔲 | Custom 404 |

### 📊 Charts (Recharts)
| Task | Status | Notes |
|------|--------|-------|
| `MonthlyTrendChart` — AreaChart, dual area (income/expense) | 🔲 | 'use client' |
| `CategoryPieChart` — PieChart with donut style | 🔲 | Custom colors |
| `WeeklySummaryChart` — Grouped BarChart | 🔲 | |
| Custom Tooltip components | 🔲 | DM Sans font match |
| Responsive containers (100% width) | 🔲 | |

### 🧩 Feature Components
| Task | Status | Notes |
|------|--------|-------|
| `KPICard` — value, trend indicator, skeleton state | 🔲 | DM Serif Display font |
| `RecordTable` — sortable columns, action icons | 🔲 | |
| `RecordFilters` — type, category, date range, search | 🔲 | URL state sync |
| `RecordForm` — create/edit modal | 🔲 | RHF + Zod |
| `RecentActivity` — last 10 records list | 🔲 | |
| `UserTable` — role badge, status toggle | 🔲 | |
| `UserForm` — create/edit user modal | 🔲 | Admin only |

### 🎭 Polish
| Task | Status | Notes |
|------|--------|-------|
| Page entry animations (Framer Motion) | 🔲 | y: 12→0, opacity |
| KPI card stagger animation | 🔲 | 60ms delay |
| Skeleton loaders on all data sections | 🔲 | |
| Error boundary + fallback UI | 🔲 | |
| Mobile responsive sidebar (hamburger) | 🔲 | |
| Empty states for all lists | 🔲 | |
| Accessibility: focus-visible, ARIA labels | 🔲 | |

---

## 5. DevOps & Documentation

| Task | Status | Notes |
|------|--------|-------|
| `docker-compose.yml` (Postgres + Redis) | 🔲 | |
| Root `package.json` with `concurrently` dev script | 🔲 | |
| `.env.example` for backend | 🔲 | |
| `.env.local.example` for frontend | 🔲 | |
| `README.md` — full setup guide | 🔲 | Docker + manual setup paths |
| Architecture diagram in README | 🔲 | |

---

## 6. Deferred Items

| Item | Decision | Target |
|------|----------|--------|
| Multi-tenancy | Not in v1 | v2 |
| OAuth / SSO | Not in v1 | v2 |
| Multi-currency | USD only in v1 | v2 |
| Audit log (who changed what) | Not in v1 | v1.1 |
| File attachments (receipts) | Out of scope | v2 |
| Hard delete | Disabled at app layer | Admin DB utility |
| Real-time updates | No WebSockets | v2 |
| Email notifications | Not implemented | v2 |
| CI/CD pipeline | Not in v1 | Post-submission |
| Caching dashboard queries | Not in v1 (indexes handle it) | v1.1 |

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Floating-point errors in financial sums | High | High | PostgreSQL `NUMERIC(15,2)` for all amounts; return as string from API; never sum in JS |
| SQL injection via dynamic ORDER BY | Medium | Critical | Whitelist column names before interpolation; parameterized values everywhere else |
| JWT secret rotation breaking sessions | Low | High | Rotate refresh token on every use; document rotation procedure |
| Redis unavailability | Low | Medium | Graceful fallback: JWT signature validation still works; rate limiting skipped |
| Dashboard query slow at scale | Medium | Medium | Partial indexes on `is_deleted=FALSE`; add query caching in v1.1 |
| Role escalation via API | Low | Critical | `authorize()` middleware + integration tests for every protected endpoint |
| Next.js middleware JWT decode fails | Low | Medium | Use lightweight decode (not verify) in edge middleware; full verify in Express |
