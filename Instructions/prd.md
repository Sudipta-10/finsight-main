# Product Requirements Document (PRD)
## FinSight — Enterprise Finance Dashboard Platform

**Version:** 1.1.0  
**Date:** April 2026  
**Status:** Approved  
**Stack:** Express.js · PostgreSQL · Next.js · Recharts

---

## 1. Executive Summary

FinSight is a role-aware, enterprise-grade finance dashboard platform that enables organizations to track, manage, and analyze financial records through a secure, multi-tier web application. The system provides real-time visibility into income, expenses, and net financial position while enforcing strict role-based access control (RBAC) across every operation — at the API layer, not just the UI.

The platform serves finance teams, operations analysts, and executive stakeholders simultaneously — each receiving a contextually appropriate experience governed by their assigned role.

---

## 2. Problem Statement

Organizations managing financial data at scale face three compounding problems:

1. **Data fragmentation** — Financial records live in spreadsheets, disconnected tools, and siloed systems with no unified view
2. **Access ambiguity** — No clear enforcement of who can view, modify, or delete sensitive financial records, creating compliance and audit risk
3. **Insight latency** — Aggregated summaries (totals, trends, category breakdowns) require manual effort, delaying decisions

FinSight solves all three: a unified backend enforces access control at every endpoint, PostgreSQL aggregations power instant dashboard analytics, and Next.js delivers a polished, role-appropriate frontend experience.

---

## 3. Goals and Non-Goals

### Goals
- Secure, role-differentiated access to all financial operations
- Full CRUD on financial entries with rich filtering, sorting, and search
- Dashboard-level summary APIs for aggregate analytics (not just CRUD)
- Backend-level RBAC — UI restrictions alone are insufficient for security
- Clean, documented, maintainable codebase that demonstrates architectural thinking
- A light-theme, enterprise-grade frontend built with Next.js and Recharts

### Non-Goals (v1.0)
- Multi-tenant organization isolation
- Real-time collaborative editing (WebSockets)
- Mobile native applications
- External accounting integrations (QuickBooks, Xero, Stripe)
- Payroll, invoicing, or approval workflow modules
- OAuth / SSO authentication

---

## 4. User Personas

### 4.1 The Viewer — "Executive Stakeholder"
**Goal:** Quick, reliable view of financial health without noise  
**Needs:** Dashboard summaries, read-only record browsing  
**Pain Point:** Accidentally modifying records; seeing irrelevant management controls

### 4.2 The Analyst — "Finance Analyst"
**Goal:** Deep-dive into records and trends for reporting  
**Needs:** Full record access, filtering, trend charts, create and update capability  
**Pain Point:** Limited filter options; no time-series visibility

### 4.3 The Admin — "Finance Manager / System Owner"
**Goal:** Full control — users, records, and data governance  
**Needs:** User creation and role management, full record CRUD including delete  
**Pain Point:** No centralized control panel; inability to deactivate compromised accounts

---

## 5. Core Feature Requirements

### 5.1 Authentication & Session Management
| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Email/password login returning JWT access + refresh tokens | P0 |
| AUTH-02 | Access token: 15-minute expiry | P0 |
| AUTH-03 | Refresh token: 7-day expiry, stored in Redis | P0 |
| AUTH-04 | Token rotation on every refresh | P0 |
| AUTH-05 | Logout invalidates refresh token server-side | P0 |
| AUTH-06 | Inactive users rejected at login | P0 |
| AUTH-07 | Rate limiting on auth endpoints | P1 |

### 5.2 User & Role Management
| ID | Requirement | Priority |
|----|-------------|----------|
| USR-01 | Admin can create users with assigned roles | P0 |
| USR-02 | Admin can update user role and active status | P0 |
| USR-03 | Admin can list all users (paginated, filterable) | P0 |
| USR-04 | All users can view and update their own profile | P1 |
| USR-05 | Users can change their own password (with old password verification) | P1 |

### 5.3 Financial Records Management
| ID | Requirement | Priority |
|----|-------------|----------|
| REC-01 | Record fields: amount, type, category, date, description, created_by | P0 |
| REC-02 | Types: INCOME or EXPENSE (PostgreSQL ENUM) | P0 |
| REC-03 | ANALYST and ADMIN can create and update records | P0 |
| REC-04 | ADMIN only can delete records (soft delete) | P0 |
| REC-05 | All roles can view records | P0 |
| REC-06 | Filter by: type, category, date range, description search | P1 |
| REC-07 | Sort by any field; paginate with configurable page size | P1 |
| REC-08 | Soft-deleted records excluded from all listings and aggregations | P0 |

### 5.4 Dashboard Summary APIs
| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-01 | Total income, total expenses, net balance (with optional date range) | P0 |
| DASH-02 | Monthly trend: income vs expenses for last 12 months | P0 |
| DASH-03 | Category-wise totals with percentages | P0 |
| DASH-04 | Recent activity: last 10 records | P0 |
| DASH-05 | Weekly breakdown for current month | P1 |

### 5.5 Access Control
| ID | Requirement | Priority |
|----|-------------|----------|
| ACL-01 | RBAC enforced in Express middleware (not just UI) | P0 |
| ACL-02 | VIEWER: read-only — records and dashboard | P0 |
| ACL-03 | ANALYST: read + create + update records; full dashboard | P0 |
| ACL-04 | ADMIN: full access including delete and user management | P0 |
| ACL-05 | Unauthorized operations return 403 with descriptive message | P0 |

### 5.6 Validation & Error Handling
| ID | Requirement | Priority |
|----|-------------|----------|
| VAL-01 | All request bodies and query params validated via Zod | P0 |
| VAL-02 | Field-level error messages returned for validation failures | P0 |
| VAL-03 | Consistent error response envelope across all endpoints | P0 |
| VAL-04 | Parameterized SQL only — no string concatenation | P0 |
| VAL-05 | `sortBy` column names whitelisted before SQL interpolation | P0 |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Dashboard APIs < 300ms p95; records list < 200ms |
| Security | bcryptjs cost 12; JWT secrets ≥ 32 chars; helmet headers |
| Security | Parameterized SQL on all queries |
| Scalability | Stateless Express API; pg connection pool |
| Reliability | Global Express error handler; no raw stack traces in production |
| DX | Swagger UI at `/api/docs`; full stack runs in < 10 min via Docker |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| All P0 features functional | 100% |
| Role enforcement — no privilege escalation possible | 100% |
| API response time p95 | < 300ms |
| SQL injection surface | Zero (parameterized queries only) |
| README setup time | < 10 minutes |
| Swagger coverage | All endpoints documented |

---

## 8. Assumptions

1. Single-organization deployment in v1 — no multi-tenancy
2. USD is the only currency; amounts stored as `NUMERIC(15,2)`
3. Categories are predefined constants, not user-managed entities in v1
4. Authentication is local (email/password); OAuth deferred to v2
5. All timestamps stored and returned as UTC ISO 8601
6. `/auth/register` is open for development; production restricts user creation to Admin

---

## 9. Out of Scope (Explicitly)

- Real-time push updates (WebSockets / SSE)
- File/receipt attachments to records
- Approval workflows
- Audit trail / change history (deferred to v1.1)
- Email notifications
- Multi-currency support
- Hard delete of records
