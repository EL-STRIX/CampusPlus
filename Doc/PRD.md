# Product Requirements Document (PRD)
## CampusPlus — Campus Lab Equipment Fault Reporting System

**Document Version:** 2.0 (Revised)
**Prepared For:** Final Year Project (bachelor of computer application)
**Date:** August 19, 2026
**Status:** Draft for development

---

## 0. Executive Summary

CampusPlus is a full-stack web application that allows students to report malfunctioning lab equipment (fans, ACs, projectors, CPUs, UPS units, cables, monitors, etc.) without requiring login or registration. Reports are automatically deduplicated — if multiple students report the same faulty device in the same room, the system merges them into a single record and raises its priority instead of creating repeat entries. Lab/IT administrators manage all reports through a separate, authenticated admin panel with a full status workflow (Open → In Progress → Resolved/Rejected).

The system is built as two independent frontend applications (Student Portal, Admin Panel) backed by a shared Node.js/Express REST API and a PostgreSQL database. This document defines the full product scope, functional and non-functional requirements, data model, API contracts, UI/UX expectations, risks, and delivery plan for a final-year academic project of individual scope.

---

## 1. Overview

### 1.1 Purpose
Give students a near-zero-friction way to report broken lab equipment, and give lab administrators a prioritized, de-duplicated view of what's actually broken — ranked by how many students are affected.

### 1.2 Problem Statement
Currently, when lab equipment breaks down, there is no structured way for students to report the issue. Complaints are informal (verbal, scattered, or not reported at all), leading to delayed repairs, duplicate/unclear reports, and no visibility into which issues affect the most students.

### 1.3 Goals
- Let students report a broken device in under 60 seconds, with no login barrier.
- Automatically detect and merge duplicate reports for the same device (same room + same device number) into a single entry with an incrementing counter.
- Rank reports by priority based on the number of students reporting the same device.
- Give admins a clean dashboard to track, manage, and resolve reports through a defined status workflow.
- Keep the student-facing site and the admin panel as two fully separate applications/URLs.

### 1.4 Scope (In / Out) — MVP Boundary

| In Scope (v1 / MVP) | Out of Scope (v1) — Future Phase |
|---|---|
| Anonymous student report submission | Student login / report history / tracking ID lookup |
| Photo upload for device | Multiple photos per report |
| Duplicate detection (room + device number) | AI-based image matching for duplicate detection |
| Manual-review flow when device number is not visible | Automated fuzzy-matching of ambiguous duplicates |
| Single admin account, full status workflow | Multi-admin roles / permission tiers |
| Admin dashboard, filters, search | Email/SMS/push notifications |
| Report priority via count | Notifications badge / live updates (websockets) — noted as a recommended fast-follow, see §5.6 |
| SQL (PostgreSQL) data storage | Analytics/reporting exports (CSV/PDF) — fast-follow candidate |
| Responsive web (mobile + desktop browsers) | Native mobile app |

### 1.5 Non-Goals (Explicit)
- No student authentication in v1 — anonymity by design is a deliberate product decision to reduce reporting friction, not an oversight.
- No real-time notifications in v1 — admin is expected to check the dashboard; a "New reports since last visit" badge is the recommended low-cost alternative (§5.6).
- No multi-admin/roles in v1 — acceptable for a single-institution, single-lab-team scope.

---

## 2. Stakeholders

| Role | Person | Responsibility |
|---|---|---|
| Product Owner / Developer | You (Final Year Student) | Defines requirements, builds, tests, and demos the system |
| End User — Reporter | Students | Submit fault reports |
| End User — Operator | Lab Admin / IT Staff (represented by the single admin account) | Triage and resolve reports |

*(No formal academic panel/guide is being tracked as a stakeholder for this document per current scope — can be added later if a mentor requests a review checkpoint.)*

---

## 3. Users & Personas

| Persona | Description | Access |
|---|---|---|
| **Student (Reporter)** | Any student who finds a faulty device in a lab | Public, no login, dedicated site/URL |
| **Admin (Lab/IT Staff)** | Single admin managing all reports | Separate login-protected site/URL |

---

## 4. User Stories & Acceptance Criteria

