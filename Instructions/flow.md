# Application Flow
## FinSight — End-to-End Data Flow & User Journey Documentation

**Version:** 1.1.0  
**Backend:** Express.js + node-postgres  
**Frontend:** Next.js 14 (App Router)

---

## 1. High-Level System Architecture

```
  Browser / Next.js (Client Components)
         │
         │  Axios (TanStack Query)
         ▼
  Next.js Server Components (SSR)
         │
         │  native fetch() with cache control
         ▼
  Express.js API (Port 4000)
    ├── Routes → Middleware → Controllers
    ├── Services (business logic)
    └── Repositories (SQL)
         │
         ├──────────────────────────┐
         ▼                          ▼
  PostgreSQL (Port 5432)          Redis (Port 6379)
  Raw SQL via node-postgres        Refresh tokens + rate limiting
```

---

## 2. Authentication Flow

### 2.1 Login

```
User submits email + password on /login
         │
         ▼
[Next.js Client] POST /api/v1/auth/login
         │
         ▼
[Express] Zod validates { email, password }
         │
[Express] userRepository.findByEmail(email)
         │
   ┌─────┴────────────┐
   │ User not found?  │ Yes → throw AppError(401, 'Invalid credentials')
   └─────┬────────────┘
         │
[Express] bcrypt.compare(password, user.password_hash)
         │
   ┌─────┴───────────────┐
   │ Wrong password?     │ Yes → throw AppError(401, 'Invalid credentials')
   └─────┬───────────────┘
         │
[Express] Check user.is_active
         │
   ┌─────┴───────────┐
   │ is_active=false │ Yes → throw AppError(403, 'Account is inactive')
   └─────┬───────────┘
         │
[Express] jwt.sign() → accessToken (15m, payload: { sub, email, role })
[Express] jwt.sign() → refreshToken (7d)
[Express] Store refreshToken in Redis: SET refresh:{userId} {token} EX 604800
         │
         ▼
[Next.js] Store in Zustand:
  - accessToken → memory only (Zustand)
  - refreshToken → persisted via zustand/middleware persist
  - user → { id, email, firstName, role }
         │
[Next.js] router.push('/dashboard')
```

---

### 2.2 Token Refresh (Axios Interceptor)

```
Client component makes API call → receives 401
         │
[Axios interceptor] catches 401
         │
         ▼
[Axios] POST /api/v1/auth/refresh { refreshToken }
         │
[Express] jwt.verify(refreshToken, JWT_REFRESH_SECRET)
         │
[Express] Redis GET refresh:{userId} → compare stored token
         │
   ┌─────┴─────────────────────┐
   │ Token mismatch/not found  │ Yes → 401 → [Next.js] logout() + redirect /login
   └─────┬─────────────────────┘
         │
[Express] Redis DEL refresh:{userId}          (revoke old)
[Express] Generate new accessToken + refreshToken
[Express] Redis SET refresh:{userId} {newToken} EX 604800
         │
         ▼
[Axios] Update Zustand with new tokens
[Axios] Flush queued requests with new accessToken
[Axios] Retry original failed request
```

---

### 2.3 Logout

```
User clicks Logout
         │
[Next.js] POST /api/v1/auth/logout (with Authorization header)
         │
[Express] authenticate middleware validates JWT
[Express] Redis DEL refresh:{userId}
         │
[Next.js] useAuthStore.getState().logout()   (clear Zustand)
[Next.js] router.push('/login')
```

---

## 3. Express.js Request Pipeline

Every protected API request passes through this exact middleware chain:

