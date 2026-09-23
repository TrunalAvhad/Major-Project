import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X } from 'lucide-react';

export const HaltTrainingModal = () => {
  const { activeModal, setActiveModal, setSessionStatus } = useApp();

  if (activeModal !== 'haltTraining') return null;

  const handleConfirmHalt = () => {
    setSessionStatus('stopped');
    setActiveModal(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderColor: 'var(--status-danger-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-danger)' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Halt Federated Training Round 14?</span>
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
            background: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '14px',
            fontSize: '12px',
            color: 'var(--text-primary)'
          }}>
            <strong>Warning: Critical Orchestration Interruption</strong>
            <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
              Halting trial <code>EXP-FL-2025-084</code> mid-round will abort ephemeral gradient transmission from 8 hospital enclaves.
            </p>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Completed Rounds:</span>
              <strong style={{ color: 'var(--text-primary)' }}>13 / 20 Saved</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Expended Differential Privacy Budget:</span>
              <strong style={{ color: 'var(--accent-teal)' }}>ε = 1.24 (Committed to Ledger)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>Hospital Node State:</span>
              <strong style={{ color: 'var(--status-warning)' }}>Rollback to Checkpoint v2.3</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Cancel & Keep Training
          </button>
          <button className="btn btn-danger" onClick={handleConfirmHalt}>
            Confirm Immediate Halt
          </button>
        </div>
      </div>
    </div>
  );
};
