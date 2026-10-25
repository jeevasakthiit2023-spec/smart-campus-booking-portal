import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, CheckSquare, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';

export default function AdminActionModal({ isOpen, onClose, booking, onSuccess, showToast }) {
  if (!isOpen || !booking) return null;

  const [targetStatus, setTargetStatus] = useState(
    booking.status === 'PENDING' ? 'APPROVED' : booking.status
  );
  const [adminRemarks, setAdminRemarks] = useState(booking.admin_remarks || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setIsSubmitting(true);
      const res = await bookingService.updateBookingStatus(booking.id, targetStatus, adminRemarks);
      showToast(res.message || `Booking ${booking.booking_ref} updated successfully!`, 'success');
      if (onSuccess) onSuccess(res.booking);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update booking status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Lab Admin Decision</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              Ref: {booking.booking_ref}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: 'var(--radius-sm)',
              color: '#fecdd3',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Booking Summary Box */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Equipment:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{booking.equipment_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Student / User:</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{booking.user_name} ({booking.roll_number || 'N/A'})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Department:</span>
            <span>{booking.department || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
            <span>
              {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleTimeString()}
            </span>
          </div>
          <div style={{ marginTop: '0.35rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Purpose:</span>
            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.82rem' }}>{booking.purpose}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">Update Status To</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${targetStatus === 'APPROVED' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => setTargetStatus('APPROVED')}
              >
                <CheckCircle2 size={14} />
                Approve
              </button>
              <button
                type="button"
                className={`btn btn-sm ${targetStatus === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setTargetStatus('REJECTED')}
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                type="button"
                className={`btn btn-sm ${targetStatus === 'RETURNED' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTargetStatus('RETURNED')}
              >
                <CheckSquare size={14} />
                Returned
              </button>
            </div>
          </div>

          {/* Admin Remarks */}
          <div className="form-group">
            <label className="form-label">
              <span>Admin Remarks / Lab In-Charge Notes</span>
              <span className="form-hint">Optional feedback or bench assignment</span>
            </label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Approved. Bench slot #2 assigned. Ensure safety goggles are worn."
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Apply Status Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
