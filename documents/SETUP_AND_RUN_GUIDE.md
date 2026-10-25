# Smart Campus Resource & Lab Equipment Booking Portal
## Complete Setup & Execution Guide (VS Code)

This guide provides step-by-step instructions to run both the Django REST Framework backend and Vite+React frontend locally using separate terminals in Visual Studio Code.

---

### 1. Prerequisites

Ensure the following tools are installed on your Windows system:
- **Python**: 3.10+ (Verified on Python 3.11)
- **Node.js**: 18+ or 20+ (Verified on Node.js v24.2.0)
- **npm**: 9+ (Verified with `npm.cmd` v11.1.9)
- **Visual Studio Code**

---

### 2. Opening the Project in Visual Studio Code

1. Launch VS Code.
2. Select **File** > **Open Folder...** (or press `Ctrl + K Ctrl + O`).
3. Browse to and open:
   ```text
   C:\Users\Jeevasakthi\Documents\smart_campus_booking_portal
   ```
4. Open the integrated terminal in VS Code using the shortcut:
   ```text
   Ctrl + `  (backtick)
   ```

---

### 3. Running the Application (Two Terminals)

#### Terminal 1: Django Backend Server (Port 8000)

1. Open a new terminal in VS Code (**Terminal** > **New Terminal**).
2. Change directory into the `backend` folder:
   ```powershell
   cd backend
   ```
3. *(Optional if not already installed)* Install python dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```
4. Run database verification and tests:
   ```powershell
   python manage.py check
   python manage.py test bookings
   ```
5. *(Optional)* If database needs initial seed data:
   ```powershell
   python manage.py seed_data
   ```
6. Start the Django development server:
   ```powershell
   python manage.py runserver 127.0.0.1:8000
   ```
7. Verify backend is running:
   - Base API: `http://127.0.0.1:8000/api/dashboard/stats/`
   - Admin Panel: `http://127.0.0.1:8000/admin/`

---

#### Terminal 2: Vite + React Frontend Server (Port 5173)

1. Open a second terminal tab by clicking the `+` icon or split button in VS Code terminal.
2. Change directory into the `frontend` folder:
   ```powershell
   cd frontend
   ```
3. *(Optional if dependencies need refresh)* Install Node modules:
   ```powershell
   npm.cmd install
   ```
4. Start the Vite React development server:
   ```powershell
   npm.cmd run dev
   ```
5. Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

### 4. Preloaded Demo Accounts & Test Credentials

The portal includes pre-seeded demo accounts representing students, faculty, and administrators. You can log in manually or use the account switcher in the top navigation bar:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Lab Administrator** | `admin` | `admin123` | Full administrative approvals, reject, return equipment, manage catalog |
| **Faculty / Researcher**| `prof_sundar` | `faculty123` | Research bookings, equipment priority, departmental oversight |
| **Student** | `jeeva_student` | `student123` | Equipment search, booking creation, viewing personal booking history |
| **Student** | `priya_research`| `student123` | Chemistry/Biotech equipment reservations |

---

### 5. Troubleshooting & FAQ

#### 1. PowerShell Script Execution Policy Error:
If running `npm` or `activate` yields a security policy error:
```powershell
# Use npm.cmd instead:
npm.cmd run dev
```

#### 2. Port 8000 or 5173 already in use:
To run on alternative ports:
- **Django**: `python manage.py runserver 127.0.0.1:8080`
- **Vite**: `npm.cmd run dev -- --port 3000`

#### 3. CORS issues when connecting from custom domain:
Ensure `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py` includes your client URL.

---

### 6. Production Build Verification

To create an optimized production build of the React application:
```powershell
cd frontend
npm.cmd run build
```
The compiled output is outputted to `frontend/dist/`.
