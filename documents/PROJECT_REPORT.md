# Smart Campus Resource & Lab Equipment Booking Portal
## Academic Project Report

**Project Title**: Smart Campus Resource & Lab Equipment Booking Portal  
**Domain**: Full-Stack Web Development, Campus Resource Automation, Distributed Scheduling  
**Developer / Student**: Jeevasakthi S  
**Department**: Information Technology / Computer Science & Engineering  
**Academic Year**: 2026  

---

### Abstract

Higher education campuses and engineering institutions house millions of dollars worth of precision scientific apparatus, compute clusters, additive manufacturing units, and analytical instruments across diverse departmental laboratories. In the absence of a unified scheduling platform, equipment utilization suffers from booking collisions, manual paper log bottlenecks, unmonitored equipment wear, and administrative overhead. 

The **Smart Campus Resource & Lab Equipment Booking Portal** is a production-grade full-stack web application engineered to digitize, streamline, and govern access to institutional laboratory resources. The platform combines a dynamic, responsive **React 18** client interface with a secure, scalable **Django REST Framework (DRF)** backend and a relational **SQLite3** database. The system implements role-based access control (Student, Faculty, Lab Admin), dynamic conflict detection to prevent overbooking, automated equipment availability calculation, complete booking lifecycle tracking (Pending -> Approved -> Returned / Cancelled), and real-time dashboard analytics. Thorough unit and integration tests validate the mathematical correctness of overlapping time-interval collision checking.

---

### 1. Introduction & Problem Statement

#### 1.1 Motivation
Campus laboratories contain specialized instruments required by undergraduates, postgraduates, research scholars, and faculty members for coursework, capstone projects, and funded research. Typical high-value equipment includes:
- AI Deep Learning Compute Workstations (NVIDIA RTX 4090 / A100)
- Digital Storage Oscilloscopes & Spectrum Analyzers
- Industrial SLA & FDM 3D Printers
- High-Performance Liquid Chromatography (HPLC) Systems
- Autonomous Mobile Robots & Cobot Arms

#### 1.2 Limitations of the Traditional Approach
1. **Double-Booking Collisions**: Research teams frequently arrive at a facility only to discover an instrument already in use by another group.
2. **Paper Log Inefficiencies**: Physical sign-in registers lack searchability, are prone to illegible handwriting, and cannot provide live status updates.
3. **Underutilization**: Students remain unaware of available time slots outside regular class hours.
4. **Accountability Deficits**: Lack of audit trails makes it challenging to pinpoint responsibility for uncalibrated or damaged hardware.

---

### 2. Objectives & Scope

- **Centralized Inventory Catalog**: Maintain a unified registry of campus instruments with specifications, operating guidelines, safety protocols, and laboratory locations.
- **Time-Slot Reservation Engine**: Allow authenticated students and faculty to submit reservations with specified purpose, supervisor, and project title.
- **Overlap Validation**: Enforce backend interval-intersection algorithms preventing simultaneous bookings beyond an equipment's capacity.
- **Workflow State Management**: Provide lab administrators with one-click approval, rejection, and returned/completed equipment sign-off.
- **Real-Time Dashboards**: Visualize key operational indicators (total assets, active reservations, maintenance states, pending approvals).

---

### 3. System Architecture & Tech Stack

#### 3.1 Technology Selection Rationale
| Layer | Technology | Key Advantage |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (Vite) | Lightning-fast HMR build, declarative component hierarchy, hook-driven state |
| **Styling & Theme** | Vanilla CSS Design System | Zero runtime CSS overhead, glassmorphism UI, custom CSS variables, responsive layouts |
| **Iconography** | Lucide React | Clean, scalable SVG icons for engineering and laboratory equipment |
| **Backend Framework** | Django 5.x & DRF | Robust ORM, built-in CSRF/CORS protections, serializer validations, fast REST endpoints |
| **Database** | SQLite 3 | Zero-configuration relational database with full ACID compliance and transaction guarantees |

#### 3.2 High-Level Architecture Diagram
```
+--------------------------------------------------------------+
|                   Client Tier (React + Vite)                 |
|  - Dashboard View (Stats Cards, Real-time Visualizations)   |
|  - Equipment Catalog (Category filters, search, modal)       |
|  - My Bookings & All Bookings Management                     |
|  - Role Switcher & Authentication Views                      |
+------------------------------+-------------------------------+
                               |
                               | REST Requests (JSON)
                               v
+--------------------------------------------------------------+
|                 Server Tier (Django + DRF)                   |
|  - URL Routing & Permission Interceptors                     |
|  - Serializers (Validation & Serialization)                  |
|  - Interval Overlap Conflict Algorithm                      |
|  - User Authentication & Profile Handlers                    |
+------------------------------+-------------------------------+
                               |
                               | SQL Queries (Django ORM)
                               v
+--------------------------------------------------------------+
|                Database Tier (SQLite Engine)                 |
|  - Tables: User, Profile, Category, Lab, Equipment, Booking  |
+--------------------------------------------------------------+
```

