import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const PrivacyNotice = ({ compact = false }) => {
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-md)',
        fontSize: '11px',
        color: 'var(--text-secondary)'
      }}>
        <ShieldCheck size={14} color="var(--status-healthy)" />
        <span>
          <strong style={{ color: 'var(--status-healthy)' }}>Privacy Guarantee:</strong> Raw medical images, DICOMs, and patient identifiers strictly remain local to this hospital node.
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: '#0a121e',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '16px'
    }}>
      <div style={{
        padding: '6px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: 'var(--status-healthy)'
      }}>
        <ShieldCheck size={20} />
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-healthy)', marginBottom: '2px' }}>
          Strict Hospital Privacy Boundary & HIPAA Compliance
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Raw patient scans and Protected Health Information (PHI) are hard-locked on local storage. 
          Module 3 invokes local Module 4 inspection and Module 5 preprocessing without network transmission. 
          Federated Learning (Module 9) will only transmit differential privacy-protected weight updates.
        </p>
      </div>
    </div>
  );
};

export default PrivacyNotice;
