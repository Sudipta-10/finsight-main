# Frontend Architecture
## FinSight — Next.js 14 Dashboard Design System & Component Guide

**Version:** 1.1.0  
**Framework:** Next.js 14 (App Router) + TypeScript  
**Theme:** Light, enterprise-grade, editorial precision

---

## 1. Design Philosophy

FinSight's frontend follows an **"Editorial Authority"** aesthetic — the visual language of high-quality financial publications combined with the functional clarity of modern SaaS. Clean, structured, and deeply trustworthy.

**Core Principles:**
- **Hierarchy first** — One primary data story per page; one primary action per view
- **Data density without clutter** — Financial dashboards need information density; achieve it through typographic rhythm and grid discipline
- **Trust through restraint** — Generous whitespace, strict alignment, and calm colors signal reliability
- **Zero ambiguity** — Every number has a unit. Every action has a label. Every state has visual feedback.

---

## 2. Next.js App Router Structure

```
frontend/app/
├── layout.tsx                    # Root layout: fonts, providers, metadata
├── globals.css                   # CSS variables, Tailwind base
│
├── (auth)/                       # Auth route group (no dashboard shell)
│   └── login/
│       └── page.tsx              # Login page (Server Component shell)
│
└── (dashboard)/                  # Dashboard route group
    ├── layout.tsx                # App shell: Sidebar + Topbar
    ├── dashboard/
    │   └── page.tsx              # Dashboard overview (Server Component)
    ├── records/
    │   ├── page.tsx              # Records list (Server Component)
    │   └── [id]/
    │       └── page.tsx          # Record detail (Server Component)
    ├── users/
    │   └── page.tsx              # Users management (Server Component)
    └── profile/
        └── page.tsx              # User profile (Server Component)
```

### Server vs Client Components

| Component | Type | Reason |
|-----------|------|--------|
| `app/(dashboard)/layout.tsx` | Server | Static shell, reads auth cookie server-side |
| `app/dashboard/page.tsx` | Server | Initial data fetch (SSR) for fast first paint |
| `components/charts/MonthlyTrendChart.tsx` | Client | Recharts requires browser DOM |
| `components/features/records/RecordTable.tsx` | Client | Sort/filter interactivity |
| `components/features/records/RecordForm.tsx` | Client | React Hook Form needs browser events |
| `components/layout/Sidebar.tsx` | Client | Active link tracking via `usePathname()` |
| `components/ui/Modal.tsx` | Client | Radix Dialog, browser state |

---

## 3. Design System

### 3.1 Typography

```css
/* Root layout: Google Fonts */
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'

const dmSerifDisplay = DM_Serif_Display({ weight: '400', subsets: ['latin'] })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500'] })
```

| Role | Font | Usage |
|------|------|-------|
| Display | DM Serif Display 400 | Page heroes, KPI values, large numbers |
| Body | DM Sans 400/500/600 | All UI text, labels, navigation |
| Mono | JetBrains Mono 500 | Amounts, IDs, dates in tables |

---

### 3.2 Color Tokens

