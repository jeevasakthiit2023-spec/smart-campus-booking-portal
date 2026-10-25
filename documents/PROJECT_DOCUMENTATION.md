# Smart Campus Resource & Lab Equipment Booking Portal
## Comprehensive Project Documentation

---

### 1. Executive Summary

In higher education institutions and polytechnics, laboratories house high-value, specialized equipmentâ€”such as digital storage oscilloscopes, real-time spectrum analyzers, AI supercomputing clusters, industrial 3D printers, collaborative robotic arms, and high-performance liquid chromatography (HPLC) instruments. 

Traditionally, booking and sharing these resources has relied on physical logbooks, fragmented emails, or verbal permissions. This approach suffers from:
- **Scheduling Conflicts & Double Bookings**: Multiple research groups showing up at the same hour.
- **Under-utilization of Expensive Assets**: Students and researchers unaware of available equipment or open time windows.
- **Lack of Traceability & Accountability**: Inability to identify who operated an instrument prior to calibration drift or damage.
- **Manual Administrative Burden**: Lab technicians and faculty spend excessive hours manually verifying requests.

The **Smart Campus Resource & Lab Equipment Booking Portal** solves these challenges by providing a centralized, full-stack digital management platform. Powered by **React.js** on the frontend, **Django REST Framework (DRF)** on the backend, and **SQLite3**, the system features role-based access, conflict detection, real-time availability metrics, student self-service booking, and faculty/admin workflow approvals.

---

### 2. System Architecture

The application adopts a decoupled Client-Server architecture:

```
+-----------------------------------------------------------+
|                   Client Tier (Frontend)                  |
|    React 18 (Vite) + Lucide Icons + Custom CSS Tokens     |
|   - Dashboard (Real-time Metrics & Activity Stream)       |
|   - Catalog (Multi-criteria Search & Category Filtering)  |
|   - Booking Engine (Live Conflict & Duration Validation)  |
|   - Student & Admin Reservation Management Tables         |
+-----------------------------+-----------------------------+
                              |
                              | HTTP / JSON REST API
                              | (CORS Enabled)
                              v
+-----------------------------------------------------------+
|                   Server Tier (Backend)                   |
|              Django 5.x + Django REST Framework           |
|   - /api/dashboard/stats/   -> Metric Aggregation Engine  |
|   - /api/equipment/         -> Resource Catalog & State   |
|   - /api/bookings/          -> Conflict Validation Engine |
|   - /api/auth/              -> Role-Based Authentication  |
+-----------------------------+-----------------------------+
                              |
                              | ORM Engine (ACID Compliant)
                              v
+-----------------------------------------------------------+
|                   Database Tier (Storage)                 |
|              SQLite 3 Relational Database Engine           |
|   - Categories, Labs, Equipment, Bookings, User Profiles  |
+-----------------------------------------------------------+
```

---

### 3. Core Modules & Functionality

#### 3.1. Dashboard Module
- **Aggregated Real-Time KPI Cards**:
  - Total Equipment registered and total physical units.
  - Available units right now (excluding currently approved ongoing slots and maintenance items).
  - Active bookings currently utilizing lab assets.
  - Pending approval requests awaiting faculty review.
- **Research Domain Filters**: Quick navigation by Department/Category (Electronics & IoT, AI & HPC, Robotics, 3D Printing, Biotech).
- **Recent Lab Activity Stream**: Chronological audit feed of reservations and status transitions.

#### 3.2. Equipment Catalog & Search Module
- **Multi-parameter Filtering**:
  - Free-text search by instrument name, asset tag, specifications, or department.
  - Category filter chips.
  - Specialized lab room filter dropdown.
  - Operational condition filter (`OPERATIONAL` vs. `MAINTENANCE`).
  - "Available Now" toggle filter.
- **Detailed Specifications Modal**:
  - Full manufacturer specifications, model number, and unique asset ID.
  - Laboratory location, building, and in-charge faculty contact.
  - Operating guidelines and mandatory safety protocols (e.g. ESD protection, laser safety).
  - Live upcoming booked slots visibility.

