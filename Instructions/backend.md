# Backend Architecture
## FinSight — Express.js Backend Design & API Reference

**Version:** 1.1.0  
**Framework:** Express.js 4 (TypeScript)  
**Database:** PostgreSQL 16 + node-postgres (raw SQL)  
**Auth:** JWT (access + refresh tokens) + bcryptjs

---

## 1. Architecture Overview

The backend follows a layered architecture with strict separation of concerns. Each layer has one responsibility and communicates only with the layer directly below it.

```
HTTP Request
     │
     ▼
Routes (Express Router)
     │  Define URL patterns; attach middleware chain
     ▼
Middleware (authenticate → authorize → validate)
     │  Verify JWT, check role, validate request body via Zod
     ▼
Controllers
     │  Extract validated data from req; call service; return response
     ▼
Services
     │  Business logic, orchestration, error handling
     ▼
Repositories
     │  All SQL queries — the only layer that touches the database
     ▼
PostgreSQL (via node-postgres pool)
```

**Why this structure with Express?**
Express is unopinionated — this layered pattern is imposed deliberately. It mirrors NestJS's architecture in organization while remaining framework-agnostic code. Repositories isolate SQL, services contain business rules, controllers stay thin.

---

## 2. Database Schema (SQL)

### Migration: 001_create_users.sql
```sql
CREATE TYPE user_role AS ENUM ('VIEWER', 'ANALYST', 'ADMIN');

CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(255) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,              -- bcrypt hash
  first_name   VARCHAR(50) NOT NULL,
  last_name    VARCHAR(50) NOT NULL,
  role         user_role NOT NULL DEFAULT 'VIEWER',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Migration: 002_create_refresh_tokens.sql
```sql
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL UNIQUE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### Migration: 003_create_financial_records.sql
```sql
CREATE TYPE record_type AS ENUM ('INCOME', 'EXPENSE');

CREATE TABLE financial_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount        NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  type          record_type NOT NULL,
  category      VARCHAR(100) NOT NULL,
  date          DATE NOT NULL,
  description   TEXT,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_records_type        ON financial_records(type)         WHERE is_deleted = FALSE;
CREATE INDEX idx_records_category    ON financial_records(category)     WHERE is_deleted = FALSE;
CREATE INDEX idx_records_date        ON financial_records(date)         WHERE is_deleted = FALSE;
CREATE INDEX idx_records_created_by  ON financial_records(created_by_id);
CREATE INDEX idx_records_is_deleted  ON financial_records(is_deleted);
```

---

## 3. Middleware Stack

### 3.1 `authenticate.ts` — JWT Verification
```typescript
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = payload; // { sub, email, role }
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
```

### 3.2 `authorize.ts` — Role-Based Access Control
```typescript
export const authorize = (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
    next();
  };
```

**Usage in routes:**
```typescript
router.delete('/:id', authenticate, authorize(Role.ADMIN), recordController.delete);
```

### 3.3 `validate.ts` — Zod Request Validation
```typescript
export const validate = (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError('Validation failed', errors);
    }
    req[target] = result.data; // Replace with parsed/coerced data
    next();
  };
```

### 3.4 `errorHandler.ts` — Global Error Handler
```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      errors: err instanceof ValidationError ? err.errors : undefined,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
  // Unexpected errors — log and return 500
  console.error(err);
  return res.status(500).json({
    statusCode: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
```

---

## 4. Access Control Matrix

```
┌─────────────────────────────────┬────────┬─────────┬───────┐
│ Operation                       │ VIEWER │ ANALYST │ ADMIN │
├─────────────────────────────────┼────────┼─────────┼───────┤
│ View records (list / detail)    │  ✓     │  ✓      │  ✓    │
│ Create financial record         │  ✗     │  ✓      │  ✓    │
│ Update financial record         │  ✗     │  ✓      │  ✓    │
│ Delete financial record         │  ✗     │  ✗      │  ✓    │
│ View dashboard summaries        │  ✓     │  ✓      │  ✓    │
│ List all users                  │  ✗     │  ✗      │  ✓    │
│ Create user                     │  ✗     │  ✗      │  ✓    │
│ Update user role / status       │  ✗     │  ✗      │  ✓    │
│ Update own profile              │  ✓     │  ✓      │  ✓    │
└─────────────────────────────────┴────────┴─────────┴───────┘
```

