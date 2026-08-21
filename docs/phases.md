# CampusPlus — Development Phases (`phases.md`)

**Purpose:** This document breaks the entire CampusPlus build — frontend, backend, database, API, integrations, testing, and deployment — into strict, sequential phases. It is designed to be fed to an AI coding agent **one phase at a time**, so the agent never tries to build the whole system in a single pass.

**Source documents this plan is built from:** `PRD.md`, `TRD.md`, `architecture.md`, `design.md`. Every phase below references the exact sections of those documents the AI agent needs to read before starting that phase.

---

## How to Use This File With an AI Agent

1. Do **not** paste this entire file into the agent and say "build everything."
2. Start a phase by giving the agent: this file, `PRD.md`, `TRD.md`, `architecture.md`, and `design.md`, then say: *"Read all attached documents. We are starting **Phase X** only, as defined in `phases.md`. Do not build anything from later phases. When done, summarize what you built and confirm it matches this phase's Definition of Done, then stop."*
3. Review the output, test it, then move to the next phase in a **new message** (same conversation is fine, but explicitly name the next phase).
4. Never let the agent skip ahead — each phase has a **Depends On** field; do not start a phase until its dependency phase is confirmed done.

---

## Phase Overview (Quick Reference)

| Phase | Name | Layer |
|---|---|---|
| 0 | Project Initialization & Repo Scaffolding | Setup |
| 1 | Database Schema & Migrations | Database |
| 2 | Backend Core Infrastructure & Middleware | Backend |
| 3 | Backend Services — Duplicate Matching Engine | Backend |
| 4 | Backend Services — Auth & File Upload | Backend |
| 5 | Public API Endpoints | Backend/API |
| 6 | Admin API Endpoints | Backend/API |
| 7 | Backend Testing | Backend |
| 8 | Student App — Scaffold & Design System | Frontend |
| 9 | Student App — Pages & Logic | Frontend |
| 10 | Admin App — Scaffold & Design System | Frontend |
| 11 | Admin App — Pages & Logic | Frontend |
| 12 | Frontend ↔ Backend Integration Testing | Integration |
| 13 | CI/CD Pipeline Setup | DevOps |
| 14 | Staging Deployment | DevOps |
| 15 | Production Infrastructure Provisioning | DevOps |
| 16 | Production Deployment & Go-Live Verification | DevOps |
| 17 | Documentation & Handover | Docs |

---

## Phase 0 — Project Initialization & Repo Scaffolding

**Goal:** Create the monorepo skeleton with all folders, config files, and tooling in place — no feature code yet.

**Read First:** `architecture.md` §3 (Repository Structure), `TRD.md` §1 (Tech Stack Versions), §2 (Local Dev Setup), §3 (Coding Standards).

**Tasks:**
1. Initialize git repository with `.gitignore` (node_modules, .env, uploads/, dist/, build/).
2. Create the three top-level folders: `student-app/`, `admin-app/`, `backend/`, plus `docs/` (drop in `PRD.md`, `TRD.md`, `architecture.md`, `design.md`, `phases.md`).
3. Scaffold `backend/` with Node.js + Express, install dependencies per `TRD.md` §1 exact versions.
4. Scaffold `student-app/` and `admin-app/` with Vite + React + Tailwind CSS per `TRD.md` §1.
5. Set up ESLint + Prettier + Husky + lint-staged per `TRD.md` §3.1–3.2.
6. Create `.env.example` files in all three folders per `TRD.md` §8.1–8.3.
7. Create `docker-compose.yml` for local PostgreSQL per `TRD.md` §2.4.
8. Write root `README.md` with setup instructions (link out to `TRD.md` §2 for full commands).
9. Set up GitHub repo with branch protection on `main` (per `TRD.md` §3.2) and create `staging` branch.

**Deliverables:** Empty-but-runnable skeleton — `npm run dev` works in all three folders with a placeholder "Hello CampusPlus" page/response, no crashes.

