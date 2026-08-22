# CampusPlus — System Architecture Document

**Document Version:** 1.0
**Status:** Deployment-Ready
**Deployment Target:** Real, live production deployment for college use
**Last Updated:** August 20, 2026

---

## 0. Purpose of This Document

This document defines the complete technical architecture of CampusPlus — how the system is structured, how its components communicate, how data flows through it, how it is secured, and how it is deployed and operated in production. It is written to be handed to any developer (including a future maintainer) with zero prior context and still be buildable/deployable without guesswork.

This document assumes familiarity with `PRD.md` (product requirements) and `design.md` (UI/UX reference) — this file covers **everything below the UI layer**: system design, infrastructure, data, security, and operations.

---

## 1. Architecture Goals & Principles

| Goal | How the architecture achieves it |
|---|---|
| **Zero-friction student reporting** | Public, unauthenticated, stateless API endpoint with no session dependency |
| **Data integrity for duplicate detection** | Matching logic enforced at the database/service layer, never trusted from client input |
| **Separation of concerns** | Student app, Admin app, and Backend API are three independently deployable units |
| **Security by default** | All admin operations behind JWT auth; all public input server-validated; secrets never in code |
| **Real production reliability** | Persistent data storage, backups, monitoring, and a documented recovery path (not just a demo setup) |
| **Maintainability by one developer** | Monorepo, consistent conventions, minimal moving parts, no unnecessary microservices |

---

## 2. High-Level System Architecture

```
                              ┌────────────────────────────┐
                              │        End Users            │
                              │  Students (public, no login)│
                              │  Admin (authenticated)      │
                              └──────────────┬───────────────┘
                                              │
                     ┌────────────────────────┼─────────────────────────┐
                     │                                                  │
         ┌───────────▼────────────┐                        ┌───────────▼────────────┐
         │   student-app (React)   │                        │   admin-app (React)     │
         │   Vercel — Static SPA   │                        │   Vercel — Static SPA   │
         │ report.campusplus.edu   │                        │  admin.campusplus.edu   │
         └───────────┬────────────┘                        └───────────┬────────────┘
                     │                    HTTPS / REST (JSON)          │
                     └────────────────────────┬──────────────────────┘
                                              │
                              ┌────────────────▼─────────────────┐
                              │        backend (Node.js +          │
                              │        Express.js REST API)         │
                              │        Render — Persistent Service  │
                              │        api.campusplus.edu           │
                              │  ┌────────────────────────────┐    │
                              │  │ Middleware: CORS, Helmet,   │    │
                              │  │ Rate Limiter, JWT Auth,     │    │
                              │  │ Input Validation, Logger    │    │
                              │  └────────────────────────────┘    │
                              └───────┬───────────────┬────────────┘
                                      │               │
                     ┌─────────────────▼──┐   ┌────────▼─────────────────┐
                     │  PostgreSQL (Managed) │   │  Persistent Disk Volume  │
                     │  Render Postgres       │   │  (Device Photo Uploads) │
                     │  Primary + Daily Backup│   │  Mounted on backend host│
                     └────────────────────────┘   └──────────────────────────┘
```

**Three independently deployable units:**
1. `student-app` — public React SPA
2. `admin-app` — authenticated React SPA
3. `backend` — Node/Express REST API (single source of truth for both frontends)

Both frontends talk **only** to the backend API — they never talk to the database or file storage directly. This is a strict rule (see §9 Security Architecture).

---

## 3. Repository Structure (Monorepo)