```
Incoming HTTP Request (Express)
         │
         ▼
Global Middleware (app.ts)
  • cors()          — CORS headers
  • helmet()        — Security headers
  • express.json()  — Body parsing
  • morgan()        — Request logging
  • rateLimit()     — 100 req/min per IP
         │
         ▼
Router Match (e.g., DELETE /api/v1/records/:id)
         │
         ▼
authenticate middleware
  • Extract "Bearer {token}" from Authorization header
  • jwt.verify(token, JWT_ACCESS_SECRET)
  • On failure → next(new AppError('Invalid token', 401))
  • On success → req.user = { sub, email, role }
         │
         ▼
authorize(Role.ADMIN) middleware
  • Check req.user.role against allowed roles array
  • On failure → next(new AppError('Insufficient permissions', 403))
         │
         ▼
validate(updateRecordSchema) middleware
  • Zod schema.safeParse(req.body)
  • On failure → next(new ValidationError('Validation failed', errors))
  • On success → req.body = parsed/coerced data (safe)
         │
         ▼
recordController.delete(req, res, next)
  • Calls recordService.softDelete(id, req.user)
  • Returns res.json({ message: 'Record deleted' })
         │
         ▼
errorHandler (only reached if next(err) was called)
  • Maps AppError → { statusCode, message, errors }
  • Maps unknown Error → 500
```

---

## 4. Next.js Server Component Data Flow (Dashboard SSR)

```
User navigates to /dashboard
         │
         ▼
Next.js renders app/(dashboard)/dashboard/page.tsx (Server Component)
         │
[Server] Read auth token from cookie (set during login)
         │
[Server] parallel fetch():
  ┌──────────────────────────────────────────────┐
  │  fetch('/api/v1/dashboard/summary')          │
  │  fetch('/api/v1/dashboard/monthly-trends')   │
  │  fetch('/api/v1/dashboard/recent-activity')  │
  └──────────────────────────────────────────────┘
         │
[Next.js] Renders HTML with real data (no loading flash)
         │
[Browser] Receives pre-rendered HTML with data
         │
[React] Hydrates Client Components (charts, filters)
         │
[Recharts] AreaChart and PieChart animate in
[Framer] KPI cards stagger-fade in (60ms delay each)
```

---

## 5. Financial Record Creation Flow

```
[ANALYST/ADMIN] clicks "+ New Record"
         │
[Next.js] RecordForm modal opens (Client Component)
  Fields: Amount, Type (radio), Category (select), Date, Description
         │
[React Hook Form + Zod] Client-side validation on submit
         │
[Axios + TanStack Query] POST /api/v1/records
  { amount: 15000, type: "INCOME", category: "Sales",
    date: "2026-04-05", description: "Q1 revenue" }
         │
[Express] authenticate → authorize(ANALYST, ADMIN) → validate(createRecordSchema)
         │
[recordController.create]
  → recordService.create(dto, req.user.sub)
  → recordRepository.create(dto, userId)
  → SQL: INSERT INTO financial_records (...) VALUES ($1,$2,...) RETURNING *
         │
[Response 201] Created record returned
         │
[TanStack Query] invalidateQueries(['records'])
[TanStack Query] invalidateQueries(['dashboard', 'summary'])
         │
[UI] Record list re-fetches and updates
[UI] KPI totals re-fetch and update
[UI] Toast: "Record created successfully" (slides in from right)
[UI] Modal closes with scale-down animation
```

---

## 6. Records Filtering & Pagination Flow

```
User selects filters: Type=EXPENSE, Category=Rent, Date=Jan–Mar 2026
         │
[Next.js] URL updated: /records?type=EXPENSE&category=Rent&dateFrom=2026-01-01&dateTo=2026-03-31
         │
[TanStack Query] Query key changes → new request fired:
  GET /api/v1/records?type=EXPENSE&category=Rent&dateFrom=2026-01-01&dateTo=2026-03-31&page=1&limit=20
         │
[Express] validate(recordQuerySchema) — coerces and validates query params
         │
[recordRepository.findAll(filters)]
  Builds dynamic WHERE clause:
    is_deleted = FALSE
    AND type = 'EXPENSE'
    AND category ILIKE 'Rent'
    AND date >= '2026-01-01'
    AND date <= '2026-03-31'
  Executes two queries in parallel:
    1. SELECT ... LIMIT 20 OFFSET 0    (page data)
    2. SELECT COUNT(*) ...              (total for pagination)
         │
[Response 200]
  { data: [...records], meta: { total: 12, page: 1, limit: 20, totalPages: 1 } }
         │
[TanStack Query] Caches result under the specific filter key
[RecordTable] Re-renders with filtered rows
[Pagination] Shows "12 results found"
```

