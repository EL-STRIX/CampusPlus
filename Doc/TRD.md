# CampusPlus — Technical Requirements Document (TRD)

**Document Version:** 1.0
**Status:** Deployment-Ready
**Package Manager:** npm
**Placeholder Domain:** campusplus.edu (replace with real institution domain before production launch)
**Last Updated:** August 21, 2026

---

## 0. Purpose & Relationship to Other Documents

| Document | Answers |
|---|---|
| `PRD.md` | *What* are we building and *why*? (features, user stories, scope) |
| `design.md` | *What does it look like*? (UI/UX, layout, visual system) |
| `architecture.md` | *How is the system structured* at a high level? (components, infra, security model) |
| **`TRD.md` (this document)** | *Exactly how is it built*? (versions, configs, precise API contracts, coding standards, sequence flows, non-functional targets with real numbers, setup commands) |

This document is the **implementation-level source of truth**. Any technical decision not explicitly stated here defaults to what's written in `architecture.md`. If this document and `architecture.md` ever conflict, this document (being more specific) wins, and `architecture.md` should be updated to match.

---

## 1. Technology Stack — Exact Versions

| Layer | Technology | Version (minimum) | Notes |
|---|---|---|---|
| Runtime | Node.js | 20.x LTS | Use `.nvmrc` in `backend/` pinning exact version |
| Package Manager | npm | 10.x | Bundled with Node 20 |
| Backend Framework | Express.js | 4.19.x | |
| ORM | Prisma | 5.x | `prisma` + `@prisma/client` |
| Database | PostgreSQL | 15.x | Managed instance in production |
| Validation | Zod | 3.23.x | Shared validation schemas between routes |
| Auth | jsonwebtoken | 9.x | JWT signing/verification |
| Password Hashing | bcrypt | 5.x | Cost factor 12 |
| Rate Limiting | express-rate-limit | 7.x | |
| Security Headers | helmet | 7.x | |
| CORS | cors | 2.8.x | |
| File Upload Handling | multer | 1.4.x | Disk storage engine, per architecture §8 |
| Logging | pino + pino-http | 9.x | Structured JSON logs |
| Error Tracking | @sentry/node | 8.x | Production only |
| Testing (backend) | Jest + Supertest | 29.x / 7.x | |
| Frontend Build Tool | Vite | 5.x | Both `student-app` and `admin-app` |
| Frontend Framework | React | 18.x | |
| Routing | React Router | 6.x | |
| Styling | Tailwind CSS | 3.4.x | |
| Server State (admin-app) | TanStack Query | 5.x | |
| HTTP Client | Axios | 1.7.x | |
| Frontend Testing | Vitest + React Testing Library | 2.x / 16.x | Optional per architecture §16 |
| CI/CD | GitHub Actions | — | |
| Hosting (frontends) | Vercel | — | |
| Hosting (backend + DB) | Render | — | Persistent disk plan required |

---

## 2. Local Development Environment Setup

### 2.1 Prerequisites
- Node.js 20.x installed (recommend via `nvm`)
- npm 10.x (bundled)
- Docker (for local PostgreSQL instance) — or a local Postgres 15 install
- Git

### 2.2 Setup Commands (Backend)
```bash
cd backend
npm install
cp .env.example .env          # fill in local values
docker compose up -d db        # starts local Postgres container
npx prisma migrate dev         # applies schema migrations locally
npm run seed:dev               # seeds dummy departments/buildings + a dev admin account
npm run dev                    # starts backend on http://localhost:5000
```

### 2.3 Setup Commands (student-app / admin-app)
```bash
cd student-app        # or admin-app
npm install
cp .env.example .env
npm run dev            # Vite dev server, default http://localhost:5173 (student-app), 5174 (admin-app)
```