---

## 5. Repository Layer (SQL Examples)

### record.repo.ts

```typescript
export class RecordRepository {

  async findAll(filters: RecordFilters): Promise<{ data: Record[], total: number }> {
    const conditions: string[] = ['is_deleted = FALSE'];
    const params: unknown[] = [];
    let i = 1;

    if (filters.type)     { conditions.push(`type = $${i++}`);               params.push(filters.type); }
    if (filters.category) { conditions.push(`category ILIKE $${i++}`);        params.push(filters.category); }
    if (filters.dateFrom) { conditions.push(`date >= $${i++}`);               params.push(filters.dateFrom); }
    if (filters.dateTo)   { conditions.push(`date <= $${i++}`);               params.push(filters.dateTo); }
    if (filters.search)   { conditions.push(`description ILIKE $${i++}`);     params.push(`%${filters.search}%`); }

    const where = conditions.join(' AND ');
    const allowedSort = ['date', 'amount', 'category', 'created_at'];
    const sortBy = allowedSort.includes(filters.sortBy ?? '') ? filters.sortBy : 'date';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const limit = Math.min(filters.limit ?? 20, 100);
    const offset = ((filters.page ?? 1) - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      query<Record>(`
        SELECT r.*, u.first_name, u.last_name
        FROM financial_records r
        JOIN users u ON r.created_by_id = u.id
        WHERE ${where}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${i++} OFFSET $${i}
      `, [...params, limit, offset]),
      query<{ count: string }>(`
        SELECT COUNT(*) FROM financial_records WHERE ${where}
      `, params),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }
}
```

### dashboard.repo.ts

```typescript
export class DashboardRepository {

  async getSummary(from: Date, to: Date) {
    const result = await query<SummaryRow>(`
      SELECT
        SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS total_expenses,
        SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE -amount END) AS net_balance,
        COUNT(*) AS record_count
      FROM financial_records
      WHERE is_deleted = FALSE
        AND date BETWEEN $1 AND $2
    `, [from, to]);
    return result.rows[0];
  }

  async getMonthlyTrends() {
    const result = await query<MonthlyTrendRow>(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
        SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expenses,
        SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE -amount END) AS net
      FROM financial_records
      WHERE is_deleted = FALSE
        AND date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY DATE_TRUNC('month', date) ASC
    `);
    return result.rows;
  }

  async getCategoryBreakdown(type?: string) {
    const typeFilter = type ? `AND type = '${type}'` : '';
    const result = await query<CategoryRow>(`
      SELECT
        category,
        type,
        SUM(amount) AS total,
        COUNT(*) AS count,
        ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS percentage
      FROM financial_records
      WHERE is_deleted = FALSE ${typeFilter}
      GROUP BY category, type
      ORDER BY total DESC
    `);
    return result.rows;
  }
}
```

---

## 6. Route Definitions

```typescript
// routes/auth.routes.ts
router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);
router.post('/refresh',  validate(refreshSchema),  authController.refresh);
router.post('/logout',   authenticate,             authController.logout);

// routes/user.routes.ts
router.get('/',     authenticate, authorize(Role.ADMIN),                      userController.list);
router.post('/',    authenticate, authorize(Role.ADMIN), validate(createUser), userController.create);
router.patch('/:id',authenticate, authorize(Role.ADMIN), validate(updateUser), userController.update);
router.get('/me',   authenticate,                                              userController.me);
router.patch('/me', authenticate,                        validate(updateMe),   userController.updateMe);

// routes/record.routes.ts
router.get('/',     authenticate,                                               recordController.list);
router.post('/',    authenticate, authorize(Role.ANALYST, Role.ADMIN), validate(createRecord), recordController.create);
router.get('/:id',  authenticate,                                               recordController.getById);
router.patch('/:id',authenticate, authorize(Role.ANALYST, Role.ADMIN), validate(updateRecord), recordController.update);
router.delete('/:id',authenticate,authorize(Role.ADMIN),                        recordController.delete);

// routes/dashboard.routes.ts
router.get('/summary',            authenticate, dashboardController.summary);
router.get('/monthly-trends',     authenticate, dashboardController.monthlyTrends);
router.get('/category-breakdown', authenticate, dashboardController.categoryBreakdown);
router.get('/recent-activity',    authenticate, dashboardController.recentActivity);
router.get('/weekly-summary',     authenticate, dashboardController.weeklySummary);
```

---

## 7. API Reference

**Base URL:** `http://localhost:4000/api/v1`  
**Swagger UI:** `http://localhost:4000/api/docs`  
**Auth:** `Authorization: Bearer <accessToken>` on all protected routes

