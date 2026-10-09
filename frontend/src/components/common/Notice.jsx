import React from 'react';

/** Small shared pieces for screens that show backend data: notices, empty states, formatting. */

const TONES = {
  error: ['var(--status-danger-bg)', 'var(--status-danger-border)', 'var(--status-danger)'],
  success: ['var(--status-healthy-bg)', 'var(--status-healthy-border)', 'var(--status-healthy)'],
  info: ['var(--bg-nested)', 'var(--border-subtle)', 'var(--text-secondary)'],
};

export const Notice = ({ tone = 'info', children, style }) => {
  const [bg, border, color] = TONES[tone];
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, color, borderRadius: '6px', padding: '8px 12px', fontSize: '12px', ...style }}>
      {children}
    </div>
  );
};

export const Empty = ({ children }) => (
  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>{children}</div>
);

export const fmtDate = (v) => (v ? new Date(v).toLocaleString() : '-');
export const pct = (v) => (typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : '-');
export const num = (v, digits = 4) => (typeof v === 'number' ? v.toFixed(digits) : '-');

/** Badge class for the status strings used by training requests and Module 9. */
export const statusBadge = (status) => {
  if (['COMPLETED', 'MAIN', 'PROMOTED', 'ACCEPTED', 'USED_IN_AGGREGATION', 'active', 'EVALUATED'].includes(status)) return 'badge badge-healthy';
  if (['REJECTED', 'FAILED', 'CANCELLED', 'WITHDRAWN', 'QUARANTINED', 'rejected', 'suspended'].includes(status)) return 'badge badge-danger';
  if (['TRAINING', 'ACTIVE', 'OPEN', 'RECEIVING', 'AGGREGATING', 'EVALUATION_PENDING', 'pending'].includes(status)) return 'badge badge-blue';
  return 'badge badge-neutral';
};
