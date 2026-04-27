# Tech Stack
## FinSight — Technology Decisions & Rationale

**Version:** 1.1.0  
**Date:** April 2026

---

## 1. Overview

FinSight is a TypeScript-first full-stack application built on Express.js (API server) and Next.js (frontend). The stack prioritizes simplicity, transparency, and control — raw SQL over magic abstractions, file-based routing over complex configuration.

```
┌───────────────────────────────────────────────────┐
│              FRONTEND — Next.js 14                 │
│     App Router · TypeScript · Tailwind · Recharts  │
└─────────────────────┬─────────────────────────────┘
                      │ HTTP / REST (fetch / axios)
┌─────────────────────▼─────────────────────────────┐
│              BACKEND — Express.js                  │
│       TypeScript · JWT · Zod · node-postgres       │
└─────────────────────┬─────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
┌────────▼──────┐         ┌────────▼──────┐
│  PostgreSQL   │         │     Redis      │
│  (node-pg,    │         │  (Rate limit,  │
│   raw SQL)    │         │   Token store) │
└───────────────┘         └───────────────┘
```

---

## 2. Backend Stack

### 2.1 Runtime & Language
| Technology | Version | Rationale |
|-----------|---------|-----------|
| **Node.js** | 20 LTS | LTS stability, performance, native ESM support |
| **TypeScript** | 5.x | Type safety, strict mode, self-documenting code |

### 2.2 Framework
| Technology | Version | Rationale |
|-----------|---------|-----------|
| **Express.js** | 4.x | Battle-tested, minimal, and fully explicit. Every middleware, route, and error handler is visible code — no decorator magic, no hidden DI container. Forces deliberate architectural decisions which are easy to audit and explain. |

**Why Express over NestJS / Fastify?**
- Total transparency in the request lifecycle — nothing happens you didn't write
- Patterns are universal and transferable beyond any single framework
- Forces clean separation of routes, controllers, services, and repositories without scaffolding
- Lighter cold start; easier to reason about in an assessment context

### 2.3 Database
| Technology | Version | Rationale |
|-----------|---------|-----------|
| **PostgreSQL** | 16 | ACID-compliant relational database. Ideal for financial data: strict schema, reliable aggregates, powerful window functions for trend analytics |
| **node-postgres (`pg`)** | 8.x | Official PostgreSQL client for Node.js. Raw SQL gives complete control and transparency — every query is explicit, auditable, and optimizable without an ORM translation layer |

**Why raw SQL over an ORM (Prisma / TypeORM / Drizzle)?**
- Financial aggregations (SUM, GROUP BY, date_trunc, CASE WHEN, window functions) are natural SQL — no ORM DSL needed
- Full visibility into exactly what executes against the database; no surprise queries
- SQL migration files are plain `.sql` — readable, portable, no CLI dependency
- Zero "magic find" methods; business intent is stated explicitly in each query

**Database Access Pattern:**

```typescript
// src/db/index.ts
import { Pool, QueryResult } from 'pg';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
```

All SQL lives in `repositories/` files, never scattered across business logic.

### 2.4 Database Migrations
| Technology | Rationale |
|-----------|-----------|
| **node-pg-migrate** | Lightweight SQL migration runner. Migration files are plain `.sql` — human-readable, no DSL to learn, works with any SQL tool |

### 2.5 Caching & Token Infrastructure
| Technology | Rationale |
|-----------|-----------|
| **Redis (`ioredis`)** | Refresh token storage (revocation on logout); rate limiting state via `express-rate-limit` + `rate-limit-redis` |

### 2.6 Authentication
| Technology | Rationale |
|-----------|-----------|
| **jsonwebtoken** | JWT access token (15m) and refresh token (7d) generation and verification |
| **bcryptjs** | Password hashing at cost factor 12 — pure JavaScript, no native bindings required |

### 2.7 Validation
| Technology | Rationale |
|-----------|-----------|
| **Zod** | Schema-first, TypeScript-native runtime validation on all request bodies and query params. Zod schemas are also TypeScript types — one definition, zero duplication. Shared between frontend and backend. |