```
campusplus/
├── student-app/                  # Public React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/                # HomePage, ReportIssuePage, ConfirmationPage, TrackReportPage, NotFoundPage
│   │   ├── components/
│   │   ├── api/                  # Axios/fetch client for backend calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── admin-app/                    # Authenticated React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/                # Login, Dashboard, AllReports, ReportDetail,
│   │   │                         # NeedsReview, Profile, NotFound
│   │   ├── components/
│   │   ├── api/
│   │   ├── auth/                 # JWT storage/context, protected route wrapper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                # db.js, env.js, storage.js
│   │   ├── models/                # Report, Reporter, StatusHistory, Admin,
│   │   │                          # Department, Stream, Building, Room
│   │   ├── routes/                # reports.routes.js, admin.routes.js,
│   │   │                          # auth.routes.js, reference.routes.js
│   │   ├── controllers/
│   │   ├── services/               # duplicateMatching.service.js,
│   │   │                          # upload.service.js, auth.service.js
│   │   ├── middleware/             # auth.middleware.js, rateLimit.middleware.js,
│   │   │                          # validate.middleware.js, error.middleware.js
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   └── seeds/              # departments, buildings, admin seed
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                    # Persistent disk mount point (device photos)
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── backend-deploy.yml
│       ├── student-app-deploy.yml
│       └── admin-app-deploy.yml
│
├── docs/
│   ├── PRD.md
│   ├── design.md
│   └── architecture.md            # this file
│
├── .gitignore
└── README.md
```

**Why monorepo works here:** single developer, tightly coupled release cycle (schema changes affect both frontends simultaneously), and simplified local development (one `git clone`, three `npm install`s). Each folder is still deployed as a fully independent service — the monorepo is purely an organizational choice, not a runtime coupling.

---

## 4. Component Architecture

### 4.1 student-app
- **Type:** Static single-page React application, no server-side rendering needed.
- **State management:** Local component state / React Context only — no Redux needed given the small, linear flow (Home → Report Form → Confirmation).
- **Routing:** Client-side routing (React Router) for the 4 pages defined in `design.md`.
- **API communication:** A single typed API client module (`src/api/reports.js`) wrapping `fetch`/`axios`, pointed at `VITE_API_BASE_URL`.
- **No authentication logic** — this app never handles tokens or protected routes.

### 4.2 admin-app
- **Type:** Static single-page React application.
- **State management:** React Context for auth state (JWT + admin info) + local state per page. `TanStack Query` (recommended) for server-state caching (report lists, dashboard counts) to avoid manual loading-state boilerplate.
- **Routing:** Protected routes — a `RequireAuth` wrapper redirects to `/login` if no valid JWT is present.
- **Token storage:** JWT stored in memory + `httpOnly` considerations — see §9.3 for the specific decision and trade-off.
- **API communication:** Separate API client module (`src/api/admin.js`) that attaches `Authorization: Bearer <token>` to every request and handles 401 responses globally (auto-redirect to login).

### 4.3 backend
- **Type:** Stateless REST API (Node.js + Express.js). Stateless means any incoming request carries everything needed to process it (JWT for auth) — no server-side session storage, which simplifies horizontal scaling later if ever needed.
- **Layered structure:**
  - **Routes** → define endpoints and attach middleware
  - **Controllers** → parse request, call services, shape response
  - **Services** → business logic (duplicate matching, status transitions, file handling)
  - **Models** → database access layer (via an ORM — see §5.1)
- **Cross-cutting middleware** (applied globally or per-route): CORS, Helmet (security headers), rate limiting, request logging, centralized error handler.

---

## 5. Data Architecture

### 5.1 ORM & Migrations
- **ORM:** Prisma (recommended) — provides type-safe queries, built-in migration tooling, and a schema file that doubles as living documentation of the data model. (Alternative: Sequelize — Prisma is preferred for a cleaner migration workflow.)
- **Migrations:** Every schema change is a tracked migration file (`backend/src/db/migrations/`), never a manual production DB edit. This is non-negotiable for a real production system — manual schema drift is the #1 cause of "works on my machine" production incidents.

### 5.2 Schema
The full schema (tables: `reports`, `report_reporters`, `report_status_history`, `admins`, `departments`, `streams`, `buildings`, `rooms`) is defined in `PRD.md` §10 and is the single source of truth for table structure. This architecture document governs *how* that schema is accessed, migrated, and protected — not the field-level definitions themselves, to avoid the two documents drifting out of sync.