#### 3.3. Booking & Conflict Validation Module
- **Self-Service Student Reservations**:
  - Start time and end time scheduling with HTML5 datetime-local pickers.
  - Dynamic duration estimation (hours/minutes).
  - Academic project title, purpose, faculty supervisor, student roll number, and department.
- **Validation Rules**:
  - End time must strictly follow start time.
  - Start time cannot be in the past (with a 15-minute clock-skew grace period).
  - Overlap Conflict Prevention: Prevents booking if the number of concurrent approved bookings during that window equals or exceeds the equipment's total quantity.

#### 3.4. Reservation Management & Life-Cycle
- **Statuses Supported**:
  1. `PENDING`: Newly submitted, awaiting approval.
  2. `APPROVED`: Verified by Lab In-Charge; slot reserved.
  3. `REJECTED`: Declined by administrator with feedback remarks.
  4. `CANCELLED`: Voluntarily cancelled by student before or during slot.
  5. `RETURNED`: Equipment returned after slot completion, verified operational.
- **Student Cancellation**: Students can cancel their own bookings with an optional reason note.
- **Admin Decision Modal**: Faculty and lab technicians can approve, reject, or return items, attaching remarks or assigning specific lab benches.

#### 3.5. Role-Based Access & Authentication
- **Roles Supported**:
  - `STUDENT`: Can search equipment, view availability, submit booking requests, and cancel own bookings.
  - `FACULTY`: Can book priority slots, monitor department student bookings, and supervise research allocations.
  - `LAB_ADMIN`: Has administrative control to approve/reject bookings, mark equipment for maintenance, and log equipment returns.
- **Quick Demo Switcher**: One-click switching in navigation for instant presentation testing without password re-entry.

---

### 4. Technical Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | React.js | 18.3.1 | Reactive component architecture, hooks (`useState`, `useEffect`) |
| Build Tool | Vite | 6.x | Fast HMR dev server & optimized bundle building |
| Icons | Lucide React | 0.475.0 | Clean, modern feather-based iconography |
| Styling | Vanilla CSS3 | CSS Custom Properties | Custom glassmorphism, responsive grid, zero external CSS bloat |
| Backend Framework | Django | 5.2.x | High-level Python web framework with robust ORM and security |
| API Framework | Django REST Framework | 3.18.x | RESTful JSON endpoints, serialization, validation |
| CORS Middleware | django-cors-headers | 4.9.x | Cross-Origin Resource Sharing handling for React frontend |
| Database | SQLite 3 | Built-in | Zero-configuration ACID-compliant relational storage |
| Language | Python | 3.11+ | Backend logic, seed fixtures, and test suite |

---

### 5. Verification & Testing

The backend includes a comprehensive automated test suite in `bookings/tests.py`:
1. `test_dashboard_stats_endpoint`: Validates real-time metric aggregation across equipment, units, and active bookings.
2. `test_equipment_listing_and_filter`: Verifies query filtering by category, search keyword, and condition.
3. `test_create_booking_success`: Validates booking creation and unique `SCB-YYYY-XXXXXX` reference generation.
4. `test_booking_conflict_validation`: Asserts that overlapping bookings beyond equipment quantity are blocked with HTTP 400.
5. `test_booking_cancellation`: Verifies reservation cancellation workflow and availability recalculation.
6. `test_admin_status_approval`: Validates administrator approval and equipment quantity updates.
7. `test_invalid_status_transition_prevented`: Verifies that terminal states (`RETURNED`, `CANCELLED`, `REJECTED`) cannot be invalidly reverted (HTTP 400).
8. `test_unauthorized_user_cannot_approve_booking`: Guarantees students cannot approve or modify booking statuses (HTTP 403 Forbidden).
9. `test_unauthorized_user_cannot_cancel_others_booking`: Guarantees that users cannot cancel another user's reservation (HTTP 403 Forbidden).

All 9 test cases execute successfully with a 100% pass rate:
```bash
python manage.py test bookings
```