**Definition of Done:**
- [ ] All three apps start locally without errors
- [ ] Local Postgres container starts via `docker compose up -d db`
- [ ] Lint runs clean on all three folders
- [ ] `.env.example` files match `TRD.md` §8 exactly
- [ ] Git repo has `main` + `staging` branches with protection rules

**Depends On:** Nothing (first phase).

---

## Phase 1 — Database Schema & Migrations

**Goal:** Implement the full database schema and get it running locally with seed data.

**Read First:** `TRD.md` §4 (Prisma Schema — use exactly as written), `architecture.md` §5 (Data Architecture, indexing strategy).

**Tasks:**
1. Install and configure Prisma in `backend/`.
2. Create `backend/prisma/schema.prisma` using the exact model definitions from `TRD.md` §4.
3. Run initial migration (`npx prisma migrate dev --name init`) against local Postgres.
4. Write seed scripts:
   - `src/db/seeds/dev.seed.js` — dummy departments, streams, buildings, rooms, and a dev admin account
   - `src/db/seeds/admin.seed.js` — interactive production admin creation script (per `architecture.md` §5.4)
   - `src/db/seeds/reference.seed.js` — placeholder structure for real institution reference data (to be filled in before production)
5. Verify all indexes from `TRD.md` §4 / `architecture.md` §5.3 are present (`(roomId, deviceNumber)`, `status`, `reportCount`, FK indexes).

**Deliverables:** Working local database with migrations applied and dev seed data populated.

**Definition of Done:**
- [ ] `npx prisma migrate dev` runs clean with no errors
- [ ] `npx prisma studio` shows all 8 tables with correct relations
- [ ] `npm run seed:dev` populates dummy data successfully
- [ ] All required indexes confirmed present via `\d reports` in psql or Prisma schema review

**Depends On:** Phase 0.

---

## Phase 2 — Backend Core Infrastructure & Middleware

**Goal:** Build the Express app shell with the exact middleware stack, but no business routes yet.

**Read First:** `TRD.md` §10 (Middleware Execution Order — build in this exact sequence), `architecture.md` §9 (Security Architecture).

**Tasks:**
1. Build `src/app.js` and `src/server.js`.
2. Add middleware in the exact order from `TRD.md` §10: `helmet` → `cors` → `pino-http` logger → body/file parsing → rate limiter → JWT auth (applied selectively) → Zod validation (per-route) → error handler.
3. Implement centralized error handler middleware (`src/middleware/error.middleware.js`) using the response envelope format from `TRD.md` §6.1.
4. Implement `GET /health` endpoint per `TRD.md` §5.13.
5. Configure CORS allow-list from `CORS_ALLOWED_ORIGINS` env var.
6. Configure rate limiter per `TRD.md` §7 (10 requests/hour/IP on public submission route — applied later in Phase 5, but the middleware itself is built now).

**Deliverables:** A running Express server with full middleware stack and a working `/health` endpoint, no feature routes yet.

**Definition of Done:**
- [ ] `GET /health` returns `{ status: "ok", db: "connected" }`
- [ ] Malformed JSON body returns a proper `400` via error handler, not a raw stack trace
- [ ] CORS blocks requests from an unlisted origin (test with curl from a disallowed origin)
- [ ] Logs are structured JSON (pino), not plain console.log

**Depends On:** Phase 1.

---

## Phase 3 — Backend Services: Duplicate Matching Engine

**Goal:** Build the core business logic in complete isolation from routes/controllers, per `architecture.md`'s explicit requirement that this logic be independently testable.

**Read First:** `architecture.md` §7 (Duplicate-Matching Engine), `TRD.md` §6.1–6.3 (sequence diagrams), `TRD.md` §11.1 (required unit tests for this service).

**Tasks:**
1. Build `src/services/duplicateMatching.service.js` exposing a single function: `processReportSubmission(payload)`.
2. Implement the transaction-wrapped logic exactly per the three sequence diagrams in `TRD.md` §6.1–6.3:
   - Exact match on `roomId + deviceNumber` (status open/in_progress only) → increment + add reporter
   - No match → create new report
   - `deviceNumberVisible: false` → always create new report, `possibleDuplicate: true`, attach `suggestedMatchIds`