---

### 7.1 Auth Endpoints

| Method | Path | Auth | Body / Response |
|--------|------|------|-----------------|
| POST | `/auth/register` | No | `{ email, password, firstName, lastName }` → 201 user object |
| POST | `/auth/login` | No | `{ email, password }` → 200 `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | No | `{ refreshToken }` → 200 `{ accessToken, refreshToken }` |
| POST | `/auth/logout` | Yes | No body → 200 `{ message }` |

---

### 7.2 Users Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/users` | Yes | ADMIN | List users (paginated) |
| POST | `/users` | Yes | ADMIN | Create user with role |
| PATCH | `/users/:id` | Yes | ADMIN | Update role or isActive |
| GET | `/users/me` | Yes | Any | Get own profile |
| PATCH | `/users/me` | Yes | Any | Update own name / password |

---

### 7.3 Records Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/records` | Yes | Any | List records (filtered, paginated) |
| POST | `/records` | Yes | ANALYST, ADMIN | Create record |
| GET | `/records/:id` | Yes | Any | Get single record |
| PATCH | `/records/:id` | Yes | ANALYST, ADMIN | Update record |
| DELETE | `/records/:id` | Yes | ADMIN | Soft-delete record |

**GET /records Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20, max: 100 |
| `type` | string | INCOME or EXPENSE |
| `category` | string | Exact match |
| `dateFrom` | date | ISO date (YYYY-MM-DD) |
| `dateTo` | date | ISO date (YYYY-MM-DD) |
| `sortBy` | string | date, amount, category |
| `sortOrder` | string | asc or desc |
| `search` | string | Searches in description |

**Paginated Response Shape:**
```json
{
  "data": [ /* records */ ],
  "meta": { "total": 320, "page": 1, "limit": 20, "totalPages": 16 }
}
```

---

### 7.4 Dashboard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/summary` | Yes | Total income, expenses, net balance |
| GET | `/dashboard/monthly-trends` | Yes | Last 12 months income vs expense |
| GET | `/dashboard/category-breakdown` | Yes | Category totals with percentages |
| GET | `/dashboard/recent-activity` | Yes | Last 10 records |
| GET | `/dashboard/weekly-summary` | Yes | Current month week-by-week |

**GET /dashboard/summary Query Params:** `from` (date), `to` (date)

**Summary Response:**
```json
{
  "totalIncome": "125000.00",
  "totalExpenses": "89400.00",
  "netBalance": "35600.00",
  "recordCount": 142,
  "period": { "from": "2026-01-01", "to": "2026-04-05" }
}
```

---

## 8. Zod Validation Schemas

```typescript
// validators/record.schema.ts
export const createRecordSchema = z.object({
  amount: z.number().positive().multipleOf(0.01).max(999_999_999_999.99),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  description: z.string().max(500).optional(),
});

export const recordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'category', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});
```

---

## 9. Error Response Shape

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Number must be positive" },
    { "field": "type", "message": "Invalid enum value" }
  ],
  "timestamp": "2026-04-05T10:00:00.000Z",
  "path": "/api/v1/records"
}
```

| Status | When |
|--------|------|
| 400 | Zod validation failed |
| 401 | Missing / invalid / expired JWT |
| 403 | Role insufficient for the operation |
| 404 | Resource not found |
| 409 | Email already registered |
| 422 | Business rule violation (e.g., deactivating self) |
| 500 | Unexpected server error |

---

## 10. Environment Variables

```env
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/finsight

# JWT
JWT_ACCESS_SECRET=min-32-chars-access-secret-here
JWT_REFRESH_SECRET=min-32-chars-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# CORS
ALLOWED_ORIGIN=http://localhost:3000
```

---

## 11. Seeding

```bash
npx tsx scripts/seed.ts
```

Creates:
- `admin@finsight.com` / `Admin123!` → ADMIN
- `analyst@finsight.com` / `Analyst123!` → ANALYST
- `viewer@finsight.com` / `Viewer123!` → VIEWER
- 50 financial records spread across 12 months, multiple categories