### 2.4 Local `docker-compose.yml` (backend/)
```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: campusplus
      POSTGRES_PASSWORD: localdevpassword
      POSTGRES_DB: campusplus_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

---

## 3. Coding Standards

### 3.1 Language & Style
- JavaScript (ES2022+) throughout — TypeScript is **not** required for v1 given solo-developer scope and academic timeline, but all Prisma-generated types should still be leveraged in the backend where convenient (Prisma Client provides autocompletion even in plain JS with JSDoc).
- ESLint (`eslint:recommended` + `eslint-plugin-react` for frontend) + Prettier enforced via a pre-commit hook (`husky` + `lint-staged`).
- File naming: `camelCase.js` for utilities/services, `PascalCase.jsx` for React components, `kebab-case` for route files (`reports.routes.js`).

### 3.2 Git Conventions
- Conventional Commits format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- One feature branch per PRD user story where practical (e.g., `feat/report-submission-form`, `feat/duplicate-matching-service`).
- No direct commits to `main` — enforced via GitHub branch protection rule (requires PR + passing CI checks).

### 3.3 Backend Code Organization Rules
- Controllers **never** contain business logic — they only parse `req`, call a service function, and shape `res`.
- Services **never** import Express (`req`/`res`) — keeps them unit-testable in isolation, per `architecture.md` §16.
- All database access goes through Prisma Client — no raw SQL except where Prisma cannot express a query (must be documented inline with a comment explaining why).

---

## 4. Detailed Database Schema (Prisma Format)

This is the authoritative, implementation-ready version of the schema described conceptually in `PRD.md` §10.

```prisma
// backend/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ReportStatus {
  open
  in_progress
  resolved
  rejected
}

model Report {
  id                   String    @id @default(uuid())
  deviceType           String    @map("device_type")
  deviceNumber         String?   @map("device_number")
  deviceNumberVisible  Boolean   @map("device_number_visible")
  buildingId           String    @map("building_id")
  roomId               String    @map("room_id")
  photoUrl             String    @map("photo_url")
  reportCount          Int       @default(1) @map("report_count")
  possibleDuplicate    Boolean   @default(false) @map("possible_duplicate")
  suggestedMatchIds    String[]  @map("suggested_match_ids")
  mergedInto           String?   @map("merged_into")
  status               ReportStatus @default(open)
  rejectionReason      String?   @map("rejection_reason")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  resolvedAt           DateTime? @map("resolved_at")

  building              Building              @relation(fields: [buildingId], references: [id])
  room                  Room                  @relation(fields: [roomId], references: [id])
  reporters             ReportReporter[]
  statusHistory         ReportStatusHistory[]

  @@index([roomId, deviceNumber])
  @@index([status])
  @@index([reportCount])
  @@map("reports")
}

model ReportReporter {
  id            String   @id @default(uuid())
  reportId      String   @map("report_id")
  studentCode   String   @map("student_code")
  department    String
  stream        String
  yearSemester  String?  @map("year_semester")
  notes         String?
  reportedAt    DateTime @default(now()) @map("reported_at")

  report        Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@map("report_reporters")
}

model ReportStatusHistory {
  id         String       @id @default(uuid())
  reportId   String       @map("report_id")
  status     ReportStatus
  changedAt  DateTime     @default(now()) @map("changed_at")
  changedBy  String       @map("changed_by")

  report     Report       @relation(fields: [reportId], references: [id], onDelete: Cascade)
  admin      Admin        @relation(fields: [changedBy], references: [id])

  @@index([reportId])
  @@map("report_status_history")
}

model Admin {
  id            String    @id @default(uuid())
  username      String    @unique
  passwordHash  String    @map("password_hash")
  createdAt     DateTime  @default(now()) @map("created_at")

  statusChanges ReportStatusHistory[]

  @@map("admins")
}

model Department {
  id       String    @id @default(uuid())
  name     String
  streams  Stream[]

  @@map("departments")
}

model Stream {
  id            String     @id @default(uuid())
  name          String
  departmentId  String     @map("department_id")
  department    Department @relation(fields: [departmentId], references: [id])

  @@map("streams")
}

model Building {
  id      String   @id @default(uuid())
  name    String
  rooms   Room[]
  reports Report[]

  @@map("buildings")
}

