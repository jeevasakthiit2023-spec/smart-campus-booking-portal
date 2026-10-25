# Smart Campus Resource & Lab Equipment Booking Portal
## Database Schema & Entity Relationship Specification

---

### 1. Database Overview

- **Database Engine**: SQLite 3 (`db.sqlite3`)
- **ORM**: Django ORM (Object-Relational Mapping)
- **Character Encoding**: UTF-8
- **Concurrency & Locking**: WAL (Write-Ahead Logging) compatible, ACID transactions for booking reservations and conflict validation
- **Timezone**: Coordinated Universal Time (UTC) stored with ISO 8601 formatting

---

### 2. Entity-Relationship Diagram (ERD)

```
       +-------------------------+
       |       auth_user         |
       +-------------------------+
       | PK  id                  |
       |     username            |
       |     email               |
       |     password            |
       |     first_name          |
       |     last_name           |
       |     is_staff            |
       +------------+------------+
                    | 1:1
                    v
       +-------------------------+
       |   bookings_userprofile  |
       +-------------------------+
       | PK  id                  |
       | FK  user_id             |-----> auth_user.id
       |     role                |       ('STUDENT', 'FACULTY', 'LAB_ADMIN')
       |     roll_number         |
       |     department          |
       |     phone               |
       +-------------------------+
                    |
                    | 1:N (A user creates multiple bookings)
                    v
       +-------------------------+            +--------------------------+
       |    bookings_booking     |            |    bookings_category     |
       +-------------------------+            +--------------------------+
       | PK  id                  |            | PK  id                   |
       |     booking_ref         |            |     name (UNIQUE)        |
       | FK  user_id             |            |     slug (UNIQUE)        |
       | FK  equipment_id        |------+     |     icon                 |
       |     start_time          |      |     |     description          |
       |     end_time            |      |     +------------+-------------+
       |     purpose             |      |                  | 1:N
       |     project_title       |      |                  v
       |     supervisor_name     |      |     +--------------------------+
       |     department          |      +---->|   bookings_equipment     |
       |     roll_number         |      |     +--------------------------+
       |     status              |      |     | PK  id                   |
       |     admin_remarks       |      |     |     name                 |
       |     created_at          |      |     |     asset_id (UNIQUE)    |
       |     updated_at          |      |     | FK  category_id          |
       +-------------------------+      |     | FK  lab_id               |
                                        |     |     model_number         |
       +-------------------------+      |     |     manufacturer         |
       |      bookings_lab       |      |     |     description          |
       +-------------------------+      |     |     specifications       |
       | PK  id                  |      |     |     condition            |
       |     name                |      |     |     total_quantity       |
       |     code (UNIQUE)       |      |     |     available_quantity   |
       |     department          |      |     |     hourly_guidelines    |
       |     building            |      |     |     safety_protocol      |
       |     room_number         |      |     |     image_url            |
       |     in_charge_name      |      |     |     is_active            |
       |     in_charge_email     |      |     |     created_at           |
       +------------+------------+      |     |     updated_at           |
                    | 1:N               |     +--------------------------+
                    +-------------------+
```

---

### 3. Detailed Table Definitions

#### 3.1. `bookings_userprofile`
Extends Django's standard `auth_user` table to store institutional roles and academic metadata.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTOINCREMENT | Profile record identifier |
| `user_id` | INT | FOREIGN KEY (`auth_user.id`), UNIQUE, ON DELETE CASCADE | Associated core user record |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'STUDENT' | Role: `STUDENT`, `FACULTY`, `LAB_ADMIN` |
| `roll_number`| VARCHAR(50) | NULLABLE | Institutional Student Roll No. or Staff ID |
| `department` | VARCHAR(100)| NOT NULL, DEFAULT 'Computer Science & Engineering' | Academic department |
| `phone` | VARCHAR(20) | NULLABLE | Contact telephone number |

#### 3.2. `bookings_category`
Represents equipment classifications (e.g., Computing, RF & Electronics, Robotics).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTOINCREMENT | Category record identifier |
| `name` | VARCHAR(100)| UNIQUE, NOT NULL | Category display name |
| `slug` | VARCHAR(100)| UNIQUE, NOT NULL | URL-friendly slug identifier |
| `icon` | VARCHAR(50) | NOT NULL, DEFAULT 'Cpu' | Lucide-React icon identifier |
| `description`| TEXT | NULLABLE | Category scope and overview |

