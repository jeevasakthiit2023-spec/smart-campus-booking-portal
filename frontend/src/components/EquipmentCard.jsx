import React from 'react';
import { MapPin, Info, CalendarPlus, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EquipmentCard({ equipment, onBook, onViewDetails }) {
  const isOperational = equipment.condition === 'OPERATIONAL';
  const isAvailable = isOperational && equipment.available_quantity > 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="equipment-card">
      <div className="equipment-image-container">
        <img
          src={equipment.image_url || fallbackImage}
          alt={equipment.name}
          className="equipment-image"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
        <div className="equipment-badge-overlay">
          {isOperational ? (
            <span className="badge badge-operational">
              <CheckCircle size={12} />
              Operational
            </span>
          ) : (
            <span className="badge badge-maintenance">
              <AlertTriangle size={12} />
              Maintenance
            </span>
          )}
        </div>
        <span className="equipment-asset-tag">{equipment.asset_id}</span>
      </div>

      <div className="equipment-body">
        <span className="equipment-category-label">{equipment.category_name}</span>
        <h3 className="equipment-title">{equipment.name}</h3>
        <p className="equipment-description">{equipment.description}</p>

        <div className="equipment-meta-list">
          <div className="equipment-meta-item">
            <MapPin size={14} className="text-cyan-400" />
            <span>
              <strong>{equipment.lab_name}</strong> ({equipment.lab_location})
            </span>
          </div>
          {equipment.specifications && (
            <div className="equipment-meta-item" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <span>{equipment.specifications}</span>
            </div>
          )}
        </div>

        <div className="equipment-footer">
          <div className="quantity-indicator">
            <span className={`quantity-dot ${isAvailable ? 'available' : 'depleted'}`} />
            <span style={{ color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {equipment.available_quantity} of {equipment.total_quantity} Available
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <button
              onClick={() => onViewDetails(equipment)}
              className="btn btn-secondary btn-sm"
              title="View full specifications & instructions"
            >
              <Info size={14} />
            </button>
            <button
              onClick={() => onBook(equipment)}
              className="btn btn-primary btn-sm"
              disabled={!isAvailable}
              style={{
                opacity: isAvailable ? 1 : 0.5,
                cursor: isAvailable ? 'pointer' : 'not-allowed',
              }}
            >
              <CalendarPlus size={14} />
              {isAvailable ? 'Book Slot' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