### 5.3 Indexing Strategy (new — required for production performance)
| Table | Index | Reason |
|---|---|---|
| `reports` | `(room_number, device_number)` composite index | Duplicate-match lookup runs on every submission — must be fast |
| `reports` | `status` | Dashboard/filter queries run on status constantly |
| `reports` | `report_count DESC` | Default dashboard sort |
| `report_reporters` | `report_id` (FK index) | Fast lookup of all reporters for a given report |
| `report_status_history` | `report_id` (FK index) | Fast timeline retrieval |
| `admins` | `username` (unique index) | Login lookup |

### 5.4 Connection Management
- Use a connection pool (Prisma manages this internally, default pool size tuned to the hosting plan's connection limit — verify against the managed Postgres plan's max connections and set `connection_limit` accordingly to avoid exhausting the database under load).

---

## 6. API Architecture

### 6.1 Conventions
- **Style:** REST, JSON request/response bodies.
- **Base URL:** `https://api.campusplus.edu/api/v1` — **versioned from day one** (`/v1/`) even though there's only one version now; this avoids breaking both frontends simultaneously if the API changes later.
- **Response envelope (consistent shape for every endpoint):**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```
On failure:
```json
{
  "success": false,
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "Room number is required" }
}
```
- **HTTP status codes used meaningfully:** `200` OK, `201` Created, `400` bad request/validation, `401` unauthorized, `403` forbidden, `404` not found, `409` conflict (e.g., duplicate admin username), `429` rate limited, `500` server error.

### 6.2 Endpoint Summary
Full endpoint list is defined in `PRD.md` §11. Architecturally, endpoints are grouped into four route files: `reports.routes.js` (public), `reference.routes.js` (public, dropdown data), `auth.routes.js` (public login, protected logout/profile), `admin.routes.js` (protected — all report management).

### 6.3 Input Validation
- Every request body validated server-side using a schema validation library (**Zod** recommended, pairs naturally with the Node/Express + Prisma stack) before it reaches controller logic. Client-side validation (in React) is UX convenience only — the server is the enforced source of truth, per `PRD.md` §7.

---

## 7. Duplicate-Matching Engine (Architectural View)

This is CampusPlus's core business logic, so it gets its own architectural treatment beyond the PRD's pseudocode.

- Implemented as an isolated service module: `services/duplicateMatching.service.js` — never inline in the controller, so it can be unit-tested independently (per `PRD.md` §16 Testing Strategy).
- Runs as a **single database transaction** per submission: (1) check for existing match → (2) either increment/merge or create new → (3) insert reporter row. Wrapping this in a transaction prevents a race condition where two students submitting the exact same device at the exact same millisecond could both create separate reports instead of one being correctly matched (this is a realistic risk at real scale and must be handled at the DB transaction level, not just in application code).
- Exposed to the rest of the app only through one function: `processReportSubmission(payload)` — the controller never touches matching logic directly.

---

## 8. File Storage Architecture (Device Photos)

**Decision (per project requirements): Local disk storage on the backend server.**

### 8.1 Implementation
- Uploaded photos are saved to a dedicated `backend/uploads/` directory, served via a static Express route (`/uploads/:filename`) or a lightweight reverse-proxy rule.
- Filenames are never trusted from the client — the server generates a unique filename (UUID + original extension) on save to prevent path traversal or overwrite attacks.
- MIME-type and file-size validation happens **before** the file is written to disk (per `PRD.md` §8.3/§9).

### 8.2 Production Risk — Documented, Not Ignored
Because this is a **real, live production deployment** (not just a demo), local disk storage carries a specific risk that must be explicitly handled:

> **Risk:** Most modern hosting platforms (Render, Railway, etc.) use *ephemeral* filesystems by default — meaning any files written to disk are **wiped on every redeploy or container restart**. For a live system where photos must persist indefinitely, this would silently delete evidence photos over time.

> **Required Mitigation:** The backend **must** be deployed on a hosting plan with an attached **persistent disk/volume** (e.g., Render's "Persistent Disk" add-on, or Railway's "Volume" feature), mounted at the `backend/uploads/` path. This is a mandatory deployment configuration step, not optional — see §12.3.

> **Secondary Mitigation (recommended):** A nightly automated backup job (cron, see §14) that syncs the uploads directory to a secondary storage location (e.g., a low-cost object storage bucket used purely as a backup target, not the primary serving path). This is a safety net in case the persistent disk itself fails.

### 8.3 Future Migration Path
If usage grows significantly, the storage layer is isolated behind `services/upload.service.js` with a single interface (`saveFile()`, `getFileUrl()`, `deleteFile()`) — this means migrating to cloud object storage later requires changing only this one service file, not the rest of the application.

---

## 9. Security Architecture

### 9.1 Transport Security
- HTTPS enforced everywhere — all three services (student-app, admin-app, backend) served over TLS. Vercel and Render provide this automatically via their platform-managed certificates.
- HTTP requests auto-redirect to HTTPS at the platform level.

### 9.2 API Security Middleware Stack (applied to every request, in order)
1. **Helmet** — sets secure HTTP headers (prevents clickjacking, MIME sniffing, etc.)
2. **CORS** — explicitly allow-lists only `student-app` and `admin-app` origins; no wildcard `*` in production.
3. **Rate Limiter** — per `PRD.md` §5.5, applied specifically and more strictly to `POST /api/v1/reports` (public, unauthenticated) than to admin routes.
4. **JWT Auth Middleware** — validates and decodes the token, attaches `req.admin` for downstream use; rejects with `401` if missing/invalid/expired.
5. **Input Validation Middleware** — Zod schema validation per route.
6. **Centralized Error Handler** — catches all thrown errors, never leaks stack traces or internal details to the client in production (logs full detail server-side only).

### 9.3 Authentication & Token Handling
- **Token type:** JWT, 8-hour expiry (per `PRD.md` §5.2.1).
- **Storage decision:** Store the JWT in memory (React state/Context) rather than `localStorage`, to reduce XSS token-theft exposure — the trade-off is the admin must re-login on a hard page refresh, which is an acceptable UX cost for a low-traffic single-admin system. (If persistent "remember me" login across refreshes becomes a requirement, migrate to an `httpOnly` secure cookie issued by the backend instead — documented here as the correct future path rather than defaulting to the less secure `localStorage` approach now.)
- **Password storage:** bcrypt hash, cost factor 12, never plaintext, never logged.

### 9.4 File Upload Security
- Server-side MIME-type verification (not just file extension) — per `PRD.md` §9.
- Files are never executed or served with executable permissions.
- Max file size enforced at both the reverse-proxy/platform level and application level (defense in depth).

### 9.5 Secrets Management
- No secrets (DB credentials, JWT signing secret, admin seed credentials) ever committed to git — enforced via `.gitignore` on all `.env` files and `.env.example` templates committed instead showing required variable names only.
- Production secrets set directly in the hosting platform's environment variable dashboard (Vercel/Render), never passed through CI logs.

### 9.6 Data Privacy
- Student-submitted personal data (student code, department) is only ever exposed to the authenticated admin — never returned in any public API response.
- No analytics/tracking scripts on the student-facing report form that could leak student identifiers to third parties.

---

## 10. Environment Configuration

### 10.1 Environments
| Environment | Purpose | Database | Notes |
|---|---|---|---|
| **Local (development)** | Individual development machine | Local Postgres (Docker recommended) or a free-tier dev DB branch | `.env.local`, seed data = dummy departments/buildings |
| **Staging** | Pre-production verification before real students use it | Separate managed Postgres instance (small plan) | Mirrors production config exactly, used to test migrations safely before applying to prod |
| **Production** | Real live deployment | Managed Postgres, daily backups enabled | Real seeded department/building data for the actual institution |

> **Why staging matters for a real deployment:** Since this will be used by real students, schema migrations and duplicate-matching logic changes should be verified in staging first — pushing untested changes straight to a production database that already has real student data is the single most common cause of real-world data corruption incidents.

### 10.2 Environment Variables (backend)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/campusplus
JWT_SECRET=<strong random 256-bit secret, generated once, never reused across environments>
JWT_EXPIRY=8h
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE_MB=5
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=10
CORS_ALLOWED_ORIGINS=https://report.campusplus.edu,https://admin.campusplus.edu
```