3. Wrap the full operation in a Prisma transaction to prevent race conditions (per `architecture.md` §7).
4. Write unit tests per `TRD.md` §11.1 (exact match increments, no match creates new, invisible-number never auto-merges, resolved/rejected excluded from matching, concurrent submission race condition handled).

**Deliverables:** Fully tested, standalone duplicate-matching service with zero Express dependencies.

**Definition of Done:**
- [ ] All 5 unit test cases from `TRD.md` §11.1 pass
- [ ] Service file has zero imports of `express`, `req`, or `res`
- [ ] Manually verified: submitting the same room+device number twice increments count instead of creating 2 rows

**Depends On:** Phase 2.

---

## Phase 4 — Backend Services: Auth & File Upload

**Goal:** Build authentication and file-upload services, isolated and testable, per the same service-layer pattern as Phase 3.

**Read First:** `architecture.md` §8 (File Storage Architecture), §9.3 (Auth & Token Handling), `TRD.md` §11.1 (auth test cases).

**Tasks:**
1. Build `src/services/auth.service.js`: password hashing (bcrypt, cost 12), JWT signing/verification (8h expiry), login logic.
2. Build `src/services/upload.service.js` with the interface specified in `architecture.md` §8.3: `saveFile()`, `getFileUrl()`, `deleteFile()` — implemented against local disk storage per §8.1, with UUID filename generation and MIME-type/size validation happening before write.
3. Configure `multer` disk storage engine pointed at `UPLOAD_DIR`.
4. Write unit tests per `TRD.md` §11.1 (valid credentials → JWT, invalid password → generic 401, expired token rejected).

**Deliverables:** Working, tested auth and upload services.

**Definition of Done:**
- [ ] Auth unit tests pass
- [ ] Uploading a valid image saves it with a UUID filename, rejects invalid MIME types and oversized files
- [ ] JWT correctly expires after configured window (test with a short expiry override in test env)

**Depends On:** Phase 2.

---

## Phase 5 — Public API Endpoints

**Goal:** Wire up all public-facing routes using the services built in Phases 3–4.

**Read First:** `TRD.md` §5.1–5.3, §5.13 (exact request/response contracts for `POST /reports`, `GET /departments`, `GET /buildings`, `GET /health`), `PRD.md` §7 (field validation rules).

**Tasks:**
1. Build `src/routes/reports.routes.js` and `src/controllers/reports.controller.js` — `POST /api/v1/reports`, calling `duplicateMatching.service.js` and `upload.service.js`.
2. Build `src/routes/reference.routes.js` — `GET /api/v1/departments`, `GET /api/v1/buildings`.
3. Implement Zod validation schemas matching `TRD.md` §5.1 field list exactly.
4. Apply the stricter rate limiter (10/hour/IP) specifically to `POST /reports`.
5. Ensure response envelopes match `TRD.md` §6.1 format exactly on both success and error paths.

**Deliverables:** Fully working public API, testable via curl/Postman.

**Definition of Done:**
- [ ] `POST /reports` with valid multipart data returns `201` matching the exact schema in `TRD.md` §5.1
- [ ] Missing required field returns `400` with correct error code
- [ ] 11th submission from the same IP within an hour returns `429`
- [ ] `GET /departments` and `GET /buildings` return seeded dev data correctly nested

**Depends On:** Phase 3, Phase 4.

---

## Phase 6 — Admin API Endpoints

**Goal:** Wire up all authenticated admin routes.

**Read First:** `TRD.md` §5.4–5.12 (all admin endpoint contracts), `PRD.md` §5.2.4 (status workflow rules), §6.3 (merge logic).