### 2.8 Middleware Packages
| Package | Purpose |
|---------|---------|
| `cors` | Cross-origin configuration |
| `helmet` | Security headers (XSS, CSRF protection headers) |
| `morgan` | HTTP request logging in dev |
| `express-rate-limit` | Rate limiting per IP (100 req/min) |
| `compression` | Gzip response compression |

### 2.9 API Documentation
| Technology | Rationale |
|-----------|-----------|
| **swagger-ui-express + swagger-jsdoc** | OpenAPI 3.0 spec from JSDoc comments; interactive Swagger UI at `/api/docs` |

### 2.10 Testing
| Technology | Rationale |
|-----------|-----------|
| **Jest + ts-jest** | Unit and integration testing, TypeScript-native |
| **Supertest** | HTTP integration tests against the live Express app |
| **@faker-js/faker** | Realistic seeded test data |

---

## 3. Frontend Stack

### 3.1 Core
| Technology | Version | Rationale |
|-----------|---------|-----------|
| **Next.js** | 14.x | App Router with React Server Components. Server-rendered dashboard pages for fast TTFB; file-based routing; production-optimized builds; easy API proxying |
| **TypeScript** | 5.x | Consistent type safety across the full stack |
| **React** | 18.x | Concurrent features; Server + Client component model |

**App Router Strategy:**
- Layout pages and initial data are **Server Components** — rendered on the server, no client JS needed for the first paint
- Interactive sections (forms, filter bars, charts) are **Client Components** with `'use client'`
- Backend API calls from server components use native `fetch()` with cache control; client components use Axios with TanStack Query

### 3.2 Styling & UI
| Technology | Version | Rationale |
|-----------|---------|-----------|
| **Tailwind CSS** | 3.x | Utility-first, consistent design tokens, JIT compilation |
| **Radix UI** | Latest | Accessible, unstyled primitives for Dialog, Select, DropdownMenu, Tabs — fully keyboard-navigable out of the box |
| **Framer Motion** | 11.x | KPI card stagger animations, page transitions, modal enter/exit |
| **Lucide React** | Latest | Clean, consistent MIT-licensed icon set |

**Typography:**
- Display: `DM Serif Display` — editorial authority, used for page heroes and KPI values
- Body: `DM Sans` — clean, modern, legible at all sizes
- Mono: `JetBrains Mono` — financial amounts, IDs, table data

**Color Palette (Light Theme):**
```
Primary:     #0F2B5B   Deep Navy    (sidebar, primary buttons)
Accent:      #F59E0B   Warm Amber   (CTAs, active states, highlights)
Background:  #FAFAFA   Off-white    (page background)
Surface:     #FFFFFF   White        (cards, modals)
Border:      #E5E7EB   Neutral 200  (dividers)
Text:        #111827   Neutral 900  (body text)
Subtle:      #6B7280   Neutral 500  (labels, meta)
Income:      #10B981   Emerald      (positive amounts)
Expense:     #EF4444   Red 500      (negative amounts)
Sidebar bg:  #0F2B5B   Dark navy
```

### 3.3 Data Visualization
| Technology | Rationale |
|-----------|-----------|
| **Recharts** | React-native composable chart library. Used for: `AreaChart` (monthly income vs expense trend), `BarChart` (weekly summary), `PieChart` + `Cell` (category breakdown). Fully themeable via props to match the design system — no separate CSS overrides needed. |

**Chart Components:**
```
MonthlyTrendChart   → AreaChart, dual lines (income / expense), 12 months
CategoryPieChart    → PieChart + Cell with custom colors per category
WeeklySummaryChart  → BarChart, grouped bars (income vs expense per week)
```

### 3.4 Data Fetching & State
| Technology | Rationale |
|-----------|-----------|
| **TanStack Query v5** | Client-side server state: caching, background refetch, stale-while-revalidate, optimistic updates |
| **Zustand** | Lightweight auth session store (accessToken, user, role) — no Redux boilerplate |
| **Axios** | HTTP client with request/response interceptors for auto token refresh logic |