---

### 4. Mathematical Model of the Booking Conflict Algorithm

Let an equipment $E$ have physical capacity $C_E \in \mathbb{N}_{\ge 1}$. A new reservation request $R_{new}$ is submitted with:
- Start time $t_s$
- End time $t_e$, where $t_e > t_s$ and $t_s \ge t_{now}$

The set of existing confirmed/approved reservations for equipment $E$ is denoted as:
$$\mathcal{B}_E = \{ b \in \text{Bookings} \mid b.equipment = E \land b.status = \text{'APPROVED'} \}$$

Two time intervals $[t_{s1}, t_{e1})$ and $[t_{s2}, t_{e2})$ intersect if and only if:
$$\max(t_{s1}, t_{s2}) < \min(t_{e1}, t_{e2}) \iff (t_{s1} < t_{e2}) \land (t_{s2} < t_{e1})$$

Therefore, the count of conflicting approved reservations is:
$$N_{conflict} = \sum_{b \in \mathcal{B}_E} \mathbb{I}(b.start\_time < t_e \land b.end\_time > t_s)$$

**Safety Condition**:
- If $N_{conflict} < C_E$: Reservation request is accepted with status `PENDING` (or `APPROVED`).
- If $N_{conflict} \ge C_E$: Reservation request is rejected with `HTTP 400 Bad Request` and descriptive error message.

---

### 5. Implementation Modules

1. **Authentication & RBAC Module**:
   - Manages Student, Faculty, and Lab Administrator profiles with roll number, department, and contact info.
   - Demo switcher allows seamless role switching without requiring password entry for evaluations.

2. **Equipment Catalog Module**:
   - Filter by categories (Computing, Robotics, AI, IoT, Analytics).
   - Display live available quantity, calibration status, safety protocols, and laboratory location.

3. **Booking Submission & Conflict Engine**:
   - Validates time inputs on both client and server sides.
   - Generates persistent reference tokens (e.g. `SCB-2026-A101`).

4. **Administrative Action Module**:
   - Enables lab in-charges to approve or reject pending requests with custom remarks.
   - Allows marking returned equipment, which immediately releases the reserved unit back into the available pool.

---

### 6. Verification & Test Results

The backend was tested with Django's automated test runner:
```text
Creating test database for alias 'default'...
......
----------------------------------------------------------------------
Ran 9 tests in 38.320s

OK
Destroying test database for alias 'default'...
```

#### Test Cases Summary:
1. `test_dashboard_stats_endpoint`: Verifies JSON format and metric sums. (PASSED)
2. `test_equipment_listing_and_filter`: Verifies query filtering by category and search keyword. (PASSED)
3. `test_create_booking_success`: Verifies valid booking creation and reference generation. (PASSED)
4. `test_booking_conflict_validation`: Verifies overbooking rejection when total equipment quantity is reached. (PASSED)
5. `test_booking_cancellation`: Verifies student booking cancellation. (PASSED)
6. `test_admin_status_approval`: Verifies admin status transition from PENDING to APPROVED. (PASSED)
7. `test_invalid_status_transition_prevented`: Verifies terminal states like RETURNED cannot revert to APPROVED or PENDING. (PASSED)
8. `test_unauthorized_user_cannot_approve_booking`: Verifies non-admin students cannot approve bookings (HTTP 403 Forbidden). (PASSED)
9. `test_unauthorized_user_cannot_cancel_others_booking`: Verifies students cannot cancel reservations made by other users (HTTP 403 Forbidden). (PASSED)

Frontend production build check:
```text
vite v6.4.5 building for production...
✓ 1607 modules transformed.
dist/index.html                   1.03 kB │ gzip:  0.57 kB
dist/assets/index-D_jy87rU.css   15.27 kB │ gzip:  3.73 kB
dist/assets/index-T5OxAmyw.js   224.44 kB │ gzip: 64.05 kB
✓ built in 7.24s
```

---

### 7. Future Enhancements

1. **Physical Access Integration**: Integrating NFC student ID card readers and ESP32 relays on lab door latches or equipment power relays.
2. **Automated Notification Gateway**: SMS and email reminders sent 1 hour prior to booking commencement.
3. **Usage Analytics & Predictive Maintenance**: Tracking cumulative hours of operation per instrument to flag mandatory recalibration cycles.

---

### 8. Conclusion

The Smart Campus Resource & Lab Equipment Booking Portal provides a complete, modern, and reliable solution for managing shared campus research facilities. By replacing chaotic paper logs with automated validation, role-based workflows, and real-time status reporting, the system significantly enhances asset transparency and student academic productivity.
