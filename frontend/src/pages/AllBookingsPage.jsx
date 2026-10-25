import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AdminActionModal from '../components/AdminActionModal';
import { bookingService } from '../services/bookingService';

export default function AllBookingsPage({ showToast, onStatusChanged }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState(null);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings({
        status: statusFilter,
      });
      setBookings(data);
    } catch (err) {
      console.error('Failed to load all campus bookings', err);
      showToast('Failed to load campus reservations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [statusFilter]);

  // Client-side search filtering
  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.booking_ref.toLowerCase().includes(q) ||
      b.equipment_name.toLowerCase().includes(q) ||
      b.user_name.toLowerCase().includes(q) ||
      (b.roll_number && b.roll_number.toLowerCase().includes(q)) ||
      (b.department && b.department.toLowerCase().includes(q))
    );
  });

  const handleActionSuccess = (updatedBooking) => {
    fetchAllBookings();
    if (onStatusChanged) onStatusChanged();
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={24} className="text-emerald-400" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              Lab Administrator & Faculty Approvals
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Manage campus equipment reservation requests, schedule assignments, and check-in / return returns.
          </p>
        </div>

        {pendingCount > 0 && (
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-full)',
              color: '#fbbf24',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Clock size={15} />
            <span>{pendingCount} Request{pendingCount > 1 ? 's' : ''} Awaiting Review</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-container">
        <div className="filter-bar-top">
          <div className="search-input-wrapper">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Filter by ref, student name, roll number, or equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-chips">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'PENDING', label: 'Pending Review' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'RETURNED', label: 'Returned' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`category-chip ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p>Loading all reservation records...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Equipment</th>
                <th>Student / Applicant</th>
                <th>Timeslot</th>
                <th>Purpose & Project</th>
                <th>Status</th>
                <th>Admin Decision</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                        display: 'block',
                      }}
                    >
                      {b.booking_ref}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{b.equipment_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.lab_name}</div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{b.user_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Roll: {b.roll_number || 'N/A'} | {b.department || 'Campus'}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {new Date(b.start_time).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#e2e8f0' }}>
                      {b.project_title || 'Academic Practical'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={b.purpose}
                    >
                      {b.purpose}
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={b.status} />
                  </td>

                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedBookingForAction(b)}
                      title="Update reservation status"
                    >
                      <SlidersHorizontal size={13} />
                      <span>Action</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            maxWidth: '560px',
            margin: '2rem auto',
          }}
        >
          <Clock size={44} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.45rem' }}>
            No Matching Reservation Requests
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No bookings found matching query '{searchQuery}' and status '{statusFilter}'.
          </p>
        </div>
      )}

      {/* Admin Action Review Modal */}
      {selectedBookingForAction && (
        <AdminActionModal
          isOpen={!!selectedBookingForAction}
          onClose={() => setSelectedBookingForAction(null)}
          booking={selectedBookingForAction}
          onSuccess={handleActionSuccess}
          showToast={showToast}
        />
      )}
    </div>
  );
}
