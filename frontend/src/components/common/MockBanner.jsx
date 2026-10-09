import React from 'react';
import { AlertTriangle } from 'lucide-react';

/** Marks a screen or panel whose content is demo data because its module is not implemented yet. */
const MockBanner = ({ module, children }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 12px', borderRadius: '6px',
    background: 'var(--status-warning-bg)', border: '1px solid var(--status-warning-border)',
    fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4,
  }}>
    <AlertTriangle size={14} color="var(--status-warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
    <span>
      <strong style={{ color: 'var(--status-warning)' }}>Mock data</strong>
      {module && <> &middot; {module} is not implemented yet</>}
      {children && <> &middot; {children}</>}
    </span>
  </div>
);

export default MockBanner;