**Tasks:**
1. Build `src/routes/auth.routes.js` — `POST /api/v1/admin/login`.
2. Build `src/routes/admin.routes.js` and corresponding controllers for:
   - `GET /admin/reports` (filter/sort/search/paginate)
   - `GET /admin/reports/:id`
   - `PATCH /admin/reports/:id/status` (enforce `rejectionReason` required when status = rejected)
   - `GET /admin/reports/needs-review`
   - `POST /admin/reports/:id/merge`
   - `POST /admin/reports/:id/keep-separate`
   - `GET /admin/dashboard-summary`
   - `PATCH /admin/profile/password`
3. Apply `jwtAuthMiddleware` to all `/admin/*` routes except `/admin/login`.
4. Implement the merge logic transaction exactly per `TRD.md` §6.5 sequence diagram.
5. Record every status change into `ReportStatusHistory` per `PRD.md` §5.2.4.

**Deliverables:** Fully working, authenticated admin API.

**Definition of Done:**
- [ ] Login returns valid JWT; using it authorizes subsequent admin requests
- [ ] Requests without a valid token return `401` on every `/admin/*` route
- [ ] Status transitions correctly write to `report_status_history` with `changedBy`
- [ ] Merge action correctly moves reporters and increments target count, verified against `TRD.md` §6.5
- [ ] Rejecting without `rejectionReason` returns `400`

**Depends On:** Phase 5.

---

## Phase 7 — Backend Testing & Hardening

**Goal:** Complete the full backend test suite and run a security/config review before frontend work begins.

**Read First:** `TRD.md` §11 (full testing requirements), `architecture.md` §9 (full Security Architecture checklist).

**Tasks:**
1. Write integration tests (Supertest) per `TRD.md` §11.2 against a dedicated test database (`campusplus_test`).
2. Manually verify every row of `PRD.md` §9 (Error Handling & Edge Cases table).
3. Review: no secrets in code, Helmet headers present, CORS allow-list correct, file upload MIME validation confirmed, SQL injection not possible (Prisma parameterizes by default — confirm no raw SQL was introduced).
4. Confirm structured logging never logs student personal data in plaintext (per `architecture.md` §9.6/§13.1).

**Deliverables:** A backend that is feature-complete, tested, and security-reviewed — ready for frontend integration.

**Definition of Done:**
- [ ] All integration tests pass against `campusplus_test`
- [ ] Every edge case in `PRD.md` §9 manually verified and checked off
- [ ] Security review checklist (above) fully passed
- [ ] No `.env` files or secrets present in any git commit history

**Depends On:** Phase 6.

---

## Phase 8 — Student App: Scaffold & Design System

**Goal:** Set up the student-facing React app's structure and shared design system components, no page logic yet.

**Read First:** `design.md` §1 (Design System — layout, typography, color, imagery), `design.md` §2 Student Portal section, `TRD.md` §1 (frontend stack versions).

**Tasks:**
1. Configure Tailwind theme (colors, typography scale, spacing) to match the structural rules in `design.md` §1.3–1.4.
2. Build shared components: `Button`, `Card`, `FormField`, `Header`, `Footer`, `SectionWrapper` — matching the layout patterns described in `design.md` §1.1–1.2.
3. Set up React Router with 4 routes: Home, Report an Issue, Confirmation, 404 (per `design.md` §4 Summary Table).
4. Build the API client module `src/api/reports.js` per `TRD.md` §5.1–5.3 contracts.

**Deliverables:** A styled, routed shell app with reusable components — pages are empty placeholders.

**Definition of Done:**
- [ ] All 4 routes navigate correctly
- [ ] Shared components render and match `design.md`'s described visual system
- [ ] API client successfully calls `GET /departments` and `GET /buildings` against the running backend

**Depends On:** Phase 5 (needs public API available to integrate against), Phase 0.

---

## Phase 9 — Student App: Pages & Logic

**Goal:** Build full page functionality for the student portal.

**Read First:** `design.md` Page 1–4 briefs (Home, Report an Issue, Confirmation, 404), `PRD.md` §4 Epic A user stories, §7 field validation, §9 error handling.