### 10.3 Environment Variables (student-app / admin-app)
```
VITE_API_BASE_URL=https://api.campusplus.edu/api/v1
```

---

## 11. Infrastructure & Hosting

| Component | Platform | Plan Requirement |
|---|---|---|
| `student-app` | Vercel | Static SPA hosting, free/hobby tier sufficient |
| `admin-app` | Vercel | Static SPA hosting, free/hobby tier sufficient (deployed as a **second, separate Vercel project** from the same monorepo, root directory set to `admin-app/`) |
| `backend` | Render | **Must** be a plan that supports a **persistent disk add-on** (required per §8.2) — not the free tier, which has no persistent disk option |
| Database | Render Managed PostgreSQL | Plan with **automated daily backups** enabled (required for real deployment, see §14) |

### 11.1 Domain & DNS Structure
| Subdomain | Points to |
|---|---|
| `report.campusplus.edu` (or root domain) | student-app (Vercel) |
| `admin.campusplus.edu` | admin-app (Vercel) |
| `api.campusplus.edu` | backend (Render) |

- DNS managed via whichever registrar holds the institution's domain; CNAME records pointed at Vercel/Render as instructed by each platform's custom domain setup flow.
- SSL certificates auto-provisioned and auto-renewed by both platforms — no manual certificate management needed.

