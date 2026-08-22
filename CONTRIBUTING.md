# Contributing to CampusPlus

Thank you for your interest in contributing to **CampusPlus**! We welcome contributions from developers of all skill levels. This document outlines our project standards, development workflow, and pull request guidelines.

---

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Git Workflow & Branching Strategy](#-git-workflow--branching-strategy)
- [Commit Message Conventions](#-commit-message-conventions)
- [Coding Standards & Guidelines](#-coding-standards--guidelines)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Submitting a Pull Request](#-submitting-a-pull-request)

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Contributors are expected to treat all community members with respect, maintain constructive feedback, and collaborate professionally.

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/CampusPlus.git
cd CampusPlus
```

### 2. Install Monorepo Dependencies
```bash
npm install
```

### 3. Setup Local Environment
Ensure PostgreSQL is running locally, then configure `.env` files in `backend/`, `student-app/`, and `admin-app/` according to [`README.md`](README.md#environment-configuration).

```bash
cd backend
npx prisma migrate deploy
node prisma/seedReports.js
cd ..
```

---

## 🌿 Git Workflow & Branching Strategy

1. Always branch off the latest `main` branch.
2. Use descriptive, standardized branch names following this structure:

| Branch Prefix | Purpose | Example |
|---|---|---|
| `feat/` | New features or enhancements | `feat/student-live-ticker` |
| `fix/` | Bug fixes and patches | `fix/audit-log-chronological-order` |
| `docs/` | Documentation additions or updates | `docs/api-contracts` |
| `refactor/` | Code structure improvements without feature changes | `refactor/profile-overview-card` |
| `test/` | Adding or updating unit/integration tests | `test/deduplication-merge-tests` |

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

---

## 💬 Commit Message Conventions

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification to ensure an organized and automated changelog history:

### Format:
```
<type>(<scope>): <short description in present tense>

[optional body explaining context and rationale]

[optional footer(s) referencing issue numbers]
```

### Supported Types:
- `feat`: A new user-facing feature or enhancement.
- `fix`: A bug fix.
- `docs`: Documentation updates only.
- `style`: Formatting, missing semicolons, whitespace changes.
- `refactor`: Refactoring production code without changing behavior.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Build scripts, package updates, dev tool configuration.

### Examples:
```bash
git commit -m "feat(admin): add quick details inspector modal for needs-review queue"
git commit -m "fix(backend): correct chronological sorting order in status history query"
git commit -m "docs(readme): add production nginx reverse proxy configuration"
```

---

## 📐 Coding Standards & Guidelines

### Backend (Node.js / Express / Prisma)
- Follow standard ES6+ JavaScript syntax.
- All request parameters and request bodies must be validated using **Zod** schemas.
- Route database queries through **Prisma ORM**; avoid raw SQL queries unless explicitly approved.
- Use structured logging with **Pino**; avoid `console.log` in production services.
- Wrap asynchronous controller operations in standardized error handler wrappers.

### Frontend (React / Vite / TailwindCSS)
- Use functional components with React Hooks.
- Adhere strictly to the design system color tokens defined in [`docs/design.md`](docs/design.md).
- Avoid inline styles; utilize TailwindCSS utility classes.
- Ensure all interactive buttons, links, and inputs have unique, accessible labels and hover/active states.
- Maintain responsive layouts across mobile (`375px+`), tablet (`768px+`), and desktop (`1024px+`) breakpoints.

---

## 🧪 Testing & Quality Assurance

Before submitting changes, ensure that all automated checks pass cleanly:

```bash
# 1. Run backend unit and integration test suite
npm --prefix backend test

# 2. Run code style and syntax linter across entire monorepo
npm run lint

# 3. Verify frontend production bundle builds
npm --prefix student-app run build
npm --prefix admin-app run build
```

---

## 📬 Submitting a Pull Request

1. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of the upstream repository.
3. Fill out the PR description with:
   - **Summary of Changes:** Concise bullet points describing what was added/fixed.
   - **Motivation / Problem Solved:** Why this change is necessary.
   - **Testing Performed:** Commands executed and manual verification steps.
   - **Screenshots / Recordings:** Required for any UI or visual updates.
4. Maintain a clean commit history. Be prepared to address code review feedback.