model Room {
  id          String    @id @default(uuid())
  name        String
  buildingId  String    @map("building_id")
  building    Building  @relation(fields: [buildingId], references: [id])
  reports     Report[]

  @@map("rooms")
}
```

---

## 5. API Contract — Full Request/Response Specifications

Base URL: `https://api.campusplus.edu/api/v1`

### 5.1 `POST /reports` (Public)
**Request:** `multipart/form-data`
```
photo: File (required, image/jpeg|image/png|image/webp, max 5MB)
studentCode: string (required)
department: string (required, must match a seeded department name)
stream: string (required, must match a seeded stream name under that department)
yearSemester: string (optional)
buildingId: string (required, UUID)
roomId: string (required, UUID)
deviceType: string (required, enum: fan|light|ac|projector|monitor|keyboard|mouse|cpu|ups|ethernet_cable|hdmi_cable|other_cable|other)
deviceNumber: string (required unless deviceNumberVisible=false)
deviceNumberVisible: boolean (required)
additionalNotes: string (optional, max 500 chars)
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "reportId": "a1b2c3d4-...",
    "isNewReport": true,
    "isPossibleDuplicate": false,
    "reportCount": 1
  },
  "error": null
}
```

**Response `400 Bad Request`** (validation failure):
```json
{
  "success": false,
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "roomId is required" }
}
```

**Response `429 Too Many Requests`:**
```json
{
  "success": false,
  "data": null,
  "error": { "code": "RATE_LIMITED", "message": "Too many submissions from this network. Please try again later." }
}
```

---

### 5.2 `GET /departments` (Public)
**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept-uuid-1",
      "name": "Computer Science & Engineering",
      "streams": [
        { "id": "stream-uuid-1", "name": "CSE Core" },
        { "id": "stream-uuid-2", "name": "AI & Data Science" }
      ]
    }
  ],
  "error": null
}
```

---

### 5.3 `GET /buildings` (Public)
**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bldg-uuid-1",
      "name": "Block A",
      "rooms": [
        { "id": "room-uuid-1", "name": "401" },
        { "id": "room-uuid-2", "name": "402" }
      ]
    }
  ],
  "error": null
}
```

---

### 5.4 `GET /reports/track/:id` (Public)
**Description:** Public ticket tracking lookup. Allows checking status by UUID or 8-character prefix without authentication. Input is sanitized to strip prefixes/quotes.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "4a993b5c-dc78-451c-a29c-57dad78dabf4",
    "deviceType": "GPU Deep Learning Workstation (NVIDIA / CUDA)",
    "deviceNumber": "BWU/CSE/GPU-04",
    "deviceNumberVisible": true,
    "labType": null,
    "photoUrl": "/uploads/d1990ff0-68b5-422f-bee4-ce0643bcc368.jpg",
    "buildingId": null,
    "buildingName": "Academic Block 1",
    "roomId": null,
    "roomName": "AI & Robotics Lab 408",
    "reportCount": 2,
    "status": "in_progress",
    "rejectionReason": null,
    "mergedInto": null,
    "mergedIntoReport": null,
    "createdAt": "2026-08-22T15:28:15.701Z",
    "updatedAt": "2026-08-22T16:10:00.000Z",
    "resolvedAt": null,
    "statusHistory": [
      {
        "id": "hist_01",
        "status": "open",
        "changedAt": "2026-08-22T15:28:15.701Z",
        "changedBy": "Facilities Maintenance Staff"
      },
      {
        "id": "hist_02",
        "status": "in_progress",
        "changedAt": "2026-08-22T16:10:00.000Z",
        "changedBy": "Facilities Maintenance Staff"
      }
    ]
  },
  "error": null
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Report ticket \"4a993b5c\" was not found. Please check your Ticket ID and try again."
  }
}
```

---

### 5.5 `POST /admin/login` (Public)
**Request:**
```json
{ "username": "admin", "password": "••••••••" }
```
**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "8h",
    "admin": { "id": "admin-uuid", "username": "admin" }
  },
  "error": null
}
```
**Response `401 Unauthorized`:**
```json
{ "success": false, "data": null, "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid username or password" } }
```

