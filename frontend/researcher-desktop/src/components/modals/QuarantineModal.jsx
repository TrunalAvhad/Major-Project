import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, CheckCircle, Ban } from 'lucide-react';

export const QuarantineModal = () => {
  const { activeModal, setActiveModal } = useApp();

  if (activeModal !== 'quarantine') return null;

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderColor: 'var(--status-danger-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-danger)' }}>
            <ShieldAlert size={18} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Quarantine Hospital Enclave (ENC-KYOTO-02)?</span>
          </div>
          <button 
            onClick={() => setActiveModal(null)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '14px',
            fontSize: '12px'
          }}>
            <strong style={{ color: 'var(--status-danger)' }}>Byzantine Gradient Outlier Detected</strong>
            <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
              Node <code>ENC-KYOTO-02</code> (Kyoto Univ Hospital) submitted parameter deltas with an L2-norm of <strong>17.42</strong> exceeding consortium cap of <strong>15.00</strong> (+16.1% over cap).
            </p>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Multi-Krum Remediation:</span>
              <strong style={{ color: 'var(--status-healthy)' }}>Isolated & Clamped</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Zero-Raw-Data Protocol:</span>
              <strong style={{ color: 'var(--status-healthy)' }}>Preserved (0 KB Patient Scans Leaked)</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Dismiss
          </button>
          <button className="btn btn-primary" onClick={() => setActiveModal(null)}>
            <CheckCircle size={13} />
            <span>Approve Sanitize Action</span>
          </button>
          <button className="btn btn-danger" onClick={() => setActiveModal(null)}>
            <Ban size={13} />
            <span>Mute Node (1h)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
