import React, { useState } from 'react';
import {
  Cpu,
  LayoutDashboard,
  Layers,
  CalendarCheck,
  ShieldCheck,
  PlusCircle,
  LogOut,
  LogIn,
  UserCheck,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  pendingCount = 0,
  onOpenBookingModal,
  onSwitchUser,
  onLogout,
  onLoginClick
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdminOrStaff = currentUser?.is_staff || currentUser?.profile?.role === 'LAB_ADMIN' || currentUser?.profile?.role === 'FACULTY';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipment', label: 'Equipment Catalog', icon: Layers },
    { id: 'my-bookings', label: 'My Bookings', icon: CalendarCheck },
    ...(isAdminOrStaff
      ? [{ id: 'admin-bookings', label: 'Admin Management', icon: ShieldCheck, badge: pendingCount }]
      : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div
          className="brand-logo"
          onClick={() => setActiveTab('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-icon-wrapper">
            <Cpu size={22} />
          </div>
          <div className="brand-title">
            <span className="brand-title-main">Smart Campus</span>
            <span className="brand-title-sub">Resource & Lab Portal</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <ul className="nav-links" style={{ display: 'flex' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      style={{
                        background: 'var(--accent-amber)',
                        color: '#000',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        marginLeft: '4px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Action & Auth Section */}
        <div className="nav-auth-section">
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenBookingModal}
            title="Create a new equipment reservation"
          >
            <PlusCircle size={15} />
            <span>Book Resource</span>
          </button>

          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <div
                className="user-badge"
                style={{ cursor: 'pointer' }}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-avatar">
                  {currentUser.first_name?.[0] || currentUser.username?.[0] || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.full_name || currentUser.username}</span>
                  <span className="user-role-tag">{currentUser.profile?.role || 'STUDENT'}</span>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-dim)', marginLeft: '2px' }} />
              </div>

              {/* Quick User Switcher Menu */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: '#111827',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '240px',
                    padding: '0.5rem',
                    zIndex: 200,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Quick Role Switcher (Demo)
                    </span>
                  </div>

                  <button
                    className="nav-link"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem' }}
                    onClick={() => {
                      onSwitchUser('jeeva_student');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <UserCheck size={14} className="text-cyan-400" />
                    <span>Jeevasakthi (Student)</span>
                  </button>

                  <button
                    className="nav-link"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem' }}
                    onClick={() => {
                      onSwitchUser('prof_sundar');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <UserCheck size={14} className="text-indigo-400" />
                    <span>Prof. Sundar (Faculty)</span>
                  </button>

                  <button
                    className="nav-link"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem' }}
                    onClick={() => {
                      onSwitchUser('admin');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Dr. Ramanathan (Lab Admin)</span>
                  </button>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.4rem 0' }} />

                  <button
                    className="nav-link"
                    style={{ width: '100%', justifyContent: 'flex-start', color: '#fb7185', fontSize: '0.82rem' }}
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onLoginClick}>
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="btn btn-secondary btn-icon"
            style={{ display: 'none' }} // in mobile media query we can activate
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