---

### 5.5 `GET /admin/reports` (Protected)
**Headers:** `Authorization: Bearer <token>`
**Query params:** `status`, `buildingId`, `department`, `deviceType`, `dateFrom`, `dateTo`, `search`, `sortBy` (default `reportCount`), `sortOrder` (default `desc`), `page` (default 1), `limit` (default 20)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "a1b2c3d4-...",
        "deviceType": "cpu",
        "deviceNumber": "1892",
        "photoUrl": "https://api.campusplus.edu/uploads/xyz.jpg",
        "buildingName": "Block A",
        "roomName": "401",
        "reportCount": 3,
        "status": "open",
        "createdAt": "2026-08-20T10:15:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "totalPages": 4, "totalReports": 73 }
  },
  "error": null
}
```

---

### 5.6 `GET /admin/reports/:id` (Protected)
**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "deviceType": "cpu",
    "deviceNumber": "1892",
    "deviceNumberVisible": true,
    "photoUrl": "https://api.campusplus.edu/uploads/xyz.jpg",
    "buildingName": "Block A",
    "roomName": "401",
    "reportCount": 3,
    "status": "open",
    "possibleDuplicate": false,
    "reporters": [
      { "studentCode": "22CSE303", "department": "CSE", "stream": "CSE Core", "notes": null, "reportedAt": "2026-08-20T10:15:00.000Z" },
      { "studentCode": "22CSE301", "department": "CSE", "stream": "CSE Core", "notes": "Screen flickers too", "reportedAt": "2026-08-20T11:02:00.000Z" }
    ],
    "statusHistory": [
      { "status": "open", "changedAt": "2026-08-20T10:15:00.000Z", "changedBy": "admin" }
    ]
  },
  "error": null
}
```

---

### 5.7 `PATCH /admin/reports/:id/status` (Protected)
**Request:**
```json
{ "status": "in_progress" }
```
or, for rejection:
```json
{ "status": "rejected", "rejectionReason": "Duplicate of report #a9f2..." }
```
**Response `200 OK`:**
```json
{ "success": true, "data": { "id": "a1b2c3d4-...", "status": "in_progress" }, "error": null }
```
**Response `400 Bad Request`** (missing reason on rejection):
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "rejectionReason is required when status is 'rejected'" } }
```

---

### 5.8 `GET /admin/reports/needs-review` (Protected)
Same response shape as §5.5, filtered to `possibleDuplicate: true`, plus a `suggestedMatches` array of candidate report summaries per report.

---

### 5.9 `POST /admin/reports/:id/merge` (Protected)
**Request:**
```json
{ "targetReportId": "existing-report-uuid" }
```
**Response `200 OK`:**
```json
{ "success": true, "data": { "mergedInto": "existing-report-uuid", "newReportCount": 4 }, "error": null }
```

---

### 5.10 `POST /admin/reports/:id/keep-separate` (Protected)
**Response `200 OK`:**
```json
{ "success": true, "data": { "id": "a1b2c3d4-...", "possibleDuplicate": false }, "error": null }
```

---

### 5.11 `GET /admin/dashboard-summary` (Protected)
**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "open": 12, "inProgress": 5, "resolved": 48, "rejected": 2, "needsReview": 3 },
  "error": null
}
```

---

### 5.12 `PATCH /admin/profile/password` (Protected)
**Request:**
```json
{ "currentPassword": "••••••••", "newPassword": "••••••••" }
```
**Response `200 OK`:**
```json
{ "success": true, "data": { "message": "Password updated successfully" }, "error": null }
```

---

### 5.13 `GET /health` (Public)
**Response `200 OK`:**
```json
{ "status": "ok", "db": "connected", "uptime": 123456 }
```

---

## 6. Sequence Diagrams (Key Flows)