---

## 7. Dashboard Aggregation Flow

```
[Express] GET /api/v1/dashboard/monthly-trends
         │
[dashboardController.monthlyTrends]
  → dashboardService.getMonthlyTrends()
  → dashboardRepository.getMonthlyTrends()
         │
[PostgreSQL]
  SELECT
    TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
    SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expenses,
    SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE -amount END) AS net
  FROM financial_records
  WHERE is_deleted = FALSE AND date >= NOW() - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', date)
  ORDER BY DATE_TRUNC('month', date) ASC
         │
[Response]
  { data: [
    { month: "2025-05", income: "42000.00", expenses: "31200.00", net: "10800.00" },
    ...12 entries
  ]}
         │
[MonthlyTrendChart] Recharts renders AreaChart with income/expense areas
[Animation] 800ms draw animation from left to right
```

---

## 8. Soft Delete Flow

```
[ADMIN] clicks delete icon on a record row
         │
[UI] Confirmation modal opens:
  "Delete this record? This cannot be undone from the dashboard."
  [Cancel]  [Delete Record]
         │
[Admin] clicks "Delete Record"
         │
[TanStack Query mutation] DELETE /api/v1/records/:id
         │
[Express] authenticate → authorize(ADMIN)
         │
[recordController.delete]
  → recordService.softDelete(id)
  → recordRepository.softDelete(id)
  → SQL:
    UPDATE financial_records
    SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND is_deleted = FALSE
    RETURNING id
         │
[Optimistic update] Row removed from table immediately
[TanStack Query] On success: invalidate ['records'] and ['dashboard']
[Toast] "Record deleted"
[Modal] Closes with fade-out
```

---

## 9. Role-Conditional UI Rendering

The UI reflects RBAC decisions — purely cosmetic, all enforcement is at the API layer:

```
Zustand stores: { role: 'ANALYST' }
         │
         ▼
AppShell Sidebar renders:
  ✓ Dashboard link    (all roles)
  ✓ Records link      (all roles)
  ✗ Users link        (ADMIN only — hidden for ANALYST and VIEWER)
  ✓ Profile link      (all roles)
         │
RecordsPage renders:
  ✗ "+ New Record" button    (hidden for VIEWER)
  ✗ Edit icons on rows       (hidden for VIEWER)
  ✗ Delete icons on rows     (hidden for VIEWER and ANALYST)
         │
Next.js middleware (middleware.ts):
  • /users → redirect to /dashboard if role !== ADMIN
  • /login → redirect to /dashboard if already authenticated
```

---

## 10. Error Propagation Flow

```
[Repository] throws or pg throws on DB error
         │
[Service] catches, wraps in domain AppError (404/409/422) or re-throws
         │
[Controller] calls next(err) → skips normal response
         │
[Express errorHandler middleware]
  if (err instanceof AppError) → structured JSON response
  else → log to console + 500 response (no stack trace in production)
         │
[Axios interceptor on client]
  401 → attempt refresh (see section 2.2)
  403 → toast "You don't have permission to do this"
  404 → toast "Record not found"
  400 → pass errors array to React Hook Form setError()
  500 → toast "Something went wrong. Please try again."
         │
[React Query] marks mutation as failed → loading state cleared
[UI] Error state displayed inline or via toast
```

---

## 11. Route Map

```
Frontend (Next.js)            Backend (Express)
──────────────────────        ─────────────────────────────
/login                    →   POST /api/v1/auth/login
/dashboard                →   GET  /api/v1/dashboard/summary
                              GET  /api/v1/dashboard/monthly-trends
                              GET  /api/v1/dashboard/category-breakdown
                              GET  /api/v1/dashboard/recent-activity
/records                  →   GET  /api/v1/records
/records/[id]             →   GET  /api/v1/records/:id
/users   (ADMIN only)     →   GET  /api/v1/users
/profile                  →   GET  /api/v1/users/me
```
