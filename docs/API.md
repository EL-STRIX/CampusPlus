# CampusPlus — REST API Specification & Reference Manual

> **API Version:** `v1`  
> **Base URL (Local):** `http://localhost:5000/api/v1`  
> **Base URL (Production):** `https://api.yourdomain.edu/api/v1`  

---

## 📑 Table of Contents

- [Overview & Standards](#-overview--standards)
- [Authentication & Headers](#-authentication--headers)
- [Standard Response Envelope](#-standard-response-envelope)
- [HTTP Status Codes](#-http-status-codes)
- [Public / Student Endpoints](#-public--student-endpoints)
  - [1. Health Check](#1-health-check)
  - [2. List Campus Locations](#2-list-campus-locations)
  - [3. List Room Equipment](#3-list-room-equipment)
  - [4. Submit Fault Report](#4-submit-fault-report)
  - [5. Public Live Ticker](#5-public-live-ticker)
- [Admin Endpoints](#-admin-endpoints)
  - [6. Admin Login](#6-admin-login)
  - [7. Dashboard Analytics](#7-dashboard-analytics)
  - [8. List Reports (Filterable)](#8-list-reports-filterable)
  - [9. Get Single Report Details](#9-get-single-report-details)
  - [10. Update Report Status](#10-update-report-status)
  - [11. Get Needs Review Queue](#11-get-needs-review-queue)
  - [12. Merge Report](#12-merge-report)
  - [13. Keep Report Separate](#13-keep-report-separate)
  - [14. Change Admin Password](#14-change-admin-password)

---

## 🌐 Overview & Standards

The CampusPlus REST API adheres to strict RESTful design principles:
- JSON payloads for all incoming and outgoing requests (with the exception of `multipart/form-data` for file uploads).
- Consistent snake_case / camelCase conventions.
- Strongly-typed validation using Zod schemas.
- Safe, idempotent `GET`, `PUT`, `DELETE` operations and atomic `POST` / `PATCH` operations.

---

## 🔐 Authentication & Headers

Protected administrative endpoints require an `Authorization` header with a valid JSON Web Token:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 📦 Standard Response Envelope

All API endpoints return responses encapsulated in a unified JSON envelope:

### Successful Response:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Response:
```json
{
  "success": false,
  "data": null,
  "error": "Descriptive error message explaining the failure."
}
```

---

## 🚦 HTTP Status Codes

| Code | Status | Meaning |
|---|---|---|
| `200` | OK | Request succeeded. Data returned in `data`. |
| `201` | Created | Resource successfully created. |
| `400` | Bad Request | Validation failure or malformed payload. |
| `401` | Unauthorized | Missing, invalid, or expired JWT token. |
| `403` | Forbidden | Insufficient permissions for requested resource. |
| `404` | Not Found | Target resource or record does not exist. |
| `409` | Conflict | State conflict or duplicate operational lock. |
| `500` | Internal Server Error | Unhandled server exception (logged via Pino). |

---

## 👥 Public / Student Endpoints

### 1. Health Check
Checks if the backend API service and database connections are operational.

- **Endpoint:** `GET /health`
- **Auth:** Public

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-08-22T17:45:00.000Z",
    "uptimeSeconds": 14520
  },
  "error": null
}
```

---

### 2. List Campus Locations
Retrieves all campus buildings and their associated rooms for the report submission dropdown selectors.

- **Endpoint:** `GET /locations`
- **Auth:** Public

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "bldg_01",
      "name": "Academic Block 1",
      "rooms": [
        { "id": "room_408", "name": "Lab 408", "labType": "Computer / Software Systems Lab" },
        { "id": "room_409", "name": "Lab 409", "labType": "Computer / Software Systems Lab" }
      ]
    }
  ],
  "error": null
}
```

---

### 3. List Room Equipment
Retrieves known equipment asset tags registered in a specific room.

- **Endpoint:** `GET /locations/rooms/:roomId/equipment`
- **Auth:** Public

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    { "id": "eq_01", "deviceType": "CPU / Computer Workstation", "deviceNumber": "BWU/CPU/1852" },
    { "id": "eq_02", "deviceType": "Smart Projector & Screen", "deviceNumber": "BWU/PROJ/014" }
  ],
  "error": null
}
```

---

### 4. Submit Fault Report
Submits a hardware fault report with student details, location, equipment info, and photographic evidence.

- **Endpoint:** `POST /reports`
- **Auth:** Public
- **Content-Type:** `multipart/form-data`

#### Request Fields:
| Field | Type | Required | Description |
|---|---|---|---|
| `studentCode` | string | Yes | Student Roll / ID (e.g. `BWU/BCA/24/330`) |
| `department` | string | Yes | Academic department name |
| `stream` | string | Yes | Degree stream name |
| `yearSemester` | string | Yes | Year / Semester identifier |
| `buildingName` | string | Yes | Selected campus building |
| `roomName` | string | Yes | Selected room / lab name |
| `labType` | string | Yes | Selected laboratory domain |
| `deviceType` | string | Yes | Type of hardware (e.g. `CPU / Computer Workstation`) |
| `deviceNumber` | string | No | Asset barcode / tag (optional if missing) |
| `deviceNumberVisible` | boolean | Yes | `true` if tag is visible; `false` if missing/scratched |
| `notes` | string | Yes | Description of fault / symptoms |
| `photo` | File (binary) | Yes | Photographic evidence (JPEG, PNG, WebP $\le$ 5MB) |

#### Response (`201 Created`):
```json
{
  "success": true,
  "data": {
    "reportId": "rep_9a7b1c3d",
    "isDuplicate": false,
    "status": "open",
    "message": "Report registered successfully."
  },
  "error": null
}
```

---

### 5. Public Live Ticker
Returns recent campus issues and resolutions for public status transparency.

- **Endpoint:** `GET /reports/recent`
- **Auth:** Public

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "rep_01",
      "deviceType": "Ceiling Projector & Screen",
      "buildingName": "Academic Block 1",
      "roomName": "Lab 408",
      "status": "resolved",
      "resolvedAt": "2026-08-22T14:30:00.000Z"
    }
  ],
  "error": null
}
```

---

## 🛡 Admin Endpoints (Authenticated)

### 6. Admin Login
Authenticates administrator credentials and returns an access token.

- **Endpoint:** `POST /auth/login`
- **Auth:** Public

#### Request Body:
```json
{
  "username": "admin",
  "password": "adminpassword123"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "adm_01",
      "username": "admin",
      "role": "admin"
    }
  },
  "error": null
}
```

---

### 7. Dashboard Analytics
Returns metric counts for the admin overview dashboard cards.

- **Endpoint:** `GET /admin/dashboard`
- **Auth:** Bearer Token

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "total": 24,
    "open": 8,
    "inProgress": 5,
    "resolved": 9,
    "rejected": 2,
    "needsReview": 2
  },
  "error": null
}
```

---

### 8. List Reports (Filterable)
Retrieves all hardware reports with optional filtering, sorting, and pagination.

- **Endpoint:** `GET /admin/reports`
- **Auth:** Bearer Token
- **Query Parameters:**
  - `status`: `open` | `in_progress` | `resolved` | `rejected`
  - `building`: Filter by building name
  - `room`: Filter by room name
  - `labType`: Filter by lab domain
  - `search`: Search by asset tag or device type
  - `sortBy`: `priority` | `newest` | `oldest`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "rep_01",
      "deviceType": "CPU / Computer Workstation",
      "deviceNumber": "BWU/CPU/1852",
      "buildingName": "Academic Block 1",
      "roomName": "Lab 408",
      "reportCount": 3,
      "status": "open",
      "createdAt": "2026-08-22T12:00:00.000Z"
    }
  ],
  "error": null
}
```

---

### 9. Get Single Report Details
Retrieves full details of a specific report including student reporter records and chronological status audit timeline.

- **Endpoint:** `GET /admin/reports/:id`
- **Auth:** Bearer Token

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "rep_01",
    "deviceType": "CPU / Computer Workstation",
    "deviceNumber": "BWU/CPU/1852",
    "buildingName": "Academic Block 1",
    "roomName": "Lab 408",
    "labType": "Computer / Software Systems Lab",
    "photoUrl": "/uploads/computer_lab.jpg",
    "status": "in_progress",
    "reportCount": 3,
    "reporters": [
      {
        "studentCode": "BWU/BCA/24/330",
        "department": "Computer Applications (BCA / MCA / B.Sc IT)",
        "notes": "Power supply SMPS sparking when turning on.",
        "reportedAt": "2026-08-22T10:00:00.000Z"
      }
    ],
    "statusHistory": [
      {
        "status": "open",
        "changedAt": "2026-08-22T10:00:00.000Z",
        "changedBy": "adm_01"
      },
      {
        "status": "in_progress",
        "changedAt": "2026-08-22T11:30:00.000Z",
        "changedBy": "adm_01"
      }
    ]
  },
  "error": null
}
```

---

### 10. Update Report Status
Transitions the lifecycle status of a ticket (`open` $\rightarrow$ `in_progress` $\rightarrow$ `resolved` / `rejected`) and logs the audit event.

- **Endpoint:** `PATCH /admin/reports/:id/status`
- **Auth:** Bearer Token

#### Request Body:
```json
{
  "status": "resolved",
  "rejectionReason": null
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "rep_01",
    "status": "resolved",
    "updatedAt": "2026-08-22T15:00:00.000Z"
  },
  "error": null
}
```

---

### 11. Get Needs Review Queue
Returns all untagged/flagged reports alongside suggested candidate matches in the same room.

- **Endpoint:** `GET /admin/reports/needs-review`
- **Auth:** Bearer Token

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "rep_09",
      "deviceType": "CPU / Computer Workstation",
      "deviceNumber": null,
      "buildingName": "Academic Block 1",
      "roomName": "Lab 408",
      "photoUrl": "/uploads/computer_lab.jpg",
      "suggestedMatches": [
        {
          "id": "rep_01",
          "deviceType": "CPU / Computer Workstation",
          "deviceNumber": "BWU/CPU/1852",
          "reportCount": 3,
          "status": "open"
        }
      ]
    }
  ],
  "error": null
}
```

---

### 12. Merge Report
Merges a flagged report into a target master ticket within a database transaction.

- **Endpoint:** `POST /admin/reports/:id/merge`
- **Auth:** Bearer Token

#### Request Body:
```json
{
  "targetReportId": "rep_01"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "masterReportId": "rep_01",
    "mergedReportId": "rep_09",
    "updatedReportCount": 4,
    "message": "Report successfully merged into master ticket."
  },
  "error": null
}
```

---

### 13. Keep Report Separate
Dismisses the `possibleDuplicate` flag on an untagged report, confirming it as a standalone hardware ticket.

- **Endpoint:** `POST /admin/reports/:id/separate`
- **Auth:** Bearer Token

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "reportId": "rep_09",
    "possibleDuplicate": false,
    "message": "Report confirmed as distinct ticket."
  },
  "error": null
}
```

---

### 14. Change Admin Password
Updates the password for the logged-in administrator after verifying the current password.

- **Endpoint:** `PATCH /admin/profile/password`
- **Auth:** Bearer Token

#### Request Body:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "NewStrongPassword456!"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully."
  },
  "error": null
}
```
