# Security Policy

The **CampusPlus** team takes the security of our application, infrastructure, and user data seriously. This document details our supported versions, vulnerability reporting process, and built-in security defense mechanisms.

---

## 🛡 Supported Versions

Security patches and updates are actively maintained for the following versions:

| Version | Supported | Status |
|---|---|---|
| `1.x.x` (Current Main) | :white_check_mark: | Active Security & Bug Fixes |
| `< 1.0.0` | :x: | Deprecated / Unsupported |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within CampusPlus, please **do not open a public GitHub issue**. Doing so endangers active production instances. Instead, follow our responsible disclosure process:

1. **Email Disclosure:** Send details to the project maintainers at `security@campusplus.local` (or create a private GitHub Security Advisory).
2. **Include in Report:**
   - Detailed description of the vulnerability.
   - Steps to reproduce the issue (proof-of-concept script, request payloads, or screenshots).
   - Potential impact of the vulnerability.
   - Any suggested remediations or patches.
3. **Response SLA:**
   - **Initial Response:** Within 48 hours acknowledging receipt.
   - **Status Update & Assessment:** Within 5 business days.
   - **Patch Release:** As promptly as possible depending on severity.

---

## 🔒 Security Architecture & Controls

CampusPlus implements defense-in-depth measures across all architectural layers:

### 1. Authentication & Session Management
- **Stateless JWT Tokens:** Admin authorization uses cryptographically signed JSON Web Tokens (`HS256`) with a strict expiration window.
- **Password Hashing:** Passwords are never stored in plaintext. They are hashed using **`bcrypt`** with 10 salt rounds before database persistence.

### 2. Request Throttling & DDoS Protection
- **Rate Limiting:** `express-rate-limit` enforces rate ceilings on API endpoints (including report submissions and login attempts) to prevent brute-force attacks and denial-of-service attempts.

### 3. HTTP Security Headers
- **Helmet Middleware:** Standard HTTP headers are hardened using `helmet` to protect against Cross-Site Scripting (XSS), Clickjacking (`X-Frame-Options`), MIME-type sniffing, and Cross-Origin resource leaks.

### 4. Input Sanitization & Type Safety
- **Zod Validation:** All incoming request bodies and query parameters are strictly validated against strongly-typed Zod schemas before reaching business logic.
- **SQL Injection Prevention:** Database interactions are mediated exclusively through **Prisma ORM**, which utilizes parameterized queries under the hood to prevent SQL injection vulnerabilities.

### 5. Secure File Uploads
- **MIME Type Whitelisting:** Multer enforces strict allowed MIME types (`image/jpeg`, `image/png`, `image/webp`).
- **File Size Limits:** File size is capped at 5MB per upload.
- **Storage Isolation:** Uploaded files are stored in a dedicated, isolated directory with sanitized UUID-generated filenames to prevent path traversal exploits.

### 6. Cross-Origin Resource Sharing (CORS)
- **Origin Whitelisting:** Production backend instances only accept cross-origin requests from explicitly declared frontend origins configured via `CORS_ORIGIN`.
