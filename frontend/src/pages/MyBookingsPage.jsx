import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Ban,
  Clock,
  AlertCircle,
  PlusCircle,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { bookingService } from '../services/bookingService';

export default function MyBookingsPage({
  currentUser,
  onOpenBookingModal,
  showToast,
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings({
        user_id: currentUser?.id,
        status: statusFilter,
      });
      setBookings(data);
    } catch (err) {
      console.error('Failed to load my bookings', err);
      showToast('Failed to load your reservations history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [currentUser?.id, statusFilter]);

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    try {
      setIsCancelling(true);
      await bookingService.cancelBooking(selectedBookingForCancel.id, cancelReason);
      showToast(`Reservation ${selectedBookingForCancel.booking_ref} cancelled successfully.`, 'success');
      setSelectedBookingForCancel(null);
      setCancelReason('');
      fetchMyBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel reservation.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
            My Equipment Reservations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Track reservation approvals, time slots, assigned lab benches, and manage cancellations.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenBookingModal}>
          <PlusCircle size={16} />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Reservations' },
          { id: 'PENDING', label: 'Pending Review' },
          { id: 'APPROVED', label: 'Approved & Active' },
          { id: 'RETURNED', label: 'Returned / Completed' },
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
          <p>Loading your reservations...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Equipment & Lab</th>
                <th>Reserved Timeslot</th>
                <th>Purpose & Project</th>
                <th>Status</th>
                <th>Admin Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';
                return (
                  <tr key={booking.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: 'var(--accent-cyan)',
                          display: 'block',
                        }}
                      >
                        {booking.booking_ref}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        Booked: {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{booking.equipment_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {booking.lab_name}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 500 }}>
                        {new Date(booking.start_time).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#e2e8f0' }}>
                        {booking.project_title || 'Academic Practical'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={booking.purpose}
                      >
                        {booking.purpose}
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={booking.status} />
                    </td>

                    <td style={{ maxWidth: '200px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {booking.admin_remarks ? (
                        <span style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>
                          "{booking.admin_remarks}"
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>

                    <td>
                      {canCancel ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setSelectedBookingForCancel(booking)}
                          title="Cancel this reservation"
                        >
                          <Ban size={13} />
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
          <CalendarCheck size={44} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.45rem' }}>
            No Bookings in this Category
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            You don't have any reservations with status '{statusFilter}'. Reserve an instrument from the catalog.
          </p>
          <button className="btn btn-primary" onClick={onOpenBookingModal}>
            <PlusCircle size={15} />
            <span>Book Resource Now</span>
          </button>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {selectedBookingForCancel && (
        <div className="modal-overlay" onClick={() => setSelectedBookingForCancel(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: '1.15rem', color: '#fb7185' }}>
                Cancel Reservation?
              </h2>
              <button className="modal-close-btn" onClick={() => setSelectedBookingForCancel(null)}>
                <XCircle size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Are you sure you want to cancel reservation{' '}
              <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {selectedBookingForCancel.booking_ref}
              </strong>{' '}
              for <strong>{selectedBookingForCancel.equipment_name}</strong>?
            </p>

            <div className="form-group">
              <label className="form-label">Reason for cancellation (optional)</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="e.g. Schedule clash with lecture, experiment postponed..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedBookingForCancel(null)}
                disabled={isCancelling}
              >
                Keep Booking
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
