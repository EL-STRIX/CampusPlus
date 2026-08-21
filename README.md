# CampusPlus — Campus Hardware Fault Reporting & Tracking System

> A full-stack, enterprise-grade hardware fault reporting and facilities management platform for university lab environments.

---

## 🏛 System Architecture Overview

CampusPlus is structured as a robust monorepo with 3 distinct components:

```
Campusplus/
├── backend/            # Express.js REST API + PostgreSQL with Prisma ORM
├── student-app/        # Student-facing React SPA (TailwindCSS + Vite)
├── admin-app/          # Facilities Admin Console React SPA (TailwindCSS + Vite)
└── docs/               # PRD, TRD, Architecture, Design System, Phases
```

### Core Features:
- **Zero-Login Student Portal:** High-efficiency, frictionless report submission under 60 seconds with live photo upload and cascading location selectors.
- **Intelligent Duplicate Matching Engine:** Automatically groups reports by `(roomId, deviceNumber)` within PostgreSQL transactions. Increments report frequency and appends reporter details to prioritize severe issues.
- **Needs Review Queue:** Untagged hardware reports are automatically flagged for manual admin review with side-by-side suggested candidates in the same room.
- **Transactional Merging & Audit History:** Administrators can merge duplicate tickets or keep them separate. Every status transition (`Open` → `In Progress` → `Resolved` / `Rejected`) is immutably logged with admin attribution and timestamps.
- **Pixel-Accurate Visual Design:** Strictly aligned with the connected Stitch MCP design system (Technical Teal `#004349`, Slate `#64748B`, Amber `#F59E0B`, Emerald `#10B981`, Rose `#EF4444`, Purple `#8B5CF6`).

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **PostgreSQL**: v14+ (running on `localhost:5432`)
- **Git**

### 2. Environment Configuration
Ensure `.env` files are configured:

**`backend/.env`**:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:hello_psql%401@localhost:5432/campusplus_dev"
JWT_SECRET="campusplus_jwt_super_secret_production_key_2026"
JWT_EXPIRES_IN="8h"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

**`student-app/.env`**:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

**`admin-app/.env`**:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Database Migration & Seeding
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### 4. Running the Applications
In 3 separate terminal tabs:

```bash
# Tab 1: Backend API (Port 5000)
cd backend
npm run dev

# Tab 2: Student Portal (Port 3000)
cd student-app
npm run dev

# Tab 3: Admin Console (Port 3001)
cd admin-app
npm run dev
```

---

## 🧪 Testing & Verification

### Run Automated Backend Test Suite (47 Tests, 100% Pass)
```bash
npm --prefix backend test
```

### Run Monorepo Linter
```bash
npm run lint
```

### Build Production Artifacts
```bash
npm --prefix student-app run build
npm --prefix admin-app run build
```

---

## 🔐 Default Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

---

## 📄 Documentation Reference
- [`docs/PRD.md`](docs/PRD.md): Product Requirements & User Stories
- [`docs/TRD.md`](docs/TRD.md): Technical Requirements & API Contracts
- [`docs/architecture.md`](docs/architecture.md): System Design & Security
- [`docs/design.md`](docs/design.md): Stitch MCP Design Tokens & UI Guidelines
- [`docs/phases.md`](docs/phases.md): Step-by-Step Implementation Tracker
