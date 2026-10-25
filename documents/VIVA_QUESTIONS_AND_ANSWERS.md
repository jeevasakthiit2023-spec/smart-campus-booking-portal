# Smart Campus Resource & Lab Equipment Booking Portal
## Viva Voce Questions & Answers Guide

This comprehensive reference document contains standard and challenging technical viva questions, architectural explanations, and precise answers for university project reviews, final viva-voce examinations, and technical presentations.

---

### Q1. What is the core problem that this project addresses?
**Answer:**  
In university laboratories, high-end equipment (such as deep learning servers, oscilloscopes, 3D printers, and spectrometers) are expensive and shared across departments. Traditional paper-based registers or ad-hoc emails cause:
1. **Double-booking conflicts** where multiple students show up simultaneously.
2. **Underutilization** because students cannot check open slots in real-time.
3. **Lack of accountability** when equipment is damaged or left uncalibrated.
Our project provides a centralized, conflict-free web portal where equipment availability is tracked live, students can self-reserve slots, and faculty/lab admins can approve or monitor equipment usage with complete digital audit trails.

---

### Q2. Describe the overall architecture of your system.
**Answer:**  
The project uses a modern decoupled client-server architecture:
- **Frontend**: Single-Page Application (SPA) built with **React 18** and bundled with **Vite**. It uses functional components, standard React hooks (`useState`, `useEffect`), Lucide icons, and a custom CSS glassmorphism design system.
- **Backend**: Built with **Python 3** and **Django REST Framework (DRF)**. It exposes RESTful JSON endpoints for authentication, equipment listing, booking creation, conflict checking, and status approvals.
- **Database**: Relational **SQLite3** database managed via Django ORM with full ACID compliance and foreign key relational integrity.
- **Communication**: Cross-Origin Resource Sharing (CORS) enabled HTTP/REST API with JSON payloads.

---

### Q3. How does your backend prevent booking conflicts and double-booking?
**Answer:**  
Booking conflict validation is handled on the backend inside `BookingCreateSerializer.validate()` using interval overlap mathematics:
1. Two time intervals $[t_{s1}, t_{e1})$ and $[t_{s2}, t_{e2})$ overlap if and only if:
   $$t_{s1} < t_{e2} \quad \text{AND} \quad t_{e1} > t_{s2}$$
2. The serializer queries the database for existing confirmed (`APPROVED`) bookings for that specific equipment:
   ```python
   overlapping_approved = Booking.objects.filter(
       equipment=equipment,
       status='APPROVED',
       start_time__lt=end_time,
       end_time__gt=start_time
   ).count()
   ```
3. If `overlapping_approved >= equipment.total_quantity`, validation fails and DRF throws a `serializers.ValidationError`, returning an HTTP 400 response with a clear message explaining that all units are occupied during that time slot.
4. Additionally, when a Lab Admin approves a pending booking in `BookingStatusUpdateAPIView`, this check runs again to guarantee no race conditions or conflicting approvals occurred in the interim.

---

### Q4. Why did you choose React on the frontend and Django REST Framework on the backend?
**Answer:**  
- **React.js**: Enables dynamic, client-side re-rendering without full page refreshes. When a user filters equipment by category or searches for an asset ID, the list updates instantaneously. Modals and toast notifications can be toggled via component state without interrupting the user experience.
- **Django REST Framework**: Provides built-in authentication, robust serialization/validation pipelines, an ORM that prevents SQL injection attacks, and built-in CSRF/CORS handling. Django’s migration engine also makes schema iteration safe and reliable.

---

### Q5. Why did you choose SQLite for this project? Can it be upgraded in production?
**Answer:**  
- **For local development and academic evaluation**: SQLite is lightweight, serverless, zero-configuration, and stores the entire database in a single self-contained file (`db.sqlite3`). It fully adheres to ACID (Atomicity, Consistency, Isolation, Durability) properties.
- **Production Migration**: Because Django abstracts database operations through its Object-Relational Mapper (ORM), switching from SQLite to PostgreSQL or MySQL requires only changing the `DATABASES` dictionary in `settings.py` and running `python manage.py migrate`. Zero application code needs to be altered.

---

