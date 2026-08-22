# CampusPlus — UI/UX Design Reference
## For use with Google Stitch

**Purpose of this document:** This is a design-system and page-by-page brief for generating CampusPlus's UI in Google Stitch. It maps the **visual structure, layout, and design language** of the reference site (Heatfix — a Framer HVAC template) onto CampusPlus's actual pages and content, as defined in the CampusPlus PRD v2.

**Reference site:** https://tough-startup-885454.framer.app/
**Important:** Copy the **layout, spacing, box structure, section order, color usage pattern, typography style, and component types** from the reference. Do **NOT** copy the reference site's actual text/content (it's about HVAC repair) — all copy, labels, and imagery must be rewritten for CampusPlus (lab equipment fault reporting).

**Note on exact colors:** This document describes the reference site's color *usage pattern* (where color is applied — CTAs, backgrounds, accents) structurally. For exact hex values, upload a screenshot of the reference site directly into Google Stitch alongside this brief so Stitch can sample the precise palette.

---

## 1. Design System (extracted structure from reference)

### 1.1 Layout Pattern
- **Header:** Fixed/sticky top navbar — logo left, nav links center/right, one strong CTA button on the far right.
- **Hero section:** Full-width background image with dark overlay, large bold headline, short subtext, single primary CTA button.
- **Content sections:** Alternating full-width bands — each section has generous vertical padding (large whitespace between sections), centered max-width content container (~1200px), section eyebrow label (small uppercase text above headings, e.g. "— Who We Are"), then a large heading, then supporting text.
- **Card grids:** 3–4 column card grids on desktop, collapsing to 1 column on mobile. Cards have: icon/image top, bold short title, 1–2 line description.
- **Testimonial/quote cards:** Rounded cards with avatar image, name, role/context, and a short quote — arranged in a horizontal carousel or grid.
- **Process/steps section:** Numbered or icon-led horizontal steps (3–4 steps), each with icon, title, short description.
- **Contact/action section:** Two-column layout — left column has address/email/phone/social info as a list, right column has a compact form (name, email, phone + submit button).
- **Footer:** Multi-column — logo + tagline, nav links repeated, certifications/partner logos row, copyright line.

