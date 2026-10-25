import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { bookingService } from '../services/bookingService';

export default function BookingModal({
  isOpen,
  onClose,
  equipment,
  allEquipments = [],
  currentUser,
  onSuccess,
  showToast,
}) {
  if (!isOpen) return null;

  // Format default start time: tomorrow at 09:00 AM
  const getDefaultStartTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  // Format default end time: tomorrow at 12:00 PM
  const getDefaultEndTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [selectedEquipId, setSelectedEquipId] = useState(equipment ? equipment.id : (allEquipments[0]?.id || ''));
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [endTime, setEndTime] = useState(getDefaultEndTime());
  const [purpose, setPurpose] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [department, setDepartment] = useState(
    currentUser?.profile?.department || 'Information Technology'
  );
  const [rollNumber, setRollNumber] = useState(
    currentUser?.profile?.roll_number || '2023-IT-042'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update selected equipment when prop changes
  useEffect(() => {
    if (equipment) {
      setSelectedEquipId(equipment.id);
    }
  }, [equipment]);

  const currentEquipment = allEquipments.find((e) => e.id === Number(selectedEquipId)) || equipment;

  // Calculate duration
  const getDurationString = () => {
    if (!startTime || !endTime) return '';
    const diffMs = new Date(endTime) - new Date(startTime);
    if (diffMs <= 0) return 'Invalid time range';
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedEquipId) {
      setErrorMsg('Please select an equipment to reserve.');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMsg('Please specify both reservation start and end times.');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setErrorMsg('Reservation end time must be after the start time.');
      return;
    }

    if (!purpose.trim()) {
      setErrorMsg('Please describe the purpose or research project for this reservation.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        equipment: Number(selectedEquipId),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        purpose: purpose.trim(),
        project_title: projectTitle.trim(),
        supervisor_name: supervisorName.trim(),
        department: department.trim(),
        roll_number: rollNumber.trim(),
        user_id: currentUser?.id,
      };

      const res = await bookingService.createBooking(payload);
      showToast(
        `Reservation ${res.booking.booking_ref} submitted successfully! Status: Pending approval.`,
        'success'
      );
      if (onSuccess) onSuccess(res.booking);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit booking reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calendar className="text-cyan-400" size={24} />
            <h2 className="modal-title">Book Lab Equipment</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: 'var(--radius-sm)',
              color: '#fecdd3',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#f43f5e' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Equipment Selector */}
          <div className="form-group">
            <label className="form-label">
              <span>Target Resource / Equipment *</span>
              {currentEquipment && (
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>
                  {currentEquipment.available_quantity} units available
                </span>
              )}
            </label>
            <select
              className="form-select"
              value={selectedEquipId}
              onChange={(e) => setSelectedEquipId(e.target.value)}
              required
            >
              <option value="">Select Equipment...</option>
              {allEquipments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} [{item.asset_id}] - {item.lab_name}
                </option>
              ))}
            </select>
          </div>

          {currentEquipment && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{currentEquipment.lab_name} ({currentEquipment.lab_location})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Condition:</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{currentEquipment.condition}</span>
              </div>
            </div>
          )}

          {/* Time Slot Picker */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Slot Start Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Slot End Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}
          >
            <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Estimated Duration: <strong>{getDurationString()}</strong></span>
          </div>

          {/* Project Details */}
          <div className="form-group">
            <label className="form-label">Academic Project / Coursework Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Smart IoT Edge Node / Capstone Project"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Purpose / Experiment Description *</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="State the technical objectives, circuit/model testing plan, and expected outcomes..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Faculty Supervisor</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Prof. Sundaramoorthy V"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Roll No / ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2023-IT-042"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <ShieldAlert size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              By booking, you agree to abide by lab operating guidelines, ESD protocols, and return
              equipment promptly at the end of the slot.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying & Submitting...' : 'Confirm Reservation Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
