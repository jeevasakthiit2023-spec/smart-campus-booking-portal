import React from 'react';
import { Cpu, Database, Server, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="portal-footer">
      <div className="footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Cpu size={18} className="text-cyan-400" />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            Smart Campus Resource & Lab Equipment Booking Portal
          </span>
          <span style={{ color: 'var(--text-dim)' }}>| v2.0 Production</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={13} />
            <span>DRF API: Connected (8000)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)' }}>
            <Database size={13} />
            <span>Database: SQLite 3 Engine</span>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>© 2026 Dept. of Academic Research & Labs</span>
        </div>
      </div>
    </footer>
  );
}