**Tasks:**
1. Build **Home** page per `design.md` Page 1 brief (hero, how-it-works, device categories, trust section, CTA band, footer).
2. Build **Report an Issue** page per `design.md` Page 2 brief — **single page, all fields**, matching `PRD.md` §5.1.2 field list and §7 validation rules exactly. Include the "Number not visible" toggle behavior (US-A3).
3. Wire form submission to `POST /reports`, handle loading/success/error states per `PRD.md` §9.
4. Build **Confirmation** page per `design.md` Page 3 brief.
5. Build **404** page per `design.md` Page 4 brief.
6. Client-side validation mirroring server rules (UX convenience only, per `TRD.md` §6.3).

**Deliverables:** Fully functional student portal, submitting real reports to the live backend.

**Definition of Done:**
- [ ] A real end-to-end submission (with a real photo) succeeds and appears in the database
- [ ] Duplicate submission (same room+device) correctly does not create a second visible report
- [ ] "Number not visible" checkbox correctly disables/skips the field and still submits successfully
- [ ] Submitting with a missing required field shows inline errors, does not crash
- [ ] Fully responsive from 360px to 1920px per `PRD.md` §8.4

**Depends On:** Phase 8.

---

## Phase 10 — Admin App: Scaffold & Design System

**Goal:** Set up the admin app's structure, auth context, and shared components.

**Read First:** `design.md` §2 Admin Panel section, `architecture.md` §9.3 (token storage decision), `TRD.md` §1.

**Tasks:**
1. Reuse/share the same Tailwind theme config from Phase 8 (kept consistent per `design.md` §1).
2. Build `AuthContext` storing JWT in memory (not localStorage, per `architecture.md` §9.3) with login/logout functions.
3. Build `RequireAuth` route wrapper that redirects to `/login` on missing/expired token and handles global `401` responses.
4. Set up React Router with 7 routes: Login, Dashboard, All Reports, Report Detail, Needs Review, Admin Profile, 404 (per `design.md` §4).
5. Build the sidebar navigation component per `design.md` Page 6 brief.
6. Build the API client module `src/api/admin.js` attaching `Authorization: Bearer` automatically per `TRD.md` §5.4 onward.

**Deliverables:** A styled, routed, auth-aware admin shell — pages are empty placeholders except Login.

**Definition of Done:**
- [ ] Login page successfully authenticates against the real backend and stores the token
- [ ] Attempting to visit `/dashboard` without logging in redirects to `/login`
- [ ] Token expiry correctly triggers auto-redirect to login on the next API call

**Depends On:** Phase 6 (needs admin API available), Phase 8 (shares design system).

---

## Phase 11 — Admin App: Pages & Logic

**Goal:** Build full functionality for every admin page.

**Read First:** `design.md` Page 5–11 briefs, `PRD.md` §4 Epic C user stories, §5.2 (all admin functional requirements), `TRD.md` §5.4–5.12.

**Tasks:**
1. Build **Dashboard** — summary cards wired to `GET /admin/dashboard-summary`, quick report list.
2. Build **All Reports** — full table with filters/search/sort/pagination wired to `GET /admin/reports`.
3. Build **Report Detail** — photo, device info, status update dropdown+button, reporters list, status history timeline, wired to `GET /admin/reports/:id` and `PATCH /admin/reports/:id/status` (including mandatory rejection reason field, per US-C3).
4. Build **Needs Review** — flagged reports list with side-by-side compare view, Merge/Keep Separate actions wired to `POST /admin/reports/:id/merge` and `.../keep-separate` (per US-C4).
5. Build **Admin Profile** — change password form wired to `PATCH /admin/profile/password`.
6. Build **404** page.
7. Use TanStack Query for all server-state fetching/caching per `TRD.md` §1.

**Deliverables:** Fully functional admin panel managing real report data end-to-end.

**Definition of Done:**
- [ ] Admin can view, filter, search, and paginate through real reports
- [ ] Status workflow (Open → In Progress → Resolved/Rejected) works correctly and updates history
- [ ] Merge action correctly combines two reports and updates counts in the UI immediately
- [ ] Password change works and old password no longer logs in afterward
- [ ] All status badges color-coded per `design.md` §1.4

