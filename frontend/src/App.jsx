import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import BookingModal from './components/BookingModal';
import EquipmentDetailModal from './components/EquipmentDetailModal';

// Pages
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AllBookingsPage from './pages/AllBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Services
import { authService } from './services/authService';
import { equipmentService } from './services/equipmentService';
import { bookingService } from './services/bookingService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [allEquipments, setAllEquipments] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedEquipment, setPreselectedEquipment] = useState(null);
  const [detailEquipment, setDetailEquipment] = useState(null);

  // Stats & Badges
  const [pendingCount, setPendingCount] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load equipment catalog & pending count
  const refreshAppData = async () => {
    try {
      const [equips, stats] = await Promise.all([
        equipmentService.getEquipmentList(),
        equipmentService.getDashboardStats().catch(() => null),
      ]);
      setAllEquipments(equips || []);
      if (stats) {
        setPendingCount(stats.pending_requests || 0);
      }
    } catch (err) {
      console.warn('Initial data fetch notice:', err.message);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  // Check initial demo user if none is logged in
  useEffect(() => {
    if (!currentUser) {
      // Auto-set student Jeevasakthi as default demo user for seamless instant experience
      const defaultUser = {
        id: 3,
        username: 'jeeva_student',
        email: 'jeeva.it2023@campus.edu',
        first_name: 'Jeevasakthi',
        last_name: 'S',
        full_name: 'Jeevasakthi S',
        is_staff: false,
        profile: {
          role: 'STUDENT',
          roll_number: '2023-IT-042',
          department: 'Information Technology',
          phone: '+91 98403 45678',
        },
      };
      authService.setCurrentUser(defaultUser);
      setCurrentUser(defaultUser);
    }
  }, []);

  const handleSwitchUser = async (username) => {
    const passwords = {
      jeeva_student: 'student123',
      prof_sundar: 'faculty123',
      admin: 'admin123',
    };
    try {
      const res = await authService.login(username, passwords[username] || 'student123');
      setCurrentUser(res.user);
      showToast(`Switched account to: ${res.user.first_name || res.user.username} (${res.user.profile?.role || 'STUDENT'})`, 'success');
      refreshAppData();
    } catch (err) {
      showToast(`User switch notice: ${err.message}`, 'info');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    showToast('Signed out of Smart Campus Portal.', 'info');
    setActiveTab('login');
  };

  const handleOpenBookingModal = (equipment = null) => {
    setPreselectedEquipment(equipment);
    setIsBookingModalOpen(true);
  };

  const handleViewEquipmentDetails = (equipment) => {
    setDetailEquipment(equipment);
  };

  const handleSelectCategoryFromDashboard = (catSlug) => {
    setCategoryFilter(catSlug);
    setActiveTab('equipment');
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        pendingCount={pendingCount}
        onOpenBookingModal={() => handleOpenBookingModal(null)}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onLoginClick={() => setActiveTab('login')}
      />

      {/* Main Routed Page Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigateToCatalog={(cat) => {
              setCategoryFilter(cat);
              setActiveTab('equipment');
            }}
            onNavigateToMyBookings={() => setActiveTab('my-bookings')}
            onOpenBookingModal={() => handleOpenBookingModal(null)}
            onSelectCategoryFilter={handleSelectCategoryFromDashboard}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentPage
            initialCategory={categoryFilter}
            onBookEquipment={(eq) => handleOpenBookingModal(eq)}
            onViewDetails={handleViewEquipmentDetails}
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookingsPage
            currentUser={currentUser}
            onOpenBookingModal={() => handleOpenBookingModal(null)}
            showToast={showToast}
          />
        )}

        {activeTab === 'admin-bookings' && (
          <AllBookingsPage
            showToast={showToast}
            onStatusChanged={refreshAppData}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab('dashboard');
              refreshAppData();
            }}
            onNavigateToRegister={() => setActiveTab('register')}
            showToast={showToast}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onRegisterSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab('dashboard');
              refreshAppData();
            }}
            onNavigateToLogin={() => setActiveTab('login')}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        equipment={preselectedEquipment}
        allEquipments={allEquipments}
        currentUser={currentUser}
        onSuccess={() => {
          refreshAppData();
          setActiveTab('my-bookings');
        }}
        showToast={showToast}
      />

      {/* Equipment Detailed Specs Modal */}
      {detailEquipment && (
        <EquipmentDetailModal
          equipment={detailEquipment}
          onClose={() => setDetailEquipment(null)}
          onBookNow={(eq) => handleOpenBookingModal(eq)}
        />
      )}

      {/* Floating Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