### Epic A — Student Reporting

**US-A1:** As a student, I want to report a broken device without logging in, so that I can quickly flag an issue without friction.
- **Acceptance Criteria:**
  - AC1: Student can access the report form from the home page with zero authentication steps.
  - AC2: Form does not request or store any login credentials.
  - AC3: Submission completes in a single flow without page reload errors.

**US-A2:** As a student, I want to upload a photo of the broken device, so that the admin can visually confirm the issue.
- **Acceptance Criteria:**
  - AC1: Form rejects submission if no photo is attached (photo is mandatory in v1).
  - AC2: Only image file types are accepted (`.jpg`, `.jpeg`, `.png`, `.webp`); other types are rejected with a clear error message.
  - AC3: Max file size is enforced (recommended: 5 MB) with a clear error if exceeded.
  - AC4: Upload shows a progress/loading state; failure shows a retry option.

**US-A3:** As a student, I want to enter the device number, or mark it as "not visible" if I can't find it, so that my report is still accepted even if the tag is missing/damaged.
- **Acceptance Criteria:**
  - AC1: Device number field is required unless "Number not visible" is checked.
  - AC2: If "not visible" is checked, the report is still created but flagged `device_number_visible = false`.
  - AC3: Reports flagged this way are never auto-merged (see §6.3 Fix) — they always go to admin for manual match confirmation.

**US-A4:** As a student, I want to know my report was submitted successfully, so that I have confidence it was received.
- **Acceptance Criteria:**
  - AC1: A confirmation screen/message appears after successful submission.
  - AC2: If submission fails (network/server error), a clear retry message is shown and form data is not lost.

### Epic B — Duplicate Detection & Prioritization

**US-B1:** As the system, I want to detect when multiple students report the same device in the same room, so that duplicate reports don't clutter the admin dashboard.
- **Acceptance Criteria:**
  - AC1: If `room_number` + `device_number` exactly matches an existing **open or in-progress** report, the new submission increments `report_count` on that report instead of creating a new row.
  - AC2: If `device_number_visible = false`, the system never auto-merges — it creates a new report and flags it `possible_duplicate = true` with a suggested match reference (see §6.3).
  - AC3: Every student who contributes to a report (whether original or merged) is recorded individually in `report_reporters`.

**US-B2:** As an admin, I want reports ranked by how many students reported them, so that I can prioritize the most impactful issues first.
- **Acceptance Criteria:**
  - AC1: Default dashboard sort is `report_count` descending.
  - AC2: Admin can re-sort by date or status.

### Epic C — Admin Management

**US-C1:** As an admin, I want to log in securely, so that only authorized staff can access the reports.
- **Acceptance Criteria:**
  - AC1: Login requires username + password.
  - AC2: Invalid credentials show a generic error (no "user not found" vs "wrong password" distinction, to avoid username enumeration).
  - AC3: JWT session expires after a defined period (recommended: 8 hours) and requires re-login.

**US-C2:** As an admin, I want to view all reports with filtering and sorting, so that I can efficiently manage my workload.
- **Acceptance Criteria:**
  - AC1: Filters available: Status, Building, Department, Device Type, Date Range.
  - AC2: Search by Student Code or Device Number returns exact and partial matches.
  - AC3: List is paginated (recommended: 20 per page) once report volume grows.

**US-C3:** As an admin, I want to update a report's status through a defined workflow, so that I can track resolution progress.
- **Acceptance Criteria:**
  - AC1: Status can move Open → In Progress → Resolved, or to Rejected from Open/In Progress.
  - AC2: Every status change is timestamped and recorded in `report_status_history` with the admin who made the change.
  - AC3: Resolved/Rejected reports are excluded from future duplicate-matching (a new report on the same room+device after resolution creates a fresh record).

**US-C4:** As an admin, I want to manually confirm or reject a "possible duplicate" flagged report, so that ambiguous matches (missing device numbers) don't get incorrectly merged automatically.
- **Acceptance Criteria:**
  - AC1: Dashboard shows a distinct "Needs Review" filter/tab for `possible_duplicate = true` reports.
  - AC2: Admin can either "Merge into existing report" (manually selecting the target) or "Keep as separate report."
  - AC3: Merge action moves the reporter record into the target report and updates counts accordingly.

