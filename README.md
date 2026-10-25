# Smart Campus Resource & Lab Equipment Booking Portal

A production-grade full-stack web application designed for engineering colleges and university campuses to streamline, automate, and manage reservations for specialized lab equipment and research instruments.

---

## 🌟 Key Features

- **Decoupled Architecture**: High-performance React 18 frontend built with Vite and Django 5 REST Framework backend.
- **Glassmorphic Engineering UI**: Responsive dark theme with custom CSS design tokens, smooth animations, and Lucide icons.
- **Conflict-Free Reservation Engine**: Mathematical interval-overlap checking to guarantee zero double-bookings.
- **Role-Based Access Control**: Tailored workflows for **Students**, **Faculty / Researchers**, and **Lab Administrators**.
- **Real-Time Operational Dashboard**: Live metrics on asset availability, active sessions, and pending approvals.
- **Full Booking Lifecycle**: Seamless tracking from submission (`PENDING`), to verification (`APPROVED`), through completion (`RETURNED`) or cancellation (`CANCELLED`).
- **Comprehensive Documentation**: Complete guides for API, database schema, project report, and viva exam questions.

---

## 📁 Project Structure

```text
smart_campus_booking_portal/
├── backend/
│   ├── bookings/            # Django app (models, views, serializers, admin, tests)
│   │   ├── management/      # Custom seed_data command
│   │   └── migrations/      # Database migrations
│   ├── config/              # Django settings, URLs, WSGI/ASGI
│   ├── db.sqlite3           # Preloaded SQLite database
│   ├── manage.py            # Django command-line utility
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── public/              # Static public assets and favicon
│   ├── src/                 # React components, pages, services, styles
│   │   ├── components/      # Navbar, Footer, Modals, Cards, Badges, Toasts
│   │   ├── pages/           # Dashboard, Equipment, MyBookings, AllBookings, Login, Register
│   │   ├── services/        # API client and authentication services
│   │   ├── App.jsx          # Root application component
│   │   └── index.css        # Glassmorphic design system
│   ├── package.json         # Node.js dependencies and scripts
│   └── vite.config.js       # Vite configuration with API proxy
├── documents/
│   ├── PROJECT_DOCUMENTATION.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── SETUP_AND_RUN_GUIDE.md
│   ├── PROJECT_REPORT.md
│   └── VIVA_QUESTIONS_AND_ANSWERS.md
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide (VS Code)

### Terminal 1: Django Backend Server
```powershell
cd backend
python manage.py check
python manage.py test bookings
python manage.py runserver 127.0.0.1:8000
```
- API Base URL: `http://127.0.0.1:8000/api/`
- Django Admin: `http://127.0.0.1:8000/admin/`

### Terminal 2: React Frontend Server
```powershell
cd frontend
npm.cmd run dev
```
- Web Application: `http://localhost:5173/`

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Username | Password |
| :--- | :--- | :--- |
| **Lab Administrator** | `admin` | `admin123` |
| **Faculty / Researcher** | `prof_sundar` | `faculty123` |
| **Student** | `jeeva_student` | `student123` |
| **Student** | `priya_research` | `student123` |
