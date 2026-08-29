# CampusPlus — Campus Hardware Fault Reporting & Tracking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v5.18-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **CampusPlus** is a production-ready, full-stack campus facilities and laboratory hardware fault reporting platform. It bridges the gap between student lab issue reporting and facility maintenance workflows through frictionless reporting, automated deduplication, and complete lifecycle audit trails.

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Core Features](#-core-features)
- [Monorepo Directory Structure](#-monorepo-directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Local Development Setup](#-local-development-setup)
- [Production Deployment Guide](#-production-deployment-guide)
  - [1. Backend API Deployment](#1-backend-api-deployment-render--railway--vps)
  - [2. Frontend SPAs Deployment](#2-frontend-spas-deployment-vercel--netlify--cloudflare)
  - [3. Production Nginx Reverse Proxy](#3-production-nginx-reverse-proxy-sample)
- [REST API Reference](#-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Default Admin Credentials](#-default-admin-credentials)
- [Technical Documentation](#-technical-documentation)

---

## 🏛 Architecture Overview

```
+---------------------------------------------------------------------------------------+
|                                     CLIENT LAYER                                      |
|                                                                                       |
|   +------------------------------------+    +------------------------------------+    |
|   |            Student App             |    |             Admin App              |    |
|   |  • Zero-login complaint filing     |    |  • Operations Dashboard & Metrics  |    |
|   |  • Camera photo capture & upload   |    |  • Status Lifecycle & Timeline     |    |
|   |  • Public live issue ticker        |    |  • Needs Review & Ticket Merging   |    |
|   |  (React 18 + Vite + TailwindCSS)   |    |  (React 18 + Vite + TailwindCSS)   |    |
|   +-----------------+------------------+    +-----------------+------------------+    |
+---------------------|-----------------------------------------|-----------------------+
                      | REST API Requests                       | Authenticated JWT (Bearer)
                      v                                         v
+---------------------------------------------------------------------------------------+
|                                     BACKEND API                                       |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   |                            Express.js REST API Server                         |   |
|   |  • Helmet Security Headers               • Pino HTTP Structured Logging       |   |
|   |  • Express Rate Limiting (DDoS protect)  • Multer File Upload Engine          |   |
|   |  • JWT Authentication Middleware         • Zod Payload Validation             |   |
|   |  • Deduplication & Grouping Engine       • Transactional Merge Manager        |   |
|   +---------------------------------------+---------------------------------------+   |
+-------------------------------------------|-------------------------------------------+
                                            | Prisma ORM (Type-Safe Queries)
                                            v
+---------------------------------------------------------------------------------------+
|                                    DATABASE LAYER                                     |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   |                        PostgreSQL Relational Database                         |   |
|   |  • Reports Table (status, fault, photo)  • Reporters (student details, notes) |   |
|   |  • StatusHistory (immutable audit logs)  • Admins (bcrypt hashed credentials) |   |
|   |  • Buildings & Rooms (reference data)    • Equipment Lookup Metadata          |   |
|   +-------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------+
```

---

## ⚡ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Node.js & Express.js | High-throughput REST API service |
| **Database & ORM** | PostgreSQL & Prisma ORM | Relational data persistence with declarative schemas & migrations |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcrypt` | Secure, stateless admin authentication and password hashing |
| **Security & Logging** | `helmet`, `express-rate-limit`, `pino`, `zod` | DDoS prevention, strict input validation, security headers, and structured logging |
| **File Storage** | Multer (`/uploads`) | Validated multipart/form-data image uploads (JPEG, PNG, WebP) |
| **Student Frontend** | React 18, Vite, TailwindCSS | Lightweight, mobile-first responsive reporting interface |
| **Admin Frontend** | React 18, Vite, TailwindCSS | Operational control center with filterable tables, charts, and review queues |
| **Testing** | Jest, Supertest | Comprehensive end-to-end integration and API unit tests |

---

## 🚀 Core Features

- **Zero-Login Student Reporting:** Frictionless, <60-second issue submission with live camera capture or gallery upload, cascading building/room selectors, and dynamic equipment cataloging tailored to the student's department and specialization.
- **Live Public Ticket Tracking:** Instant status tracking by Ticket ID (`/track`), displaying a 3-stage progress workflow (*Submitted* $\rightarrow$ *Technician Assigned* $\rightarrow$ *Resolved*), community priority boost indicators, and technician maintenance audit logs without requiring account registration.
- **Intelligent Deduplication Engine:** Automatically detects existing open complaints matching `(roomId, deviceNumber)`. Aggregates reporter notes and increments report count to surface high-frequency lab failures.
- **"Needs Review" Queue:** Flags untagged or ambiguous hardware reports for administrative verification with side-by-side suggested candidates in the same room.
- **Transactional Ticket Merging:** Allows facilities managers to merge duplicate reports into master tickets with full reporter history preservation.
- **Immutable Status Audit Trail:** Tracks every lifecycle state change (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` / `Rejected`) with timestamped admin attribution and technician notes.
- **Admin Profile & Credential Management:** Enforces secure credential updates with real-time password strength validation and bcrypt hashing.

---

## 📂 Monorepo Directory Structure

```
Campusplus/
├── backend/                  # Express.js REST API service
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL data models & relations
│   │   ├── migrations/       # Versioned Prisma migration history
│   │   └── seedReports.js    # Database seeder with realistic lab data
│   ├── src/
│   │   ├── controllers/      # Request handlers (admin, report, auth, location)
│   │   ├── middlewares/      # Auth guard, rate limiter, multer, error handler
│   │   ├── routes/           # Versioned API routes (/api/v1/...)
│   │   ├── services/         # Business logic (deduplication, matching engine)
│   │   └── server.js         # Server entry point & Express configuration
│   └── uploads/              # Uploaded evidence images directory
├── student-app/              # Student-facing React SPA
│   ├── src/
│   │   ├── api/              # API client methods for student actions
│   │   ├── components/       # UI elements (Header, Footer, Button, FormField)
│   │   ├── pages/            # HomePage, ReportIssuePage, ConfirmationPage, TrackReportPage
│   │   └── main.jsx          # Student app entry point
│   └── index.html
├── admin-app/                # Facilities Admin React SPA
│   ├── src/
│   │   ├── api/              # Authenticated admin API client
│   │   ├── components/       # Tables, Badges, Modals, StatusStepper, Sidebar
│   │   ├── context/          # Auth context & session provider
│   │   ├── pages/            # Dashboard, AllReports, ReportDetail, NeedsReview, Profile
│   │   └── main.jsx          # Admin app entry point
│   └── index.html
└── docs/                     # Architectural, design, and PRD specifications
```

---

## ⚙ Environment Configuration

Create `.env` files in their respective package directories before starting the applications:

### `backend/.env`
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/campusplus_dev?schema=public"
JWT_SECRET="your_secure_jwt_random_secret_string_min_32_characters"
JWT_EXPIRES_IN="8h"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
```

### `student-app/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### `admin-app/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS
- **PostgreSQL**: `v14+` or `v16+` (running locally or via cloud instance)
- **npm**: `v9+` or `v10+`

### 2. Install Dependencies
Install all workspace dependencies from the project root:
```bash
npm install
```

### 3. Setup Database Schema & Seed Data
Navigate to the `backend` directory, run migrations, and seed initial records:
```bash
cd backend
npx prisma migrate deploy
node prisma/seedReports.js
cd ..
```

### 4. Start Development Servers
Run the backend and frontends in separate terminal windows or concurrently:

```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Student Portal (Port 5173)
npm run dev:student

# Terminal 3: Admin Console (Port 5174)
npm run dev:admin
```

- **Student Portal:** `http://localhost:5173`
- **Admin Console:** `http://localhost:5174`
- **API Health Check:** `http://localhost:5000/api/v1/health`

---

## 🚢 Production Deployment Guide

### 1. Backend API Deployment (Render / Railway / VPS)

#### Build & Start Commands:
- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command:** `npm start` (executes `node src/server.js`)
- **Port:** Configured via `PORT` environment variable (defaults to `5000`).

#### Production Checklist:
1. **Database Connection:** Provide production `DATABASE_URL` (e.g. Supabase, Neon, AWS RDS, or Managed PostgreSQL).
2. **CORS Configuration:** Set `CORS_ORIGIN` to the exact public domains of the deployed Student and Admin apps (e.g. `https://report.yourcampus.edu,https://admin.yourcampus.edu`).
3. **Uploads Directory Persistence:** If deploying to containerized/ephemeral platforms (Render, Railway, Fly.io), attach a persistent disk for `./uploads` or configure S3 storage.
4. **Secrets:** Ensure `JWT_SECRET` is a secure 64-character cryptographic token.

---

### 2. Frontend SPAs Deployment (Vercel / Netlify / Cloudflare)

Both `student-app` and `admin-app` are Single Page Applications built with Vite.

#### Build Configuration:
- **Root Directory:** `student-app` (for Student Portal) or `admin-app` (for Admin Console)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_BASE_URL=https://api.yourcampus.edu/api/v1`

#### Client-Side Routing Configuration (SPA Fallback):
To ensure page refreshes and direct links (e.g., `/reports/123`, `/needs-review`) resolve to `index.html`:

**For Vercel (`vercel.json` in app root):**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**For Netlify (`_redirects` in `public/` directory):**
```
/*    /index.html   200
```

---

### 3. Production Nginx Reverse Proxy (Sample)

If deploying the entire stack to a single Ubuntu/Debian VPS with Nginx:

```nginx
server {
    listen 80;
    server_name campusplus.yourdomain.edu;

    # Static uploads from backend
    location /uploads/ {
        alias /var/www/campusplus/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # REST API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin App SPA
    location /admin {
        alias /var/www/campusplus/admin-app/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # Student App SPA (Root)
    location / {
        root /var/www/campusplus/student-app/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📡 REST API Reference

### Public / Student Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status check |
| `GET` | `/api/v1/departments` | List academic departments and cascading streams |
| `GET` | `/api/v1/buildings` | List campus buildings and associated rooms |
| `POST` | `/api/v1/reports` | Submit hardware fault report with image evidence (multipart/form-data) |
| `GET` | `/api/v1/reports/track/:id` | Public zero-login ticket status tracking (supports UUID, prefix, asset tags) |

### Authenticated Admin Endpoints (Requires `Bearer <JWT_TOKEN>`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/admin/login` | Authenticate admin credentials and issue JWT |
| `GET` | `/api/v1/admin/dashboard-summary` | Dashboard analytics (Total, Open, In Progress, Resolved, Needs Review) |
| `GET` | `/api/v1/admin/reports` | Filterable list of all reports (status, building, room, search) |
| `GET` | `/api/v1/admin/reports/:id` | Detailed view of report, attached reporters, and audit history |
| `PATCH` | `/api/v1/admin/reports/:id/status` | Transition ticket lifecycle status (`open`, `in_progress`, `resolved`, `rejected`) |
| `GET` | `/api/v1/admin/reports/needs-review` | Queue of flagged untagged reports with candidate room matches |
| `POST` | `/api/v1/admin/reports/:id/merge` | Merge flagged report into target master ticket |
| `POST` | `/api/v1/admin/reports/:id/keep-separate` | Dismiss flagged status and confirm report as distinct ticket |
| `PATCH` | `/api/v1/admin/change-password` | Update logged-in administrator password |

---

## 🧪 Testing & Quality Assurance

### Run Automated Backend Test Suite
The backend contains 49 comprehensive integration and unit tests covering duplicate matching, status transitions, public ticket tracking, authentication, and validation:
```bash
npm --prefix backend test
```

### Run Code Quality Linter
```bash
npm run lint
```

### Verify Production Builds
```bash
npm --prefix student-app run build
npm --prefix admin-app run build
```

---

## 🔐 Default Admin Credentials

When the database is initialized using the seed script, the following default administrator account is available:

- **Username:** `admin`
- **Password:** `admin123`

*(Note: In production environments, immediately change this password via the **Admin Profile** page.)*

---

## 📚 Technical Documentation

For in-depth architectural diagrams, database entity relationship schemas, API schemas, and deployment runbooks, consult the repository documentation:

- [`docs/API.md`](docs/API.md) — **REST API Specification** & cURL Request/Response Manual
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — **Production Deployment Runbook** (Cloud, VPS, Nginx, PM2)
- [`docs/PRD.md`](docs/PRD.md) — **Product Requirements Document** & User Stories
- [`docs/TRD.md`](docs/TRD.md) — **Technical Requirements Document** & Validation Schemas
- [`docs/architecture.md`](docs/architecture.md) — **System Architecture**, Security & Database ERD
- [`docs/design.md`](docs/design.md) — **Design System**, Tokens & UI Guidelines
- [`docs/phases.md`](docs/phases.md) — **Implementation & Verification Tracker**
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — **Contribution Guidelines** & Git Workflow
- [`SECURITY.md`](SECURITY.md) — **Security Policy** & Vulnerability Disclosure Process

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