---

## 5. Functional Requirements

### 5.1 Student-Facing Website (No Login)

#### 5.1.1 Landing / Home Page
- Clean, minimal, professional design communicating the purpose of CampusPlus.
- Sections: Hero/intro, "How it works" (3–4 steps), a prominent **"Report an Issue"** call-to-action button, footer with basic contact/about info.
- Fully responsive (mobile-first — students will often report from their phones in the lab).
- **Layout hierarchy (wireframe-in-words):**
  ```
  [Navbar: Logo | "Report an Issue" button]
  [Hero: Headline + subtext + large CTA button]
  [How it Works: 3 steps with icons — Snap Photo → Fill Details → Submit]
  [Footer: About / Contact / (optional) Admin login link, small/discrete]
  ```

#### 5.1.2 Report Submission Flow
A single multi-step (sectioned) form:

**Step 1 — Device Photo**
- Student captures/uploads a photo of the faulty device (required, validated per US-A2).

**Step 2 — Student Information**
- Student Code / Roll Number (required, format-validated — see §7)
- Department (required, dropdown)
- Stream/Branch (required, dropdown, dependent on department)
- Year/Semester (optional but recommended)

**Step 3 — Location Information**
- Building Number/Name (required, dropdown)
- Room Number (required, dropdown or validated text)

**Step 4 — Device Information**
- Device Type (dropdown: Fan, Light, AC, Projector, Monitor, Keyboard, Mouse, CPU, UPS, Ethernet Cable, HDMI Cable, Other Cable, Other)
- Device/Asset Number — required unless:
  - Checkbox: **"Number not visible / not available"** — if checked, numeric field is skipped and report is flagged for manual admin review (per US-A3, US-B1 AC2).

**Step 5 — Additional Notes**
- Free-text box (optional), max length enforced (see §7).

**Step 6 — Submit**
- On submit, duplicate-matching logic runs (§6.3) and the student sees a confirmation screen.

#### 5.1.3 Layout hierarchy — Report Form (wireframe-in-words)
```
[Progress indicator: Step 1 of 5]
[Form section for current step]
[Back] [Next / Submit]
```

### 5.2 Admin Web App (Login Required)

#### 5.2.1 Authentication
- Single admin account (seeded directly into the database via a one-time setup script — see §5.5).
- Login page, JWT-based session (8-hour expiry), protected routes.
- Logout clears token client-side; no server-side session invalidation needed for single-admin v1 scope (documented trade-off, see §11).

#### 5.2.2 Dashboard (Overview)
- Summary cards: Total Reports Today, Total Open, Total In Progress, Total Resolved, Reports Needing Review (possible duplicates).
- Reports table, sortable by: Priority (`report_count`, default), Date submitted, Status.
- **Layout hierarchy (wireframe-in-words):**
  ```
  [Sidebar: Dashboard | All Reports | Needs Review | Logout]
  [Top: Summary cards row]
  [Main: Filterable/sortable reports table]
  ```