### Q6. How are user roles and permissions structured in the application?
**Answer:**  
We established three distinct institutional user roles using a `UserProfile` model linked one-to-one with Django's core `User` model:
1. **STUDENT**: Can view equipment catalogs, check real-time availability, submit reservation requests with academic project details, view their personal booking history, and cancel their own upcoming reservations.
2. **FACULTY / RESEARCHER**: Has expedited booking permissions for research projects and can view lab asset availability across departments.
3. **LAB ADMINISTRATOR / IN-CHARGE**: Has access to the administrative dashboard, can review all campus reservations, approve or reject pending requests with remarks, and mark equipment as "Returned" once students physically return the apparatus to the lab.

---

### Q7. How does the system calculate dynamic equipment availability?
**Answer:**  
The `Equipment` model features an `update_availability()` method:
```python
def update_availability(self):
    now = timezone.now()
    active_approved_count = self.bookings.filter(
        status='APPROVED',
        start_time__lte=now,
        end_time__gte=now
    ).count()
    self.available_quantity = max(0, self.total_quantity - active_approved_count)
    self.save(update_fields=['available_quantity'])
```
Whenever a booking transitions between `APPROVED`, `CANCELLED`, or `RETURNED`, `update_availability()` re-evaluates the active reservations at the current point in time and adjusts the available stock dynamically.

---

### Q8. What happens if a student attempts to select an invalid time interval?
**Answer:**  
Validation occurs at multiple layers:
1. **Frontend Validation**: The reservation modal ensures the end time is strictly greater than the start time, and verifies the start time is not in the past before making any network request.
2. **Backend Serializer Validation**: `BookingCreateSerializer` validates that `end_time > start_time` and rejects timestamps prior to current server time.
3. **Database Model Validation**: The `Booking.clean()` method enforces consistency rules at the ORM layer.

---

### Q9. Explain how CORS is configured and why it is necessary.
**Answer:**  
In development, the React frontend runs on Vite's development server at `http://localhost:5173`, while the Django backend runs at `http://127.0.0.1:8000`. Because they run on different ports, the browser's Same-Origin Policy (SOP) blocks cross-origin XMLHttpRequests/fetch calls by default.  
We installed `django-cors-headers`, added `corsheaders.middleware.CorsMiddleware` to `MIDDLEWARE`, and configured `CORS_ALLOWED_ORIGINS` to allow requests originating from `http://localhost:5173`. Additionally, Vite’s config provides a development proxy forwarding `/api` calls directly to port 8000.

---

### Q10. What automated test cases have you implemented?
**Answer:**  
We implemented Django unit and integration tests inside `backend/bookings/tests.py`:
1. `test_dashboard_stats_endpoint`: Verifies that platform metric aggregation returns correct counts for active equipment and reservations.
2. `test_equipment_listing_and_filter`: Verifies category filtering and search queries work accurately.
3. `test_create_booking_success`: Confirms valid reservation payloads yield a 201 Created status and a unique `SCB-YYYY-XXXXXX` reference code.
4. `test_booking_conflict_validation`: Proves mathematically that creating bookings beyond the total quantity of an equipment raises HTTP 400 Bad Request with an overbooking error.
5. `test_booking_cancellation`: Tests that users can cancel active pending reservations.
6. `test_admin_status_approval`: Tests administrative approval state transitions and remark updates.

7. `test_invalid_status_transition_prevented`: Verifies terminal states like RETURNED cannot revert to APPROVED or PENDING (HTTP 400).
8. `test_unauthorized_user_cannot_approve_booking`: Guarantees students cannot approve or change reservation status (HTTP 403 Forbidden).
9. `test_unauthorized_user_cannot_cancel_others_booking`: Guarantees that users cannot cancel other users'' reservations (HTTP 403 Forbidden).

All 9 test cases run and pass with:
```bash
python manage.py test bookings
```

---

### Q11. How would you scale this system to handle 50,000+ students?
**Answer:**  
To scale for enterprise campus-wide deployment:
1. **Database**: Migrate to **PostgreSQL** with connection pooling (`pgbouncer`) and read replicas for read-heavy catalog searches.
2. **Caching**: Deploy **Redis** to cache dashboard statistics and equipment catalog queries with a 60-second Time-To-Live (TTL).
3. **Asynchronous Tasks**: Use **Celery** with Redis to handle email/SMS confirmation dispatches asynchronously without blocking HTTP request threads.
4. **Containerization & Deployment**: Package frontend and backend with **Docker** and deploy behind an **NGINX** reverse proxy with load balancing on AWS ECS or Kubernetes.
5. **Database Locking**: Use `select_for_update()` inside an `atomic` transaction during booking creation to handle high-frequency simultaneous clicks on popular equipment.
