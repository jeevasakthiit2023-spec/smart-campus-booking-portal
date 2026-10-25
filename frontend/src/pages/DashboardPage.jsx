import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  CalendarCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Cpu,
  Server,
  Bot,
  Printer,
  FlaskConical,
  Activity
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { equipmentService } from '../services/equipmentService';

export default function DashboardPage({
  onNavigateToCatalog,
  onNavigateToMyBookings,
  onOpenBookingModal,
  onSelectCategoryFilter
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const categoryIcons = {
    'electronics-iot': Cpu,
    'ai-hpc': Server,
    'robotics-automation': Bot,
    '3d-printing-fablab': Printer,
    'biotech-analytical': FlaskConical,
  };

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setLoading(true);
        const data = await equipmentService.getDashboardStats();
        if (isMounted) setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
          <Sparkles size={18} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Smart Campus Research & Innovation Infrastructure
          </span>
        </div>

        <div style={{ maxWidth: '780px' }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '0.5rem' }}>
            Resource & Lab Equipment Booking Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6 }}>
            Reserve high-performance compute clusters, digital storage oscilloscopes, industrial 3D printers,
            and analytical instruments with real-time schedule conflict verification and lab in-charge approval.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button className="btn btn-primary" onClick={onOpenBookingModal}>
            Book Equipment Now
            <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigateToCatalog('all')}>
            Explore Equipment Catalog
          </button>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Equipment"
          value={stats ? `${stats.total_equipment} Items (${stats.total_units} Units)` : '...'}
          subtext="Across 5 Specialized Research Labs"
          icon={Layers}
          accent="#6366f1"
        />
        <StatCard
          title="Available Units Now"
          value={stats ? stats.available_units : '...'}
          subtext="Operational and calibrated"
          icon={CheckCircle2}
          accent="#10b981"
        />
        <StatCard
          title="Active Reservations"
          value={stats ? stats.active_bookings : '...'}
          subtext="Currently running in campus labs"
          icon={CalendarCheck}
          accent="#06b6d4"
        />
        <StatCard
          title="Pending Approvals"
          value={stats ? stats.pending_requests : '...'}
          subtext="Awaiting lab in-charge review"
          icon={Clock}
          accent="#f59e0b"
        />
      </div>

      {/* Category Quick Filter Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Research Domains & Labs</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Browse equipment curated by specialized engineering & scientific departments
            </p>
          </div>
          <button
            onClick={() => onNavigateToCatalog('all')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {stats?.categories?.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Cpu;
            return (
              <div
                key={cat.id}
                className="glass-card glass-card-hover"
                style={{ cursor: 'pointer', padding: '1.25rem' }}
                onClick={() => onSelectCategoryFilter(cat.slug)}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.85rem',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  {cat.equip_count} Equipment Listed
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Activity className="text-cyan-400" size={20} />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Recent Lab Activity Stream</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Latest resource bookings and reservation statuses across the campus
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToMyBookings}>
            My Bookings History
          </button>
        </div>

        <div className="table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Equipment</th>
                <th>Reserved By</th>
                <th>Lab Room</th>
                <th>Reserved Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
                stats.recent_bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {booking.booking_ref}
                    </td>
                    <td style={{ fontWeight: 600 }}>{booking.equipment_name}</td>
                    <td>
                      <div>{booking.user_name}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {booking.department || 'Department'}
                      </span>
                    </td>
                    <td>{booking.lab_name}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(booking.start_time).toLocaleDateString()} (
                      {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No recent booking activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
