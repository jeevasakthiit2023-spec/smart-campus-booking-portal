import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, accent = '#4f46e5' }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accent }}>
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value ?? '...'}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className="stat-icon-wrapper" style={{ color: accent, background: `${accent}18` }}>
          <Icon size={26} />
        </div>
      )}
    </div>
  );
}