```css
/* globals.css */
:root {
  --primary:        #0F2B5B;
  --primary-hover:  #1A3F7A;
  --accent:         #F59E0B;
  --accent-light:   #FEF3C7;

  --bg:             #FAFAFA;
  --surface:        #FFFFFF;
  --border:         #E5E7EB;
  --border-strong:  #D1D5DB;

  --text:           #111827;
  --text-subtle:    #6B7280;
  --text-faint:     #9CA3AF;

  --income:         #10B981;
  --income-bg:      #ECFDF5;
  --expense:        #EF4444;
  --expense-bg:     #FEF2F2;

  --sidebar-bg:     #0F2B5B;
  --sidebar-text:   #E2E8F0;
  --sidebar-hover:  #1A3F7A;
  --sidebar-active: #F59E0B;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

---

### 3.3 Tailwind Config

```typescript
// tailwind.config.ts
export default {
  content: ['./app/**/*.tsx', './components/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        primary: '#0F2B5B',
        accent:  '#F59E0B',
        income:  '#10B981',
        expense: '#EF4444',
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

---

## 4. Page Designs

### 4.1 Login Page
**Type:** Client Component (form interaction)  
**Layout:** Split panel — navy brand left (60%), white form right (40%)

```
┌────────────────────────────────────────────────┐
│  [Deep Navy #0F2B5B]    │  [White]             │
│                         │                      │
│   FinSight              │  Welcome back         │
│   ──────────            │                      │
│                         │  [Email           ]  │
│   "Complete             │  [Password        ]  │
│   clarity over          │                      │
│   your finances."       │  [    Sign In     ]  │
│                         │                      │
│   ● ● ●                 │  Role-based access   │
│   (decorative dots)     │  control enabled     │
└────────────────────────────────────────────────┘
```

**Interactions:**
- Input focus → border becomes `--primary` with 200ms transition
- Submit → button shows spinner, text becomes "Signing in..."
- Error → field border turns red + error message fades in below
- Success → fade out → push to /dashboard

---

### 4.2 Dashboard Page
**Type:** Server Component (initial data) + Client subcomponents (charts)  
**Layout:** Fixed sidebar (240px) + scrollable main area

```
┌──────────┬──────────────────────────────────────────┐
│          │  Dashboard                Apr 2026  [▼]  │
│ FINSIGHT │──────────────────────────────────────────│
│  ──────  │                                          │
│ Dashboard│  ┌────────────┐ ┌────────────┐ ┌──────┐ │
│ Records  │  │ Total      │ │ Total      │ │ Net  │ │
│ Users ¹  │  │ Income     │ │ Expenses   │ │ Bal. │ │
│ Profile  │  │ $125,000   │ │ $89,400    │ │$35.6K│ │
│  ──────  │  │ ↑ 12.4%    │ │ ↑ 3.1%    │ │↑ 42% │ │
│ Jane S.  │  └────────────┘ └────────────┘ └──────┘ │
│ Admin    │                                          │
│          │  ┌──────────────────────┐ ┌───────────┐ │
│          │  │ Monthly Trends       │ │ Category  │ │
│          │  │ [Recharts AreaChart] │ │ Breakdown │ │
│          │  │  income vs expenses  │ │ [PieChart]│ │
│          │  └──────────────────────┘ └───────────┘ │
│          │                                          │
│          │  ┌────────────────────────────────────┐  │
│          │  │ Recent Activity                    │  │
│          │  │ ↑ Apr 5  Q1 Sales Revenue  $15,000 │  │
│          │  │ ↓ Apr 4  Office Supplies   $320    │  │
│          │  └────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────┘

¹ Visible to ADMIN only
```

---

### 4.3 Records Page
**Type:** Server Component shell + Client table with filters

```
┌──────────┬──────────────────────────────────────────┐
│          │ Financial Records        [+ New Record]² │
│ Sidebar  │──────────────────────────────────────────│
│          │ [Type ▼][Category ▼][Jan 1 – Apr 5 📅][🔍]│
│          │──────────────────────────────────────────│
│          │ Date     Description      Category  Amt  │
│          │──────────────────────────────────────────│
│          │ Apr 5    Q1 Sales Revenue  Sales    $15K↑│
│          │ Apr 4    Office Supplies   Office   $320↓│
│          │ Apr 3    Contractor Fee    Services $5K↓ │
│          │──────────────────────────────────────────│
│          │ ← Prev  Page 1 of 16  Next →  [20▼/page]│
└──────────┴──────────────────────────────────────────┘

² Visible to ANALYST and ADMIN
```

**Row hover:** `#F9FAFB` background, edit/delete icons fade in  
**ADMIN only:** Delete icon → confirmation modal → soft delete

---

### 4.4 Users Page (Admin only)
**Layout:** Table with role badge, status badge, action dropdown

```
┌──────────┬──────────────────────────────────────────┐
│          │ User Management           [+ Add User]   │
│ Sidebar  │──────────────────────────────────────────│
│          │ [Role ▼] [Status ▼]          [🔍 Search] │
│          │──────────────────────────────────────────│
│          │ Name          Email          Role  Status│
│          │ Jane Smith    jane@co.com   ADMIN  ● Active│
│          │ John Doe      john@co.com   ANALYST ● Active│
│          │ Sarah Lee     sarah@co.com  VIEWER ○ Inactive│
│          │──────────────────────────────────────────│
│          │                            Page 1 of 3  │
└──────────┴──────────────────────────────────────────┘
```

---

## 5. Recharts Integration

### MonthlyTrendChart
```tsx
'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function MonthlyTrendChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: '#6B7280' }} />
        <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#6B7280' }}
               tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                 contentStyle={{ fontFamily: 'DM Sans', borderRadius: 8, border: '1px solid #E5E7EB' }} />
        <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 13 }} />
        <Area type="monotone" dataKey="income"   stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)"  name="Income" />
        <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

### CategoryPieChart
```tsx
'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#0F2B5B', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6']

export function CategoryPieChart({ data }: { data: CategoryBreakdown[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
             dataKey="total" nameKey="category" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                 contentStyle={{ fontFamily: 'DM Sans', borderRadius: 8 }} />
        <Legend iconType="circle" wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

---

## 6. API Client & Token Refresh

```typescript
// lib/api.ts — Axios client with auto token refresh
import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        return new Promise(resolve => {
          queue.push(token => { original.headers.Authorization = `Bearer ${token}`; resolve(api(original)) })
        })
      }
      isRefreshing = true
      try {
        const { refreshToken } = useAuthStore.getState()
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken })
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
        queue.forEach(cb => cb(data.accessToken))
        queue = []
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## 7. Auth Store (Zustand)

```typescript
// store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: { id: string; email: string; firstName: string; role: string } | null
  isAuthenticated: boolean
  setAuth: (data: { accessToken: string; refreshToken: string; user: AuthUser }) => void
  setTokens: (access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    { name: 'finsight-auth', partialize: s => ({ refreshToken: s.refreshToken, user: s.user }) }
  )
)
```

---

## 8. Key UI Components

### KPICard
```tsx
interface KPICardProps {
  label: string
  value: string          // Pre-formatted: "$125,000"
  change?: number        // +12.4 or -3.1
  changeLabel?: string   // "vs last month"
  variant: 'income' | 'expense' | 'neutral'
  isLoading?: boolean
}
```
- Large value in `font-display` (DM Serif Display)
- Trend arrow: ↑ emerald / ↓ red with percentage
- Skeleton shimmer when `isLoading`

### RecordBadge
```tsx
// INCOME → emerald pill   EXPENSE → red pill
<RecordBadge type="INCOME" />   // → "↑ Income"
<RecordBadge type="EXPENSE" />  // → "↓ Expense"
```

### ProtectedRoute / Role Guard (Next.js Middleware)
```typescript
// middleware.ts — runs on edge
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role check for /users path — ADMIN only
  if (request.nextUrl.pathname.startsWith('/users')) {
    const payload = decodeJwt(token!)  // lightweight decode, no verify needed on edge
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
}

export const config = { matcher: ['/((?!_next|api|favicon).*)'] }
```

---

## 9. Animation Guidelines (Framer Motion)

| Element | Animation | Duration |
|---------|-----------|----------|
| Page entry | `opacity: 0→1`, `y: 12→0` | 300ms ease-out |
| KPI cards | Stagger children 60ms apart | 250ms each |
| Modal open | `scale: 0.96→1` + `opacity` | 200ms |
| Sidebar nav item | Background slide | 150ms |
| Chart mount | Recharts built-in | 800ms |
| Toast | `x: 100%→0` (slide from right) | 300ms |
| Skeleton | Shimmer pulse | 1500ms loop |

---

## 10. Responsive Design

| Breakpoint | Behavior |
|-----------|---------|
| `< 768px` | Sidebar hidden; hamburger button in topbar |
| `768px–1023px` | Sidebar collapsed to 56px icon rail with tooltips |
| `≥ 1024px` | Full sidebar at 240px |

KPI cards: `grid-cols-3` → `grid-cols-2` → `grid-cols-1`  
Charts: Fixed height, `width="100%"` via `ResponsiveContainer`

---

## 11. Utility Functions

```typescript
// lib/formatters.ts
export const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount))

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))

export const formatPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
```
