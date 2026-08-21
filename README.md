# CampusPlus — Campus Lab Equipment Fault Reporting System

CampusPlus is a full-stack web application that allows students to report malfunctioning lab equipment (fans, ACs, projectors, CPUs, UPS units, cables, monitors, etc.) without requiring login or registration. Reports are automatically deduplicated — if multiple students report the same faulty device in the same room, the system merges them into a single record and raises its priority instead of creating repeat entries. Lab/IT administrators manage all reports through a separate, authenticated admin panel with a full status workflow.

---

## 📁 Repository Structure (Monorepo)

```
campusplus/
├── student-app/                  # Public React SPA (Vite + Tailwind CSS)
├── admin-app/                    # Authenticated React SPA (Vite + Tailwind CSS)
├── backend/                      # Node.js + Express.js REST API (Prisma + PostgreSQL)
├── docs/                         # PRD, TRD, Architecture, Design, Phases documents
├── .github/workflows/            # CI/CD pipelines for all three services
└── docker-compose.yml            # Local PostgreSQL container definition
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20.x LTS
- npm 10.x+
- Docker (for local PostgreSQL instance) or a local Postgres 15 installation
- Git

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env              # Fill in local environment variables
docker compose up -d db           # Start local Postgres container (or use root docker-compose)
npx prisma migrate dev            # Run schema migrations
npm run seed:dev                  # Seed dev data (departments, buildings, admin account)
npm run dev                       # Start backend on http://localhost:5000
```

### 2. Student Portal Setup
```bash
cd student-app
npm install
cp .env.example .env
npm run dev                       # Start student app on http://localhost:5173
```

### 3. Admin Panel Setup
```bash
cd admin-app
npm install
cp .env.example .env
npm run dev                       # Start admin app on http://localhost:5174
```

---

## 📖 Documentation
All architectural and product specifications are located in `/docs`:
- [`PRD.md`](docs/PRD.md) — Product Requirements Document (features, user stories, scope)
- [`TRD.md`](docs/TRD.md) — Technical Requirements Document (exact versions, API contracts, sequence flows)
- [`architecture.md`](docs/architecture.md) — System Architecture (infrastructure, security, data flows)
- [`design.md`](docs/design.md) — UI/UX Design System reference
- [`phases.md`](docs/phases.md) — Step-by-step implementation build plan

---

## 🧪 Testing & Linting
```bash
# Run lint across all projects
npm run lint

# Run backend unit & integration tests
npm run test:backend
```