### 6.1 Report Submission (New, No Duplicate)
```
Student Browser        student-app            backend API              PostgreSQL          Disk Storage
     |                       |                       |                       |                    |
     |--Fill form & submit-->|                       |                       |                    |
     |                       |--POST /reports------->|                       |                    |
     |                       |  (multipart/form-data)|                       |                    |
     |                       |                       |--Validate MIME/size-->|                    |
     |                       |                       |--Save photo file----->|------------------->|
     |                       |                       |<--photo saved, URL----|                    |
     |                       |                       |--BEGIN TRANSACTION--->|                    |
     |                       |                       |--Query: match on------>|                    |
     |                       |                       |  room+deviceNumber    |                    |
     |                       |                       |<--No match found------|                    |
     |                       |                       |--INSERT new report--->|                    |
     |                       |                       |--INSERT reporter----->|                    |
     |                       |                       |--COMMIT TRANSACTION-->|                    |
     |                       |<--201 Created----------|                       |                    |
     |<--Redirect to---------|                       |                       |                    |
     |   Confirmation page   |                       |                       |                    |
```

### 6.2 Report Submission (Duplicate Match Found)
```
Student Browser        student-app            backend API              PostgreSQL
     |                       |                       |                       |
     |--Fill form & submit-->|                       |                       |
     |                       |--POST /reports------->|                       |
     |                       |                       |--BEGIN TRANSACTION--->|
     |                       |                       |--Query: match on------>|
     |                       |                       |  room+deviceNumber    |
     |                       |                       |<--Match found (open)--|
     |                       |                       |--UPDATE reportCount---|
     |                       |                       |  += 1                 |
     |                       |                       |--INSERT reporter----->|
     |                       |                       |  (linked to existing) |
     |                       |                       |--COMMIT TRANSACTION-->|
     |                       |<--201 Created----------|                       |
     |                       |  isNewReport: false    |                       |
```

### 6.3 Report Submission (Device Number Not Visible → Manual Review)
```
Student Browser        student-app            backend API              PostgreSQL
     |                       |                       |                       |
     |--Submit, number------>|--POST /reports------->|                       |
     |  marked "not visible" |  deviceNumberVisible: |                       |
     |                       |  false                |                       |
     |                       |                       |--Query: candidate----->|
     |                       |                       |  matches (room+type)  |
     |                       |                       |<--Candidates found----|
     |                       |                       |--INSERT new report--->|
     |                       |                       |  possibleDuplicate:   |
     |                       |                       |  true                 |
     |                       |                       |--INSERT reporter----->|
     |                       |<--201 Created----------|                       |
     |                       |  isPossibleDuplicate:  |                       |
     |                       |  true                  |                       |
```

### 6.4 Admin Login → Protected Request
```
Admin Browser          admin-app              backend API              PostgreSQL
     |                       |                       |                       |
     |--Enter credentials--->|--POST /admin/login--->|                       |
     |                       |                       |--Find admin by-------->|
     |                       |                       |  username             |
     |                       |                       |<--admin row-----------|
     |                       |                       |--bcrypt.compare()     |
     |                       |                       |  (password match)     |
     |                       |                       |--Sign JWT (8h expiry) |
     |                       |<--200 OK, token--------|                       |
     |                       |--Store token in--------|                       |
     |                       |  memory/Context        |                       |
     |--Navigate to--------->|                       |                       |
     |  Dashboard             |--GET /admin/reports-->|                       |
     |                       |  Authorization: Bearer |--Verify JWT---------->|
     |                       |                       |  signature/expiry     |
     |                       |                       |--Query reports-------->|
     |                       |<--200 OK, report list--|                       |
     |<--Render dashboard-----|                       |                       |
```