**Depends On:** Phase 10.

---

## Phase 12 — Frontend ↔ Backend Integration Testing

**Goal:** Full end-to-end verification of both apps against the real backend together, catching integration bugs before deployment work begins.

**Read First:** `PRD.md` §9 (full edge case table), `TRD.md` §11.4 (manual QA checklist).

**Tasks:**
1. Run the complete student flow: submit 3 reports on the same room+device from different "students" → confirm admin sees `reportCount: 3` with all 3 reporters listed.
2. Run the "not visible" flow: submit with device number hidden → confirm it appears in admin's Needs Review queue → merge it manually → confirm counts update correctly.
3. Test full rejection flow with reason, and full resolution flow, confirming a new report on the same room+device after resolution creates a **fresh** record (not reopening the old one) per `architecture.md` §6.4.
4. Test CORS between the two actual frontend dev URLs and the backend.
5. Test all `PRD.md` §9 edge cases manually one more time in the fully integrated environment (not just backend-isolated as in Phase 7).

**Deliverables:** A verified, fully working three-app system running locally end-to-end.

**Definition of Done:**
- [ ] All scenarios above pass without manual database intervention
- [ ] No console errors in either frontend app during a full normal usage session
- [ ] No CORS errors

**Depends On:** Phase 9, Phase 11.

---

## Phase 13 — CI/CD Pipeline Setup

**Goal:** Automate testing and deployment triggers.

**Read First:** `TRD.md` §12 (exact workflow YAML), `architecture.md` §12.1–12.2.

**Tasks:**
1. Create `.github/workflows/backend-deploy.yml` exactly per `TRD.md` §12.1.
2. Create `.github/workflows/student-app-deploy.yml` and `admin-app-deploy.yml` with lint/build gates per `TRD.md` §12.2.
3. Add required GitHub secrets: `RENDER_DEPLOY_HOOK_URL`, `PRODUCTION_DATABASE_URL`.
4. Confirm path-based triggers work correctly (a change in `admin-app/` does not trigger a backend redeploy, per `architecture.md` §12.2).

**Deliverables:** Working CI/CD pipelines, verified with a trivial test commit to each folder.

**Definition of Done:**
- [ ] A backend-only change triggers only the backend workflow
- [ ] A failing test blocks deployment (verified by intentionally breaking a test once)
- [ ] All three workflows pass on a clean commit

**Depends On:** Phase 7, Phase 12.

---

## Phase 14 — Staging Deployment

**Goal:** Deploy the full system to a staging environment before touching production.

**Read First:** `architecture.md` §10.1 (Staging environment purpose), §11 (Infrastructure table).

**Tasks:**
1. Provision a staging PostgreSQL instance (separate from production).
2. Deploy `backend` to a staging Render service with staging env vars.
3. Deploy `student-app` and `admin-app` to staging Vercel projects (preview/staging branch deployments).
4. Run migrations and dev-equivalent seed data against staging.
5. Repeat the full Phase 12 integration test suite against staging URLs instead of localhost.

**Deliverables:** A fully working staging deployment, publicly reachable via staging URLs.

**Definition of Done:**
- [ ] Full end-to-end flow (student submit → admin resolve) works on staging URLs
- [ ] No environment-variable misconfigurations (confirmed via `/health` and a real submission)

**Depends On:** Phase 13.

---

## Phase 15 — Production Infrastructure Provisioning

**Goal:** Set up all real production infrastructure, without deploying application code yet.

**Read First:** `architecture.md` §11 (Infrastructure & Hosting), §12.3 (First-Time Production Setup Checklist steps 1–6), §8.2 (persistent disk requirement — critical).

