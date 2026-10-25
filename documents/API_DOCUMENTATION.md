# Smart Campus Resource & Lab Equipment Booking Portal
## REST API Documentation & Specification

All API endpoints are prefixed with `/api/`. Requests and responses default to `application/json; charset=utf-8`.

---

### 1. Dashboard Metrics

#### `GET /api/dashboard/stats/`
Retrieves aggregated platform metrics for the main overview dashboard.

- **Permissions**: Public (`AllowAny`)
- **Query Parameters**: None
- **Response `200 OK`**:
```json
{
  "total_equipment": 8,
  "total_units": 15,
  "available_units": 12,
  "active_bookings": 3,
  "pending_requests": 2,
  "completed_bookings": 5,
  "categories": [
    {
      "id": 1,
      "name": "Electronics & IoT",
      "slug": "electronics-iot",
      "icon": "Cpu",
      "equip_count": 3
    }
  ],
  "recent_bookings": [
    {
      "id": 1,
      "booking_ref": "SCB-2026-A101",
      "equipment_name": "Keysight 4-Channel Digital Storage Oscilloscope (1 GHz)",
      "user_name": "Jeevasakthi S",
      "lab_name": "Advanced Embedded Systems & IoT Lab",
      "start_time": "2026-10-26 11:00:00",
      "end_time": "2026-10-26 14:00:00",
      "status": "APPROVED"
    }
  ],
  "system_timestamp": "2026-10-25T18:30:00Z"
}
```

---

### 2. Equipment & Resources

#### `GET /api/equipment/`
Lists all active lab instruments with search and filtering capabilities.

- **Query Parameters**:
  - `search` *(string, optional)*: Free-text search matching name, asset ID, description, lab, or category.
  - `category` *(string, optional)*: Category slug (e.g., `electronics-iot`, `ai-hpc`, or `all`).
  - `lab` *(integer, optional)*: Lab ID filter.
  - `condition` *(string, optional)*: `OPERATIONAL` or `MAINTENANCE`.
  - `available_only` *(boolean, optional)*: `true` to return only operational equipment with available units > 0.
- **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "name": "Keysight 4-Channel Digital Storage Oscilloscope (1 GHz)",
    "asset_id": "EQP-OSC-0101",
    "category": 1,
    "category_name": "Electronics & IoT",
    "category_slug": "electronics-iot",
    "lab": 1,
    "lab_name": "Advanced Embedded Systems & IoT Lab",
    "lab_location": "Room 302",
    "model_number": "InfiniiVision DSOX3014T",
    "manufacturer": "Keysight Technologies",
    "description": "1 GHz bandwidth, 4 analog channels...",
    "specifications": "1 GHz Bandwidth | 5 GSa/s | 4 Channels",
    "condition": "OPERATIONAL",
    "total_quantity": 3,
    "available_quantity": 3,
    "hourly_guidelines": "Maximum booking 4 hours per slot...",
    "safety_protocol": "Anti-static wrist strap mandatory...",
    "image_url": "https://images.unsplash.com/...",
    "is_active": true,
    "active_reservations_count": 0,
    "created_at": "2026-10-25 18:35:00"
  }
]
```

#### `GET /api/equipment/{id}/`
Returns full details for a specific equipment item along with upcoming approved reservation schedules.

- **Response `200 OK`**: Contains equipment fields plus `upcoming_schedule`:
```json
{
  "id": 1,
  "name": "Keysight 4-Channel Digital Storage Oscilloscope (1 GHz)",
  "upcoming_schedule": [
    {
      "booking_ref": "SCB-2026-A101",
      "start_time": "2026-10-26T11:00:00Z",
      "end_time": "2026-10-26T14:00:00Z",
      "purpose": "FPGA Signal Integrity Analysis"
    }
  ]
}
```

---

### 3. Categories & Labs

#### `GET /api/categories/`
Returns all academic equipment categories and the count of active items in each.

#### `GET /api/labs/`
Returns all registered campus laboratories, building locations, room numbers, and faculty in-charge.

---

### 4. Bookings & Reservations

#### `GET /api/bookings/`
Lists reservation records with optional filtering.

- **Query Parameters**:
  - `user_id` *(integer, optional)*: Filter bookings belonging to a specific student/faculty ID.
  - `my` *(boolean, optional)*: If `true`, returns current logged-in user's bookings.
  - `status` *(string, optional)*: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, or `RETURNED`.
  - `equipment_id` *(integer, optional)*: Filter bookings for a single piece of equipment.
- **Response `200 OK`**: Array of booking objects.

#### `POST /api/bookings/`
Submits a new reservation request for an equipment item.

- **Request Body**:
```json
{
  "equipment": 1,
  "start_time": "2026-10-26T09:00:00Z",
  "end_time": "2026-10-26T12:00:00Z",
  "purpose": "Hardware testing for IoT Sensor gateway project",
  "project_title": "Smart Campus Energy Monitor",
  "supervisor_name": "Prof. Sundaramoorthy V",
  "department": "Information Technology",
  "roll_number": "2023-IT-042",
  "user_id": 3
}
```
- **Validation Rules**:
  - `end_time` must be after `start_time` (returns `400 Bad Request`).
  - `start_time` cannot be in the past (returns `400 Bad Request`).
  - Overlap check: If concurrent approved bookings during that interval equal or exceed `total_quantity`, returns:
    ```json
    {
      "non_field_errors": [
        "All 3 unit(s) of 'Keysight 4-Channel Digital Storage Oscilloscope (1 GHz)' are already fully booked during this time window. Please choose another time slot."
      ]
    }
    ```
- **Response `201 Created`**:
```json
{
  "message": "Booking request submitted successfully! Reference generated.",
  "booking": {
    "id": 14,
    "booking_ref": "SCB-2026-E42A8F",
    "equipment_name": "Keysight 4-Channel Digital Storage Oscilloscope (1 GHz)",
    "status": "PENDING"
  }
}
```

#### `POST /api/bookings/{id}/cancel/`
Cancels an active or pending reservation.

- **Request Body**:
```json
{
  "reason": "Lecture conflict; experiment moved to Friday."
}
```
- **Response `200 OK`**:
```json
{
  "message": "Booking SCB-2026-E42A8F has been cancelled successfully.",
  "booking": {
    "id": 14,
    "status": "CANCELLED"
  }
}
```

#### `POST /api/bookings/{id}/status/`
Lab Administrator / In-Charge decision endpoint to approve, reject, or mark equipment returned.

- **Request Body**:
```json
{
  "status": "APPROVED",
  "admin_remarks": "Approved. Bench #3 assigned with probe kit."
}
```
- **Statuses Supported**: `APPROVED`, `REJECTED`, `RETURNED`.
- **Response `200 OK`**: Returns updated booking object and recalculates live equipment availability.

---

### 5. Authentication & Accounts

#### `POST /api/auth/login/`
Authenticates user credentials and initiates session.
- **Payload**: `{"username": "admin", "password": "admin123"}`
- **Response `200 OK`**: `{"message": "Welcome back...", "user": {...}}`

#### `POST /api/auth/register/`
Registers a new campus user with profile role, roll number, and department.
- **Payload**:
```json
{
  "username": "jeeva_student",
  "email": "jeeva@campus.edu",
  "password": "Password@123",
  "first_name": "Jeevasakthi",
  "last_name": "S",
  "role": "STUDENT",
  "roll_number": "2023-IT-042",
  "department": "Information Technology"
}
```
- **Response `201 Created`**

#### `GET /api/auth/demo-users/`
Returns pre-seeded test accounts for one-click demo testing.