---

## 12. Deployment Process

### 12.1 Branching Strategy
- `main` — production, protected branch, deploys automatically to production on merge.
- `staging` — deploys automatically to the staging environment on merge.
- Feature branches → PR into `staging` first → verified → PR into `main`.

### 12.2 CI/CD Pipeline (GitHub Actions)
Three independent workflows (per §3 repo structure), each triggered only by changes to its own folder (using `paths:` filters so an admin-app change doesn't trigger an unnecessary backend redeploy):

1. **`backend-deploy.yml`** — on push to `main` affecting `backend/**`: run lint → run unit/integration tests (per `PRD.md` §16) → if tests pass, trigger Render deploy hook → run pending Prisma migrations against production DB as a deploy step (never manually).
2. **`student-app-deploy.yml`** — on push to `main` affecting `student-app/**`: run lint/build check → Vercel auto-deploys on push (Vercel's native Git integration handles this; the workflow file mainly exists to run tests/lint as a gate before the merge is even allowed).
3. **`admin-app-deploy.yml`** — same pattern as above for `admin-app/**`.

### 12.3 First-Time Production Setup Checklist (Deployment-Ready — Do Not Skip Any Step)
1. Provision managed PostgreSQL instance; enable automated daily backups.
2. Set all backend environment variables (§10.2) in Render's dashboard — never in code.
3. Attach a **persistent disk volume** to the backend service, mounted at `UPLOAD_DIR` (critical — see §8.2).
4. Run initial Prisma migration against the production database.
5. Run the admin seed script (`npm run seed:admin`) once, interactively, to create the single admin account — do this locally against the production `DATABASE_URL` via a secure connection, never expose a public seed endpoint.
6. Run the reference-data seed script (departments, buildings, rooms) with the institution's real data.
7. Deploy `backend` to Render; verify `/health` endpoint (see §13.3) returns `200`.
8. Deploy `student-app` and `admin-app` to Vercel as two separate projects from the monorepo; set `VITE_API_BASE_URL` for each.
9. Configure custom domains + DNS records for all three services.
10. Verify CORS: confirm both frontend origins are in `CORS_ALLOWED_ORIGINS` on the backend.
11. Submit one real test report end-to-end (photo upload through to admin dashboard) before announcing the system live to students.
12. Confirm the persistent disk survives a manual redeploy (deploy a trivial change, confirm previously uploaded test photo is still accessible) — this single check validates that §8.2's core risk has actually been mitigated, not just documented.

---

## 13. Observability

### 13.1 Logging
- Structured JSON logging (e.g., via `pino` or `winston`) for all backend requests and errors — not `console.log`.
- Logs include: timestamp, request ID, route, status code, response time, and (for errors) stack trace — but **never** log request bodies containing student personal data in plaintext, per §9.6.

### 13.2 Error Tracking
- Integrate a lightweight error-tracking service (e.g., **Sentry** free tier) on the backend to catch and alert on unhandled exceptions in production — critical for a real deployment where you won't be watching logs constantly.

### 13.3 Health Checks
- Backend exposes `GET /health` (public, unauthenticated) returning `{ status: "ok", db: "connected" }` — used by the hosting platform to detect and auto-restart a crashed instance, and useful as the final deployment verification step (§12.3 step 7).

### 13.4 Uptime Monitoring
- A free external uptime monitor (e.g., UptimeRobot) pinging `/health` every few minutes, with an email/SMS alert on downtime — since this is real production use, silent downtime is not acceptable.

---

## 14. Backup & Disaster Recovery

| Asset | Backup Method | Frequency | Retention |
|---|---|---|---|
| PostgreSQL database | Managed automated backups (platform-native) | Daily | Minimum 7 days (verify against chosen plan) |
| Uploaded device photos (persistent disk) | Nightly cron job syncing `uploads/` to a secondary backup location | Daily | Minimum 7–14 days |
| Environment variables/secrets | Stored securely outside git (password manager or platform's own secret store) | On change | Indefinite |

### 14.1 Recovery Procedure (documented, not just assumed)
1. **Database corruption/loss:** Restore from the most recent automated backup via the hosting platform's restore flow; verify row counts on `reports` and `admins` tables post-restore before resuming traffic.
2. **Uploads volume loss:** Restore from the nightly backup sync target; accept that photos uploaded between the last backup and the incident may be unrecoverable — communicate this limitation transparently if it occurs.
3. **Backend service outage:** Render auto-restarts on crash (per health check); if the platform itself is down, this is an accepted external dependency risk for a project of this scope.

---

## 15. Scalability Considerations (Right-Sized, Not Over-Engineered)

- The architecture is intentionally **not** microservices, not Kubernetes, not multi-region — this would be over-engineering for a single-institution system with realistic traffic of hundreds of reports per semester (per `PRD.md` §8.2).
- If growth ever demands it, the clean separation of concerns (stateless backend, isolated upload service, indexed queries) means the system **can** scale vertically (bigger Render instance) or eventually migrate file storage to cloud object storage (§8.3) without a full rewrite — but building for that scale now would be premature.

---

## 16. Testing Architecture

Maps to `PRD.md` §16 Testing Strategy, with tooling specified:
- **Unit tests:** Jest (or Vitest) for `duplicateMatching.service.js` and other isolated service logic.
- **Integration tests:** Supertest against a test database instance (separate from dev/staging/prod) for full request/response cycles.
- **Frontend:** Component-level tests optional given solo-developer scope; manual QA against `PRD.md` §9's edge-case table is the minimum bar before each production deploy.

---

## 17. Summary — What Makes This "Deployment-Ready"

This architecture explicitly avoids the most common gap in student/academic projects — a design that only works in `localhost`. Specifically, it defines:
- ✅ Real environment separation (local/staging/production)
- ✅ A concrete, named hosting plan for every component, with the one non-obvious but critical requirement (persistent disk) called out explicitly
- ✅ Secrets handled outside source control
- ✅ A migration discipline that prevents production schema drift
- ✅ A backup and recovery plan for both the database and the file storage layer
- ✅ Health checks and uptime monitoring so failures are caught, not discovered by an angry student
- ✅ A step-by-step first-deployment checklist that leaves no manual step ambiguous

Any developer following this document, `PRD.md`, and `design.md` in sequence has everything needed to build and deploy CampusPlus without guessing.