#### 3.3. `bookings_lab`
Represents physical campus facilities where resources and lab instruments are hosted.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTOINCREMENT | Laboratory record identifier |
| `name` | VARCHAR(150)| NOT NULL | Laboratory facility name |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Official campus facility code (e.g., `LAB-IT-301`) |
| `department` | VARCHAR(100)| NOT NULL | Governing academic department |
| `building` | VARCHAR(100)| NOT NULL, DEFAULT 'Engineering Block' | Campus building / complex |
| `room_number`| VARCHAR(50) | NOT NULL, DEFAULT 'Room 201' | Specific laboratory room number |
| `in_charge_name`| VARCHAR(100)| NOT NULL | Faculty/Technician In-Charge |
| `in_charge_email`| VARCHAR(254)| NULLABLE | Contact email of lab in-charge |

#### 3.4. `bookings_equipment`
Stores high-value lab hardware, instruments, and workstation assets available for reservation.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTOINCREMENT | Equipment asset record identifier |
| `name` | VARCHAR(200)| NOT NULL | Instrument/workstation name |
| `asset_id` | VARCHAR(50) | UNIQUE, NOT NULL | Unique institutional inventory barcode/asset tag |
| `category_id`| BIGINT | FOREIGN KEY (`bookings_category.id`), ON DELETE CASCADE | Associated category |
| `lab_id` | BIGINT | FOREIGN KEY (`bookings_lab.id`), ON DELETE CASCADE | Physical laboratory location |
| `model_number`| VARCHAR(100)| NULLABLE | Manufacturer hardware model number |
| `manufacturer`| VARCHAR(100)| NULLABLE | Brand or manufacturer company name |
| `description`| TEXT | NOT NULL | Detailed equipment functionality summary |
| `specifications`| TEXT | NULLABLE | Technical specifications, ratings, and tolerances |
| `condition` | VARCHAR(30) | NOT NULL, DEFAULT 'OPERATIONAL' | `OPERATIONAL`, `MAINTENANCE`, `RESERVED_TRAINING` |
| `total_quantity`| INT UNSIGNED | NOT NULL, DEFAULT 1 | Total physical units installed in lab |
| `available_quantity`| INT UNSIGNED | NOT NULL, DEFAULT 1 | Current real-time available units |
| `hourly_guidelines`| TEXT | NULLABLE | Post-use guidelines & sanitization instructions |
| `safety_protocol`| TEXT | NULLABLE | Mandatory PPE & safety measures |
| `image_url` | VARCHAR(500)| NULLABLE | Web asset image URL |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT 1 | Active catalog visibility toggle |
| `created_at` | DATETIME | NOT NULL | Timestamp of record creation |
| `updated_at` | DATETIME | NOT NULL | Timestamp of latest record modification |

#### 3.5. `bookings_booking`
Core reservation record tracking user requests, reservation time slots, status lifecycle, and approvals.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTOINCREMENT | Booking record identifier |
| `booking_ref`| VARCHAR(30) | UNIQUE, NOT NULL | Human-readable tracking reference (e.g., `SCB-2026-A101`) |
| `user_id` | INT | FOREIGN KEY (`auth_user.id`), ON DELETE CASCADE | Requesting student/faculty user |
| `equipment_id`| BIGINT | FOREIGN KEY (`bookings_equipment.id`), ON DELETE CASCADE | Reserved laboratory asset |
| `start_time` | DATETIME | NOT NULL | Reservation start date and time |
| `end_time` | DATETIME | NOT NULL | Reservation end date and time |
| `purpose` | TEXT | NOT NULL | Academic/research rationale for booking |
| `project_title`| VARCHAR(200)| NULLABLE | Associated student/research project title |
| `supervisor_name`| VARCHAR(100)| NULLABLE | Guiding professor or lab instructor name |
| `department` | VARCHAR(100)| NULLABLE | Department of requesting user |
| `roll_number`| VARCHAR(50) | NULLABLE | Student roll number or faculty ID |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `RETURNED` |
| `admin_remarks`| TEXT | NULLABLE | Approval/rejection or cancellation notes |
| `created_at` | DATETIME | NOT NULL | Submission timestamp |
| `updated_at` | DATETIME | NOT NULL | Latest state change timestamp |

---

### 4. Integrity Constraints & Conflict Validation Logic

1. **Start Time vs End Time Validation**:
   - `end_time > start_time` is strictly enforced.
   - Reservations cannot be scheduled in the past (`start_time >= now - buffer`).
2. **Double-Booking & Quantity Overlap Prevention**:
   - For an equipment $E$ with total capacity $Q_{total}$, overlapping approved reservations satisfy:
     $$\text{Overlapping} = \{ B \in \text{Bookings} \mid B.equipment = E \land B.status = \text{'APPROVED'} \land B.start\_time < \text{RequestedEnd} \land B.end\_time > \text{RequestedStart} \}$$
   - If $|\text{Overlapping}| \ge Q_{total}$, the booking request is blocked and returns an HTTP 400 error.
3. **Cascade Rules**:
   - Deleting a category or lab cascades cleanly to equipment and corresponding booking logs.
   - Deleting a user cascade-removes their profile and bookings while maintaining database integrity.