### 6.5 Admin Manual Merge (Needs Review Flow)
```
Admin Browser          admin-app              backend API              PostgreSQL
     |                       |                       |                       |
     |--Open Needs Review---->|--GET /admin/reports/->|                       |
     |                       |  needs-review          |--Query flagged-------->|
     |                       |                       |  reports + candidates |
     |                       |<--200 OK, list w/------|                       |
     |                       |  suggested matches     |                       |
     |--View compare, click-->|--POST /admin/reports/->|                       |
     |  "Merge"                |  :id/merge             |--BEGIN TRANSACTION--->|
     |                       |  { targetReportId }    |--Move reporter rows-->|
     |                       |                       |  to target report     |
     |                       |                       |--Increment target----->|
     |                       |                       |  reportCount           |
     |                       |                       |--Mark source report--->|
     |                       |                       |  mergedInto=targetId   |
     |                       |                       |--COMMIT TRANSACTION--->|
     |                       |<--200 OK----------------|                       |
     |<--Update UI, remove-----|                       |                       |
     |   from Needs Review     |                       |                       |
```

---

## 7. Non-Functional Requirements — Measurable Targets

| Category | Requirement | Target |
|---|---|---|
| **Response time** | `POST /reports` (incl. photo upload) end-to-end | < 5 seconds on typical campus Wi-Fi (per `PRD.md` §8.1) |
| **Response time** | Duplicate-match DB query | < 300ms (indexed query) |
| **Response time** | `GET /admin/reports` (paginated, 20/page) | < 2 seconds for up to ~1,000 total reports |
| **Availability** | Backend uptime | Best-effort; monitored via `/health` + UptimeRobot, alert on any downtime > 5 minutes |
| **File limits** | Max photo upload size | 5 MB |
| **Rate limiting** | Public report submission | Max 10 requests / hour / IP |
| **JWT expiry** | Admin session | 8 hours |
| **Password policy** | Admin password | Min 8 characters, at least 1 number, bcrypt cost factor 12 |
| **Browser support** | Latest 2 versions of Chrome, Firefox, Safari, Edge | Per `PRD.md` §8.4 |
| **Responsive breakpoints** | 360px (mobile) to 1920px (desktop) | Per `PRD.md` §8.4 |
| **Data retention** | Database backups | Daily, min. 7-day retention |
| **Data retention** | Uploads backup | Daily, min. 7–14 day retention |

---

## 8. Environment Variables Reference (Complete)

### 8.1 `backend/.env.example`
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://campusplus:localdevpassword@localhost:5432/campusplus_dev
JWT_SECRET=replace_with_a_strong_random_256_bit_secret
JWT_EXPIRY=8h
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=5
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=10
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
SENTRY_DSN=
```

### 8.2 `student-app/.env.example`
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 8.3 `admin-app/.env.example`
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 8.4 Production values (set in hosting platform dashboards, never in git)
```
NODE_ENV=production
DATABASE_URL=<Render-provided connection string>
JWT_SECRET=<generated via: openssl rand -hex 32>
UPLOAD_DIR=/data/uploads          # persistent disk mount path
CORS_ALLOWED_ORIGINS=https://report.campusplus.edu,https://admin.campusplus.edu
VITE_API_BASE_URL=https://api.campusplus.edu/api/v1
```

---

## 9. NPM Scripts Reference

### 9.1 `backend/package.json`
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "lint": "eslint src/",
    "test": "jest --runInBand",
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "seed:dev": "node src/db/seeds/dev.seed.js",
    "seed:admin": "node src/db/seeds/admin.seed.js",
    "seed:reference": "node src/db/seeds/reference.seed.js"
  }
}
```

### 9.2 `student-app/package.json` and `admin-app/package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/"
  }
}
```

---

## 10. Middleware Execution Order (Backend — Exact Sequence)

```
Incoming Request
     │
     ▼
1. helmet()                      — security headers
     │
     ▼
2. cors(corsOptions)              — origin allow-list check
     │
     ▼
3. pino-http logger               — structured request logging
     │
     ▼
4. express.json() / multer        — body/file parsing (route-specific)
     │
     ▼
5. rateLimiter (public routes only, stricter on POST /reports)
     │
     ▼
6. jwtAuthMiddleware (protected routes only)
     │
     ▼