### 1.2 Component Types to Reuse Structurally
| Reference Component | CampusPlus Equivalent |
|---|---|
| Promo/offer ticker banner (top strip) | Optional: "System status" or "X reports resolved this week" ticker (or omit — not essential) |
| Hero with background image + CTA | Home hero — background could be a stylized lab/campus image + "Report an Issue" CTA |
| "Who We Are" intro block with image | "About CampusPlus" intro block on Home |
| 3–4 step "Booking Process" icons | "How It Works" — Snap Photo → Fill Details → Submit → Admin Resolves |
| Service cards grid (4 cards, icon + title + tag + CTA) | Not directly needed (no services to sell) — can be repurposed as "What You Can Report" device-category cards on Home |
| "Why Choose Us" trust badges (3 items) | "Why CampusPlus" — No login needed / Fast reporting / Real-time priority tracking |
| Benefits 4-card grid | Could map to Admin Dashboard "summary cards" visually (same card pattern, different content: Open / In Progress / Resolved / Needs Review) |
| Testimonials carousel | Not needed for CampusPlus (no customer testimonials) — omit, or repurpose as a small "Trusted by [Department] students" strip if desired |
| Contact form (2-column: info + form) | **This exact layout pattern = the Report an Issue page** (left: instructions/what you'll need, right: the actual report form) |
| Footer with nav + logos | Standard footer — CampusPlus logo, nav links, institution name/credit |

### 1.3 Typography Style
- Large, bold, modern sans-serif headings (heavy weight, tight line-height).
- Small uppercase "eyebrow" labels above section headings for hierarchy.
- Body text: medium gray, comfortable line-height, shorter paragraph blocks (2–3 lines max per block).

### 1.4 Color Usage Pattern (structural, not exact hex)
- **Primary/background:** Light neutral (white/off-white) base for most sections.
- **Accent color:** One strong brand accent used consistently for CTA buttons, icons, and highlighted text/links only — not overused across the page.
- **Dark section:** At least one dark-background section (e.g., the CTA/footer transition band) for visual contrast.
- **Status/badge colors (new for CampusPlus, not in reference):** Since the reference has no status system, introduce a small semantic color set for report statuses:
  - Open = Blue/Gray
  - In Progress = Amber/Orange
  - Resolved = Green
  - Rejected = Red
  - Needs Review = Purple

### 1.5 Imagery Style
- Reference uses warm, real-world photography (technicians, homes, equipment) with soft overlays.
- **CampusPlus equivalent:** Use campus/lab-relevant imagery — students in labs, computer equipment, classroom/lab photography — same warm, professional treatment, not stock-corporate cold imagery.

---

## 2. Page-by-Page Design Brief

### 🎓 STUDENT PORTAL

---

#### Page 1 — Home / Landing Page
**Reference sections to mirror (in order):**
1. Top navbar — Logo | Home (implicit) | "Report an Issue" button (top right, high-contrast)
2. Hero — full-width background image (campus/lab photo), large headline, short subtext, single CTA button
3. "Who We Are" style intro block — image + short paragraph explaining what CampusPlus is
4. "How It Works" — 3-step process cards (icon + title + short text): **1. Spot a broken device → 2. Snap a photo & fill the form → 3. We track it until it's fixed**
5. "What You Can Report" — card grid (reuse the 4-card service-grid layout) showing device categories: Electrical & Cooling (Fan/AC/Light), Computer Hardware (CPU/Monitor/Keyboard/Mouse), Cables & Connectivity (Ethernet/HDMI), AV Equipment (Projector)
6. "Why CampusPlus" — 3 trust-badge style blocks: **No Login Needed**, **Fast & Simple Reporting**, **Transparent Priority Tracking**
7. Dark CTA band — "Found something broken? Report it now." + button (mirrors the reference's "Let's Talk HVAC Solutions" dark section)
8. Footer — Logo, nav links (Home / Report an Issue), simple institution credit line

**Content to change:** All HVAC copy → CampusPlus copy. Replace client quotes/testimonials section entirely (not needed) or repurpose as a small stat strip (e.g., "500+ Reports Resolved," "Avg. Resolution Time: 2 Days") using the same card visual style.

---

#### Page 2 — Report an Issue (Single Page — Strict Requirement)
**Reference section to mirror:** The **Contact/Book Service section** (2-column: info left, form right) — but expanded to full-page since this is the core page, not a footer section.

**Layout:**
- Left column (or top block on mobile): Short instructional text — "Found a broken device? Fill out the form below. It takes less than a minute and you don't need to log in." + a small checklist reminder: "You'll need: a photo of the device, your student code, and the room/device number if visible."
- Right column (or main block): **The entire form, single page, all fields visible in one continuous scroll** (no steps/wizard):
  1. **Device Photo** — upload/camera capture box
  2. **Student Information** — Student Code, Department (dropdown), Stream (dropdown), Year/Semester (optional)
  3. **Location** — Building (dropdown), Room Number (dropdown)
  4. **Device Information** — Device Type (dropdown), Device Number (text field) + "Number not visible" checkbox (unchecking disables/hides the number field)
  5. **Additional Notes** — optional textarea
  6. **Submit button** — large, high-contrast, mirrors the reference's "GET A CALL BACK" button styling

**Design notes:**
- Use clear section dividers/subheadings within the single page (visually grouped, like card sections) so it doesn't feel like one giant wall of fields — mirror the reference's use of whitespace between grouped content blocks.
- Submit button should be sticky/visible or clearly reachable at the bottom.
- Inline validation states (error text under fields) — reference doesn't show this, so use standard clean form-error styling (red text, red border) consistent with the rest of the palette.

---

#### Page 3 — Confirmation / Thank You
Centered success state with instant tracking navigation:
- Success checkmark icon.
- Bold headline: "Report Submitted — Thank You!"
- **Ticket ID block:** Displays the generated UUID with a 1-click "Copy Ticket ID" button.
- Context explanation: If single report, indicates technician intake; if elevated duplicate, shows total reporter count.
- **Minimal 3-Button Navigation Row:**
  1. `Track Status` (Primary with clipboard icon) $\rightarrow$ Direct navigation to `/track?id=<ID>`.
  2. `Report Another` (Outline with plus icon) $\rightarrow$ Returns to `/report`.
  3. `Home` (Ghost with home icon) $\rightarrow$ Returns to `/`.
- Consistent header & footer shell.

---

#### Page 4 — Track Report Status (`/track`, `/track/:id`)
Public zero-login ticket tracking interface:
- **Search Header:** Prominent Ticket ID search bar with clear button and 1-click recent ticket history pills stored in `localStorage`.
- **Top Status Card:**
  - Ticket ID with 1-click copy.
  - 3-stage visual progress stepper: **1. Submitted (Logged)** $\rightarrow$ **2. In Progress (Technician Assigned)** $\rightarrow$ **3. Resolved (Repaired & Tested)**.
  - Rejection / Closure callout if status is rejected with admin reasoning.
  - Multi-report priority boost notice if `reportCount > 1`.
- **Main Details Grid:**
  - Left column: Equipment & Location details card (Equipment type, asset tag, building, room, lab specialization) and Maintenance Activity Audit Log (chronological timestamped status changes).
  - Right column: Submitted photo evidence card with hover zoom and click-to-enlarge lightbox modal.

---

#### Page 5 — 404 / Not Found
- Simple centered layout: large "404" or icon, short message ("Page not found"), button back to Home.
- Reuse header/footer shell.

---

### 🔐 ADMIN PANEL

---

#### Page 5 — Login
**Reference has no login page** — design fresh but consistent with the same brand system:
- Centered card on a subtle branded background (can reuse the hero background treatment, dimmed/blurred).
- Logo top, "Admin Login" heading, Username field, Password field, Login button (same button style as student site's CTA).
- Small footer note: "CampusPlus Admin Panel."

---

#### Page 6 — Dashboard (Overview)
**Reference sections to mirror:**
- **Benefits 4-card grid layout** → repurpose as **Summary Cards row**: Total Open, In Progress, Resolved, Needs Review — same card visual style (icon + number + label).
- Below: a simplified reports table/list (top priority reports), reusing the clean card/list spacing style from the reference's testimonial or service list sections.
- **Sidebar navigation** (new, not in reference — reference is single-page marketing site): Dashboard | All Reports | Needs Review | Profile | Logout — styled consistently with the reference's typography/color system.

---

#### Page 7 — All Reports
- Full-width data table: columns for Photo thumbnail, Device Type, Room, Priority (report_count), Status (color-coded badge), Date.
- Filter bar above table: Status, Building, Department, Device Type, Date Range dropdowns — styled like the reference's clean dropdown/form-field aesthetic.
- Search bar (Student Code / Device Number).
- Pagination at bottom.

---

#### Page 8 — Report Detail
**Reference section to mirror:** The reference's "About" intro block (image + text side-by-side) as the base layout pattern for the top of this page.
- Top block: Device photo (left), device info + status dropdown + "Update Status" button (right).
- Below: **Reporters list** — reuse the testimonial-card grid style (avatar-less version): each card = student code, department, timestamp, individual note.
- Below: **Status History timeline** — simple vertical timeline list (status, timestamp, admin name).

---

#### Page 9 — Needs Review (Duplicate Merge Queue)
- Same table/list style as "All Reports" page, filtered to `possible_duplicate = true`.
- Each row expandable or linking to a **side-by-side compare view** (two report cards next to each other, using the same card component as Report Detail's top block) with "Merge" and "Keep Separate" buttons.

---

#### Page 10 — Admin Profile / Change Password
- Simple centered form card, consistent with Login page styling: current password, new password, confirm new password, Save button.

---

#### Page 11 — 404 / Not Found (Admin)
- Same treatment as student-side 404, but within the admin shell (sidebar present or simplified centered state).

---

## 3. Content Replacement Rules (Critical)

| Reference Content Type | Rule |
|---|---|
| HVAC service names/descriptions | Replace entirely with CampusPlus device categories and report-related copy |
| Client testimonials (HVAC customers) | Remove or replace with resolution stats |
| "Heatfix" / "Climafix" branding | Replace with "CampusPlus" branding throughout |
| Phone/email/office address | Replace with your institution's actual (or placeholder) contact info |
| Booking/service CTAs ("Book Now," "Get a Call Back") | Replace with reporting CTAs ("Report an Issue," "Submit Report") |
| Layout, spacing, section order, card structures, button styles, color usage pattern | **Keep as-is** — this is what we're copying |

---

## 4. Summary Table — All 11 Pages

| # | App | Page | Reference Section Mapped |
|---|---|---|---|
| 1 | Student | Home | Full homepage structure |
| 2 | Student | Report an Issue | Contact/Book Service 2-col layout |
| 3 | Student | Confirmation | New (no direct reference) |
| 4 | Student | 404 | New (no direct reference) |
| 5 | Admin | Login | New (no direct reference) |
| 6 | Admin | Dashboard | Benefits card grid + list sections |
| 7 | Admin | All Reports | Table/list pattern (new) |
| 8 | Admin | Report Detail | About intro block + testimonial cards |
| 9 | Admin | Needs Review | Table/list + card compare pattern |
| 10 | Admin | Admin Profile | New (styled like Login) |
| 11 | Admin | 404 | New (no direct reference) |