**Tasks:**
1. Provision production managed PostgreSQL with **automated daily backups enabled**.
2. Set all backend production environment variables in Render's dashboard per `TRD.md` §8.4.
3. **Attach a persistent disk volume** to the backend production service, mounted at `UPLOAD_DIR=/data/uploads` — this step is mandatory per `architecture.md` §8.2, not optional.
4. Run initial production migration (`npx prisma migrate deploy`) against the production database.
5. Run `npm run seed:admin` interactively against production `DATABASE_URL` to create the real single admin account (never via a public endpoint).
6. Run `npm run seed:reference` with the institution's **real** department/building/room data (replacing placeholder data).
7. Set up custom domains and DNS records per `architecture.md` §11.1 (or real domain if available at this stage).
8. Configure `CORS_ALLOWED_ORIGINS` with the real production frontend URLs.

**Deliverables:** Fully provisioned, empty-of-app-traffic production infrastructure.

**Definition of Done:**
- [ ] Production database reachable, backups confirmed enabled
- [ ] Persistent disk confirmed attached and mounted correctly
- [ ] Real admin account created and login tested against production DB directly (via a temporary local script pointed at prod, not a public form)
- [ ] Real reference data seeded and spot-checked

**Depends On:** Phase 14.

---

## Phase 16 — Production Deployment & Go-Live Verification

**Goal:** Deploy application code to production and verify the system is genuinely ready for real students to use.

**Read First:** `architecture.md` §12.3 (steps 7–12, full checklist), §13 (Observability), §14 (Backup & Disaster Recovery).

**Tasks:**
1. Deploy `backend` to production Render service.
2. Deploy `student-app` and `admin-app` to production Vercel projects with production `VITE_API_BASE_URL`.
3. Verify `/health` returns `200` in production.
4. Submit one real end-to-end test report (real photo, through to admin resolution) in production before announcing go-live.
5. **Verify the persistent disk survives a redeploy**: deploy a trivial change, confirm the test photo from step 4 is still accessible afterward (per `architecture.md` §12.3 step 12 — this is the single most important verification in this phase).
6. Set up UptimeRobot (or equivalent) pinging production `/health` per `architecture.md` §13.4.
7. Set up Sentry error tracking on the production backend per `architecture.md` §13.2.
8. Confirm nightly backup cron job for the uploads directory is running per `architecture.md` §14.

**Deliverables:** A live, monitored, backed-up production system.

**Definition of Done:**
- [ ] All 12 steps of `architecture.md` §12.3 completed and checked off
- [ ] Persistent disk survival test passed
- [ ] Uptime monitoring and error tracking confirmed active with a test alert
- [ ] System is genuinely ready to be shared with real students

**Depends On:** Phase 15.

---

## Phase 17 — Documentation & Handover

**Goal:** Finalize all documentation so the project is maintainable by anyone (including a future you) without re-deriving context.

**Read First:** All four source documents, to confirm nothing has drifted from what was actually built.

**Tasks:**
1. Update `README.md` with final setup instructions, real (or placeholder) production URLs, and a project overview.
2. Reconcile any implementation deviations back into `PRD.md`, `TRD.md`, or `architecture.md` — if the AI agent made a reasonable judgment call during any phase that isn't reflected in the docs, update the docs to match reality (docs must never silently drift from the actual system).
3. Write a short `RUNBOOK.md` covering: how to restore from backup, how to rotate the JWT secret, how to reset the admin password, how to redeploy manually if CI/CD fails.
4. Final commit tagged `v1.0.0` on `main`.

**Deliverables:** A fully documented, tagged, production-ready repository.

**Definition of Done:**
- [ ] All docs accurately reflect the deployed system
- [ ] `RUNBOOK.md` exists and covers all 4 operational scenarios listed above
- [ ] Repository tagged `v1.0.0`
- [ ] Project is demo-ready and deployment-ready simultaneously

**Depends On:** Phase 16.

---

## Summary

17 phases, strictly sequential, taking CampusPlus from an empty repository to a live, monitored, backed-up production system used by real students — with every phase scoped tightly enough for an AI coding agent to complete in a single focused session, and every phase's required reading pointing back to the exact section of `PRD.md`, `TRD.md`, `architecture.md`, or `design.md` that governs it. No phase requires the agent to guess, and no phase silently depends on work that hasn't been explicitly marked done.