7. zodValidationMiddleware (route-specific schema)
     │
     ▼
8. Controller → Service → Model
     │
     ▼
9. Response sent (success envelope)
     │
     ▼
10. errorHandlerMiddleware (catches any thrown error at any prior step)
```

---

## 11. Testing Requirements (Implementation-Level)

### 11.1 Required Unit Tests (backend)
- `duplicateMatching.service.test.js`:
  - Exact room+deviceNumber match → increments existing report
  - No match → creates new report
  - `deviceNumberVisible: false` → always creates new report with `possibleDuplicate: true`, never auto-merges
  - Match query excludes `resolved` and `rejected` reports
  - Concurrent identical submissions (simulated) → transaction prevents duplicate report creation
- `auth.service.test.js`:
  - Valid credentials → returns signed JWT
  - Invalid password → generic `401`, no user-enumeration leak
  - Expired token → rejected by middleware

### 11.2 Required Integration Tests (backend, via Supertest)
- Full `POST /reports` flow with a real test file upload, against a test database.
- Full `POST /admin/login` → `GET /admin/reports` authenticated flow.
- `PATCH /admin/reports/:id/status` with `rejected` status and missing `rejectionReason` → expect `400`.

### 11.3 Test Database
- Separate database (`campusplus_test`), created and torn down automatically in CI via the `backend-deploy.yml` workflow's test job — never run tests against the dev or production database.

### 11.4 Manual QA Checklist (pre-deploy, minimum bar)
Directly maps to `PRD.md` §9 Error Handling table — each row must be manually verified once before every production deploy that touches submission or status logic.

---

## 12. CI/CD — Exact Workflow Steps

### 12.1 `backend-deploy.yml` (triggered on push to `main`, path: `backend/**`)
```yaml
name: Backend Deploy
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm test
      - name: Deploy to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
      - name: Run production migrations
        run: cd backend && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
```

### 12.2 Frontend workflows follow the same `lint → build` gate pattern, with Vercel's native GitHub integration handling the actual deploy on merge.

---

## 13. Definition of Done (Per Feature)

A feature/user story from `PRD.md` §4 is considered technically complete only when:
1. Implementation matches the API contract in §5 of this document exactly (field names, types, status codes).
2. Server-side Zod validation matches the rules in `PRD.md` §7.
3. Relevant unit/integration test(s) per §11 are written and passing.
4. Manual QA edge cases from `PRD.md` §9 relevant to this feature are verified.
5. No secrets or credentials introduced in code (verified via a `git diff` review before commit).
6. Lint passes with zero errors.
7. Deployed successfully to staging and manually smoke-tested before merging to `main`.

---

## 14. Traceability Matrix (PRD → TRD)

| PRD Section | Covered In TRD |
|---|---|
| §4 User Stories & Acceptance Criteria | §5 API Contracts, §11 Testing Requirements |
| §6 Duplicate-Matching Logic | §4 Schema, §5.1–5.3, §6.1–6.3 Sequence Diagrams, §11.1 |
| §7 Field-Level Validation | §5 (per-endpoint request specs), enforced via Zod per §1 |
| §8 Non-Functional Requirements | §7 (this document, with concrete numeric targets) |
| §9 Error Handling & Edge Cases | §11.4 Manual QA Checklist |
| §10 Data Model | §4 Prisma Schema (implementation-ready version) |
| §11 API Design | §5 (fully specified with request/response bodies) |
| §16 Testing Strategy | §11 (tooling + specific required test cases) |
| §17 Deployment Strategy | §12 CI/CD, `architecture.md` §12 |

---

## 15. Summary — What This TRD Guarantees

Any engineer picking up this project has: exact dependency versions to install, copy-pasteable environment configs, a complete field-by-field API contract for every endpoint, the exact Prisma schema to run, sequence diagrams for every non-trivial flow, numeric performance/security targets instead of vague goals, and a Definition of Done that leaves no ambiguity about when a feature is actually finished. Nothing in this document should require guessing during implementation.