### 3.5 Forms & Validation
| Technology | Rationale |
|-----------|-----------|
| **React Hook Form** | Uncontrolled form management, minimal re-renders |
| **Zod** | Same schemas used on the backend — validation logic shared across the stack |

### 3.6 Routing
Next.js App Router handles all routing via the `app/` directory. No additional router needed.

---

## 4. DevOps & Tooling

| Tool | Purpose |
|------|---------|
| **Docker + Docker Compose** | One-command local Postgres + Redis environment |
| **ESLint + Prettier** | Code style enforcement |
| **Husky + lint-staged** | Pre-commit hooks for lint and format |
| **tsx** | TypeScript execution for seed and migration scripts |
| **concurrently** | Run backend dev server + Next.js dev server from root `npm run dev` |
| **dotenv** | Environment variable loading for backend |

---

## 5. Monorepo Structure

```
finsight/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── db/
│   │   │   └── index.ts        # pg Pool + query helper
│   │   ├── repositories/       # All SQL queries, by domain
│   │   │   ├── user.repo.ts
│   │   │   ├── record.repo.ts
│   │   │   └── dashboard.repo.ts
│   │   ├── services/           # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── record.service.ts
│   │   │   └── dashboard.service.ts
│   │   ├── controllers/        # Request/response handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── record.controller.ts
│   │   │   └── dashboard.controller.ts
│   │   ├── routes/             # Express Router definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── record.routes.ts
│   │   │   └── dashboard.routes.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts  # JWT verification
│   │   │   ├── authorize.ts     # RBAC role check
│   │   │   ├── validate.ts      # Zod validation middleware
│   │   │   └── errorHandler.ts  # Global error handler
│   │   ├── validators/         # Zod schemas (DTOs)
│   │   │   ├── auth.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   └── record.schema.ts
│   │   ├── types/
│   │   │   └── index.ts         # Shared types, enums, interfaces
│   │   └── app.ts               # Express app setup
│   ├── migrations/              # Plain SQL migration files
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_refresh_tokens.sql
│   │   └── 003_create_financial_records.sql
│   ├── scripts/
│   │   └── seed.ts              # Database seeder
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── server.ts                # HTTP server entry point
│   └── package.json
│
├── frontend/                    # Next.js 14 application
│   ├── app/                     # App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx       # Dashboard shell (sidebar)
│   │       ├── dashboard/page.tsx
│   │       ├── records/page.tsx
│   │       ├── records/[id]/page.tsx
│   │       ├── users/page.tsx
│   │       └── profile/page.tsx
│   ├── components/
│   │   ├── ui/                  # Design system atoms
│   │   ├── layout/              # Sidebar, Topbar, AppShell
│   │   ├── charts/              # Recharts wrappers
│   │   └── features/            # Domain components
│   ├── lib/
│   │   ├── api.ts               # Axios client + interceptors
│   │   ├── formatters.ts        # Currency, date formatters
│   │   └── constants.ts
│   ├── store/
│   │   └── auth.store.ts        # Zustand auth store
│   ├── types/
│   └── package.json
│
├── docker-compose.yml
├── package.json                 # Root scripts
└── README.md
```

---

## 6. Technology Trade-offs

| Decision | Alternative Considered | Reason Chosen |
|----------|------------------------|---------------|
| Express.js | NestJS | Explicit, no magic; forces clean architecture; universally understood |
| node-postgres + raw SQL | Prisma / Drizzle / TypeORM | Complete query transparency; financial aggregations are natural SQL; no ORM CLI dependency |
| node-pg-migrate | Prisma migrate | Plain `.sql` files; no DSL; works with any Postgres tool |
| Next.js App Router | Vite + React SPA | SSR for fast initial load; built-in routing; server components reduce client bundle |
| Recharts | Chart.js / ApexCharts | React-native composable API; easy color theming via props; no imperative DOM refs |
| Zod (shared) | class-validator (backend only) | Single validation library across frontend + backend; TypeScript-first; no decorators |
| ioredis | node-redis | Superior TypeScript types; stable async API; pipeline support |
