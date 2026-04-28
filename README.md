# Finsight Platform

Finsight is a full-stack financial dashboard application featuring role-based access control, transaction records management, and real-time financial analytics.

## Technologies Used
- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend**: Node.js, Express.js (Express 5)
- **Database**: PostgreSQL (via Docker)
- **Caching**: Redis (via Docker)
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly cookies

## Prerequisites
To run this project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker](https://www.docker.com/) and Docker Compose

## Quick Start Guide

### 1. Start Infrastructure (Database & Redis)
Ensure Docker is running on your machine, then spin up the required database and cache containers:
```bash
docker-compose up -d
```

### 2. Setup the Backend
Open a terminal in the `backend` directory:
```bash
cd backend
npm install
```

**Database Migrations & Seeding**
Initialize the database tables and populate the database with test users and dummy financial records:
```bash
npm run migrate
npm run seed
```

**Start Backend Server**
```bash
npm run dev
```
The API will run on `http://localhost:5000`.

### 3. Setup the Frontend
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## Test Credentials

The database is seeded with the following user accounts for testing different role-based access levels. Use these credentials to log in at `http://localhost:3000/login`:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@finsight.com` | `Admin123!` | Full access. Can view/edit all records and access the User Management section. |
| **Analyst** | `analyst@finsight.com` | `Analyst123!` | Can view and add financial records. Cannot manage users. |
| **Viewer** | `viewer@finsight.com` | `Viewer123!` | Read-only access to records and dashboards. |

---

## Troubleshooting

- **500 Internal Server Errors / Blank Dashboard**: Ensure that your local Docker PostgreSQL container is running (`docker-compose ps`) and that you have successfully run the `npm run seed` command in the backend directory.
- **Port Conflicts**: The backend uses port `5000`, PostgreSQL uses `5432`, and Redis uses `6379`. Ensure these ports are free on your machine before starting the application.
