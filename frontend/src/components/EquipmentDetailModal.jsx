import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Mail, ShieldAlert, Cpu, Calendar, Clock, CheckCircle } from 'lucide-react';
import { equipmentService } from '../services/equipmentService';

export default function EquipmentDetailModal({ equipment, onClose, onBookNow }) {
  if (!equipment) return null;

  const [detailData, setDetailData] = useState(equipment);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await equipmentService.getEquipmentById(equipment.id);
        if (isMounted) setDetailData(data);
      } catch (err) {
        console.error('Failed to load equipment detail', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [equipment.id]);

  const fallbackImage = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  const isAvailable = detailData.condition === 'OPERATIONAL' && detailData.available_quantity > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Cpu className="text-cyan-400" size={24} />
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>{detailData.name}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                Asset Tag: {detailData.asset_id}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Media Banner */}
        <div
          style={{
            width: '100%',
            height: '220px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '1.25rem',
            position: 'relative',
          }}
        >
          <img
            src={detailData.image_url || fallbackImage}
            alt={detailData.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              background: 'rgba(11, 15, 25, 0.85)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <span
              className={`quantity-dot ${isAvailable ? 'available' : 'depleted'}`}
            />
            <span style={{ color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
              {detailData.available_quantity} of {detailData.total_quantity} Units Available
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Overview & Scope
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            {detailData.description}
          </p>
        </div>

        {/* Specifications */}
        {detailData.specifications && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.05em' }}>
              Technical Specifications
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
              {detailData.specifications}
            </div>
          </div>
        )}

        {/* Location & Lab In-charge info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Lab Location</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
              <MapPin size={16} className="text-cyan-400" />
              <span>{detailData.lab_name}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '1.45rem' }}>{detailData.lab_location}</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Condition & State</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
              <CheckCircle size={16} style={{ color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)' }} />
              <span>{detailData.condition}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '1.45rem' }}>
              {isAvailable ? 'Ready for booking' : 'Check back later'}
            </span>
          </div>
        </div>

        {/* Protocols & Safety */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem',
            marginBottom: '1.25rem',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '0.25rem' }}>
            <ShieldAlert size={16} />
            <span>Safety Protocol & Hourly Guidelines</span>
          </div>
          <p style={{ color: '#fef3c7', margin: 0, lineHeight: 1.5 }}>
            {detailData.safety_protocol || detailData.hourly_guidelines}
          </p>
        </div>

        {/* Upcoming Schedule */}
        {detailData.upcoming_schedule && detailData.upcoming_schedule.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
              Active & Upcoming Booked Slots
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {detailData.upcoming_schedule.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{slot.booking_ref}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(slot.start_time).toLocaleDateString()} {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            disabled={!isAvailable}
            onClick={() => {
              onClose();
              onBookNow(detailData);
            }}
          >
            Proceed to Book
          </button>
        </div>
      </div>
    </div>
  );
}
