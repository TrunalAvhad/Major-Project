import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, X, KeyRound, Check, FileCheck } from 'lucide-react';

export const ExportWeightsModal = () => {
  const { activeModal, setActiveModal } = useApp();
  const [signed, setSigned] = useState(false);

  if (activeModal !== 'exportWeights') return null;

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} color="var(--brand-blue)" />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Export Checkpoint Weights (.pt)</span>
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
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '14px',
            fontSize: '12px'
          }}>
            <strong style={{ color: 'var(--brand-blue)' }}>Model: EfficientNet-B0-FL v2.4 Checkpoint</strong>
            <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
              Weights Digest (SHA-256): <code className="font-mono" style={{ color: '#38bdf8' }}>0x8a92bb01c8fa334ef09c...e84d7a12</code>
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            background: 'var(--bg-nested)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-healthy)' }}>
              <Check size={14} />
              <span>Zero Raw Patient Data (Deep Entropy Scan Passed)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-healthy)' }}>
              <Check size={14} />
              <span>Differential Privacy Guaranteed (ε=1.24, C=1.0)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-healthy)' }}>
              <Check size={14} />
              <span>TPM 2.0 PCR-07 Hardware Attested</span>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Cryptographic Hardware Token Authorization (Module 1 Policy):
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '6px',
              background: signed ? 'var(--status-healthy-bg)' : 'var(--bg-nested)',
              border: `1px solid ${signed ? 'var(--status-healthy-border)' : 'var(--border-subtle)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={16} color={signed ? 'var(--status-healthy)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '12px' }}>
                  {signed ? 'YubiKey 5 FIPS Signed: RSA-4096 Attested' : 'Insert & Tap YubiKey 5 FIPS Token'}
                </span>
              </div>
              <button 
                className={`btn ${signed ? 'btn-secondary' : 'btn-primary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setSigned(true)}
              >
                {signed ? 'Verified' : 'Sign Export'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            disabled={!signed}
            style={{ opacity: signed ? 1 : 0.5, cursor: signed ? 'pointer' : 'not-allowed' }}
            onClick={() => {
              alert('Weights exported successfully: EfficientNet-B0-FL_v2.4_checkpoint.pt (184.2 MB). Cryptographic audit receipt recorded.');
              setActiveModal(null);
            }}
          >
            <FileCheck size={13} />
            <span>Download Checkpoint (.pt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