#### 5.2.3 Report Detail View
- Device photo, device type, device number (or "not visible" flag), room/building.
- **Report count** and full list of reporting students (student code, department, stream, timestamp).
- Additional notes shown **per-reporter** (resolves the ambiguity from v1 — see §6 Fix #3).
- Status + status history timeline (chronological list: status, timestamp, admin).
- **Layout hierarchy (wireframe-in-words):**
  ```
  [Photo] [Device Info block] [Status dropdown + Update button]
  [Reporters list: expandable rows, one per student]
  [Status History: vertical timeline]
  ```

#### 5.2.4 Status Workflow (Confirmed: Full Workflow)
```
Open → In Progress → Resolved
  ↓          ↓
Rejected  Rejected   (either state can be rejected, with a reason field)
```
- **Open** — default state on creation/first report.
- **In Progress** — admin has acknowledged and is working on it.
- **Resolved** — issue fixed; report closed. Excluded from future duplicate matching (§6.3).
- **Rejected/Invalid** — admin marks report as invalid, with a mandatory reason field (e.g., "Duplicate of report #X," "Not an actual fault," "Insufficient info").
- Every change is timestamped and stored in `report_status_history`.

#### 5.2.5 "Needs Review" Queue (New — addresses duplicate-matching fix)
- Dedicated tab listing all reports with `possible_duplicate = true`.
- Admin can view suggested matching report(s) side-by-side and choose: **Merge** or **Keep Separate**.

#### 5.2.6 Search & Filters
- Filter by: Status, Building, Room Number, Department, Device Type, Date range.
- Search by: Student Code (partial match) or Device Number (exact match).
- Results paginated at 20 per page.

### 5.3 Reference Data Management (New Section)
- Departments, Streams, Buildings, and Rooms are stored as **seed/reference tables** (`departments`, `buildings`, `rooms`) rather than free text, to keep duplicate-matching keys clean and dropdowns consistent.
- For v1, this data is seeded once via a SQL seed script based on the institution's actual department/building list (no admin CRUD UI for reference data in v1 — documented as a fast-follow, since building a full CRUD screen for this is out of proportion for a single-institution academic project).

### 5.4 Admin Account Provisioning (New — fixes Mistake #4)
- The single admin account is created via a **one-time database seed script** (`npm run seed:admin`) that prompts for a username/password at setup time and stores a bcrypt-hashed password.
- No public admin signup route exists (intentional security decision — prevents unauthorized admin account creation).

### 5.5 Rate Limiting & Anti-Spam (New — fixes Mistake #7 / gap)
- Public report submission endpoint (`POST /api/reports`) is rate-limited per IP (recommended: max 10 submissions per hour per IP) to prevent spam/abuse, since there is no login barrier.
- Basic honeypot field or lightweight CAPTCHA (e.g., Google reCAPTCHA v3, invisible) recommended on the report form to deter bot submissions — flagged as a security recommendation for implementation.

### 5.6 Notifications (Documented Non-Goal + Recommended Fast-Follow)
- v1 has no email/SMS/push notifications (confirmed non-goal, §1.5).
- **Recommended low-cost alternative for v1:** a "New reports since last visit" badge/counter on the admin dashboard, computed client-side by comparing last-viewed timestamp (stored in browser local state) against report `created_at`/`updated_at`. This requires no external notification service and is a reasonable scope addition if time permits.

---

## 6. Duplicate-Matching Logic — Corrected Design

### 6.1 Original Flaw (Identified in Review)
The v1 logic auto-merged reports based on `room_number + device_type` when the device number wasn't visible. This risks **false-positive merges** — e.g., two different broken monitors in the same room would incorrectly collapse into a single report, hiding a real second fault from the admin.

### 6.2 Corrected Logic
```
ON new report submission:

  IF device_number_visible == true:
    key = (room_number, device_number)
    existing_report = FIND report WHERE key matches AND status IN ('open', 'in_progress')

    IF existing_report exists:
      existing_report.report_count += 1
      ADD row to report_reporters (linked to existing_report.id)
    ELSE:
      CREATE new report (report_count = 1, possible_duplicate = false)
      ADD row to report_reporters (linked to new report.id)

  IF device_number_visible == false:
    // Never auto-merge — always create a new report, flagged for manual review
    candidate_matches = FIND reports WHERE room_number matches AND device_type matches 
                         AND status IN ('open', 'in_progress')
    CREATE new report (report_count = 1, possible_duplicate = true, 
                        suggested_match_ids = candidate_matches.ids)
    ADD row to report_reporters (linked to new report.id)
    // Report appears in admin's "Needs Review" queue with suggested_match_ids shown
```

### 6.3 Admin Merge Action (Manual Review Resolution)
- Admin opens a "Needs Review" report, sees suggested match(es) side-by-side (photo + details).
- **Merge:** moves the reporter row(s) from the new report into the target report, increments target's `report_count`, and marks the new report as `merged_into: <target_id>` (soft-deleted from active view, retained for audit).
- **Keep Separate:** clears the `possible_duplicate` flag; report proceeds through the normal workflow independently.

### 6.4 Resolved/Rejected Exclusion
- Matching queries always exclude reports with `status IN ('resolved', 'rejected')`. A new report on the same room+device after resolution creates a fresh record — this applies uniformly to both `resolved` and `rejected` states (this was ambiguous in v1; now explicitly resolved for both statuses).

---

## 7. Field-Level Validation Rules (New Section)

| Field | Required? | Validation |
|---|---|---|
| Device Photo | Yes | Image only (`.jpg`, `.jpeg`, `.png`, `.webp`), max 5 MB |
| Student Code | Yes | Alphanumeric, institution-specific format (define regex based on your college's actual code format, e.g., `^[A-Z0-9]{6,12}$`) |
| Department | Yes | Must match a value from seeded `departments` table |
| Stream/Branch | Yes | Must match a value from seeded `streams` table, filtered by department |
| Year/Semester | No | If provided, integer 1–8 (or 1–4 for year) |
| Building Number | Yes | Must match a value from seeded `buildings` table |
| Room Number | Yes | Must match a value from seeded `rooms` table, filtered by building |
| Device Type | Yes | Must be one of the predefined enum values |
| Device Number | Conditional | Required unless "not visible" is checked; alphanumeric, max 30 chars |
| Additional Notes | No | Max 500 characters |
| Admin Username | Yes (setup only) | Min 4 characters |
| Admin Password | Yes (setup only) | Min 8 characters, at least 1 number (bcrypt hashed at rest) |

---

## 8. Non-Functional Requirements (New Section)

### 8.1 Performance
- Report submission (including photo upload) should complete in under 5 seconds on a typical campus Wi-Fi connection.
- Duplicate-match lookup should complete in under 300ms server-side (indexed query on `room_number + device_number`).
- Admin dashboard should load the first page of reports in under 2 seconds for up to ~1,000 total report records (reasonable ceiling for a single-institution academic project).

### 8.2 Scalability (Right-Sized for Project Scope)
- Designed to comfortably support a single institution's usage (estimated hundreds of reports per semester) — not designed for multi-campus or multi-tenant scale. This is a deliberate, documented scope limitation, not an oversight.

### 8.3 Security
- All admin routes protected by JWT middleware; public routes contain no sensitive data exposure.
- Passwords stored using bcrypt (never plaintext).
- Input sanitization on all form fields (server-side validation, not just client-side) to prevent injection attacks.
- File upload validation on both client and server (MIME type + size, not just file extension, to prevent disguised malicious uploads).
- Rate limiting on public submission endpoint (§5.5).
- HTTPS enforced in production deployment.

### 8.4 Browser & Device Support
- Latest two versions of Chrome, Firefox, Safari, and Edge.
- Fully responsive from 360px (mobile) to 1920px (desktop) viewport widths.

### 8.5 Availability
- No formal SLA required for an academic project; target "best effort" uptime suitable for demo/evaluation purposes, hosted on free/low-cost tiers (e.g., Render, Railway, Vercel/Netlify).

---

## 9. Error Handling & Edge Cases (New Section)

| Scenario | Expected Behavior |
|---|---|
| Photo upload fails mid-submission | Show inline error, allow retry without losing other filled fields |
| Network drops during submission | Show "submission failed, please retry" message; do not silently lose data |
| Duplicate submission double-click | Debounce/disable submit button after first click to prevent duplicate rows |
| Invalid/non-existent room number submitted | Form-level validation blocks submission before it reaches the server (dropdown-based, so this should be structurally prevented) |
| Admin session expires mid-action | Redirect to login with a "session expired" message; do not lose in-progress status-change action silently — show a warning before it's lost |
| Two admins editing same report simultaneously | Out of scope for v1 (single admin account) — documented as N/A |
| Malicious file uploaded disguised as image | Server-side MIME-type verification (not just extension check) rejects the file |

---

## 10. Data Model (SQL Schema)

**`reports`**
| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| device_type | VARCHAR | Fan, AC, CPU, etc. |
| device_number | VARCHAR, nullable | null if not visible |
| device_number_visible | BOOLEAN | |
| building_number | VARCHAR (FK → buildings) | |
| room_number | VARCHAR (FK → rooms) | |
| photo_url | VARCHAR | |
| report_count | INTEGER, default 1 | incremented on duplicate match |
| possible_duplicate | BOOLEAN, default false | true when device number not visible |
| suggested_match_ids | UUID[], nullable | candidate matches for admin review |
| merged_into | UUID, nullable | set if this report was merged into another |
| status | ENUM(open, in_progress, resolved, rejected) | default 'open' |
| rejection_reason | TEXT, nullable | required if status = rejected |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| resolved_at | TIMESTAMP, nullable | |

**`report_reporters`**
| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| report_id | FK → reports.id | |
| student_code | VARCHAR | |
| department | VARCHAR | |
| stream | VARCHAR | |
| year_semester | VARCHAR, nullable | |
| notes | TEXT, nullable | this student's own comment |
| reported_at | TIMESTAMP | |

**`report_status_history`**
| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| report_id | FK → reports.id | |
| status | ENUM | |
| changed_at | TIMESTAMP | |
| changed_by | FK → admins.id | |

**`admins`**
| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| username | VARCHAR, unique | |
| password_hash | VARCHAR | bcrypt |
| created_at | TIMESTAMP | |

**`departments`** / **`streams`** / **`buildings`** / **`rooms`** (New — reference/seed tables)
| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| name | VARCHAR | |
| parent_id | FK, nullable | e.g., streams.department_id, rooms.building_id |

---

## 11. API Design (REST)

### Public (Student-facing, no auth, rate-limited)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reports` | Submit a new report or increment/flag existing duplicate |
| GET | `/api/departments` | Get departments (and nested streams) for dropdowns |
| GET | `/api/buildings` | Get buildings (and nested rooms) for dropdowns |
| POST | `/api/uploads` | Upload device photo, returns URL (server-side MIME + size validation) |

### Admin (Auth required — JWT)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login, returns JWT (8-hour expiry) |
| POST | `/api/admin/logout` | Client-side token clear (documented, no server session store in v1) |
| GET | `/api/admin/reports` | List reports (filter/sort/search via query params, paginated) |
| GET | `/api/admin/reports/:id` | Get single report detail incl. all reporters + status history |
| PATCH | `/api/admin/reports/:id/status` | Update status; `rejection_reason` required if status = rejected |
| GET | `/api/admin/reports/needs-review` | List all `possible_duplicate = true` reports |
| POST | `/api/admin/reports/:id/merge` | Merge a flagged report into a target report id |
| POST | `/api/admin/reports/:id/keep-separate` | Clear `possible_duplicate` flag |
| GET | `/api/admin/dashboard-summary` | Get counts for dashboard cards |

---

## 12. Technology Stack (Confirmed)

| Layer | Technology |
|---|---|
| Frontend (Student site) | React + Tailwind CSS |
| Frontend (Admin panel) | React + Tailwind CSS (separate app/deployment) |
| Backend | Node.js + Express.js |
| API | REST |
| Database | PostgreSQL |
| Auth (Admin only) | JWT, bcrypt for password hashing |
| File/Photo Storage | Cloud object storage (S3-compatible) or local disk (dev) |
| Rate Limiting | `express-rate-limit` middleware (or equivalent) |
| Deployment (suggested) | Two frontend deployments (Vercel/Netlify) + backend (Render/Railway) + managed Postgres |

---

## 13. UI/UX Requirements

- **Design tone:** Minimal, professional, campus-friendly — generous white space, clear typography, consistent 2–3 color palette.
- **Student site:** Mobile-first (students report from inside a lab on their phone).
- **Admin panel:** Data-dense but organized — table views, filters, color-coded status badges (Open = gray/blue, In Progress = amber, Resolved = green, Rejected = red, Needs Review = purple/highlighted).
- **Accessibility:** Proper form labels, sufficient color contrast (WCAG AA target), full keyboard navigability.

---

## 14. Risks & Mitigations (New Section)

| Risk | Impact | Mitigation |
|---|---|---|
| Students misreport room/device number, causing false or missed duplicate matches | Medium | Dropdown-based (not free-text) room/building selection; manual admin review queue for ambiguous cases |
| No login means spam/bogus submissions possible | Medium | Rate limiting + optional CAPTCHA (§5.5) |
| Single admin account = single point of failure (lost password, unavailability) | Low–Medium | Document a password-reset procedure via direct DB access for v1; flag multi-admin support as a fast-follow |
| Photo storage costs/quota grow unexpectedly | Low | Enforce 5MB max file size; monitor storage usage; local disk acceptable for demo scope |
| Scope creep given solo development | Medium | MVP scope table (§1.4) explicitly separates v1 from future phases |
| Duplicate-matching false positives (device number visible but mistyped) | Low–Medium | Accepted trade-off for v1; documented as a known limitation, not silently ignored |

---

## 15. Success Metrics

- Report submission completion rate (form started vs. submitted).
- Average time to submit a report (target: under 60 seconds).
- Duplicate-detection accuracy (correctly merged vs. incorrectly split/merged reports).
- Admin average time-to-resolution per report.
- Percentage of reports correctly ranked by priority (`report_count`) in dashboard testing.
- Number of "Needs Review" reports correctly resolved by admin action (merge vs. keep separate).

---

## 16. Testing & QA Strategy (New Section)

- **Unit tests:** Duplicate-matching logic (§6.2) — cover exact match, no match, "not visible" flagging, and resolved/rejected exclusion cases.
- **Integration tests:** Full report submission flow (photo upload → form validation → database write); admin status-update flow.
- **Manual QA scenarios:** Cover all rows in §9 (Error Handling & Edge Cases table) explicitly before demo/evaluation.
- **Validation testing:** Confirm all field-level rules in §7 are enforced both client-side and server-side (server-side is the source of truth; client-side is UX convenience only).

---

## 17. Deployment & Environment Strategy (New Section)

- **Development:** Local environment, local Postgres instance (or Dockerized Postgres), local file storage for uploads.
- **Production/Demo:** 
  - Frontend: Two separate deployments (Student site, Admin panel) on Vercel or Netlify.
  - Backend: Node/Express API on Render or Railway.
  - Database: Managed PostgreSQL instance (Render/Railway/Supabase free tier acceptable for academic scope).
  - Environment variables (DB connection string, JWT secret, storage credentials) managed via `.env` files locally and platform secret managers in production — never committed to version control.

---

## 18. Glossary

| Term | Definition |
|---|---|
| **Report** | A single logical record of a faulty device at a specific room+device combination |
| **Reporter** | An individual student submission linked to a report (one report can have many reporters) |
| **report_count** | The number of students who have reported the same device; used as the priority score |
| **Possible Duplicate** | A report flagged for manual admin review because the device number wasn't visible, so automatic matching couldn't be safely applied |
| **Merge** | The admin action of combining a flagged report's reporters into an existing target report |
| **Device Number** | The asset tag/serial number physically printed on lab equipment (e.g., CPU or UPS tag) |

---

## 19. Suggested Development Phases (Generic Estimates — No Fixed Deadline)

| Phase | Deliverable | Relative Effort |
|---|---|---|
| **Phase 1 — Core Backend & Database** | Express API, PostgreSQL schema, duplicate-matching logic (incl. manual-review flow), photo upload, rate limiting | ~25% |
| **Phase 2 — Student Web App** | Landing page + multi-step report form + submission flow + validation | ~20% |
| **Phase 3 — Admin Web App** | Login, dashboard, report list/detail, status workflow, Needs Review queue | ~30% |
| **Phase 4 — Testing & Edge Cases** | Unit/integration tests, manual QA against §9 edge-case table | ~15% |
| **Phase 5 — Polish & Deployment** | Responsive design pass, accessibility check, deployment to hosting, final demo prep | ~10% |

---

## 20. Change Log

| Version | Date | Changes |
|---|---|---|
| 1.0 | Aug 19, 2026 | Initial draft |
| 2.0 | Aug 19, 2026 | Added: Executive Summary, Scope table, User Stories/Acceptance Criteria, NFRs, Security requirements, Error handling, Field validation, Risks, Testing strategy, Deployment strategy, Glossary, Stakeholders, wireframe-in-words layouts. Fixed: duplicate-matching false-positive flaw (now flags for manual review instead of auto-merging on device type), resolved/rejected exclusion ambiguity, notes aggregation ambiguity, admin account provisioning gap, added rate limiting/anti-spam. |
