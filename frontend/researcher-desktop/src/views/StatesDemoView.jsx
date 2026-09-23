import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  AlertTriangle,
  RotateCw,
  Lock,
  CheckCircle,
  WifiOff,
  Inbox,
  Radio,
  FileCheck,
  StopCircle,
  ShieldAlert,
  Download,
  ArrowLeftRight
} from 'lucide-react';

export const StatesDemoView = () => {
  const { setActiveModal, userRole, setUserRole } = useApp();
  const [activeTab, setActiveTab] = useState('loading');

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <div className="badge badge-purple" style={{ marginBottom: '4px' }}>
          SECTION 18 // UX STATES, DIALOGS &amp; GUARDRAILS
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
          Interactive States, Error Boundaries &amp; Modal Showcases
        </h1>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Test and demonstrate all system UI states, empty states, error handling, permission gates, and critical confirmation dialogs.
        </p>
      </div>

      {/* Trigger Modal Dialogs Toolbar */}
      <div className="card" style={{ background: 'var(--bg-nested)' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          TRIGGER CRITICAL SYSTEM CONFIRMATION DIALOGS:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button className="btn btn-danger" onClick={() => setActiveModal('haltTraining')}>
            <StopCircle size={13} />
            <span>Halt Training Confirmation</span>
          </button>
          <button className="btn btn-warning" onClick={() => setActiveModal('quarantine')} style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning)', border: '1px solid var(--status-warning-border)' }}>
            <ShieldAlert size={13} />
            <span>Byzantine Node Quarantine</span>
          </button>
          <button className="btn btn-primary" onClick={() => setActiveModal('exportWeights')}>
            <Download size={13} />
            <span>Export Model Weights</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveModal('switchRole')}>
            <ArrowLeftRight size={13} />
            <span>Switch Role (Researcher ⇄ Admin)</span>
          </button>
        </div>
      </div>

      {/* State Switcher Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {[
          { id: 'loading', label: '1. Loading / Attesting State' },
          { id: 'empty', label: '2. Empty State' },
          { id: 'error', label: '3. Error / Handshake Failure' },
          { id: 'permission', label: '4. Permission Denied (RBAC)' },
          { id: 'offline', label: '5. Offline / Enclave Straggler' },
          { id: 'success', label: '6. Cryptographic Success Receipt' }
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`btn ${activeTab === s.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px', padding: '5px 12px' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* State Preview Canvas */}
      <div className="card" style={{ minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-nested)' }}>
        {/* 1. Loading State */}
        {activeTab === 'loading' && (
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', marginBottom: '14px' }}>
              <RotateCw size={32} color="var(--brand-blue)" className="spin-slow" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>Attesting Enclave Quorum &amp; Verifying PCR-07 Quotes...</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Establishing mutual TLS 1.3 handshakes across 8 clinical sites. Verifying Intel SGX and AMD SEV-SNP hardware measurements before dispatching Round 14 model weights.
            </p>
            <div style={{ marginTop: '16px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: 'var(--brand-blue)' }} />
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
              6 / 8 Enclaves Signed (Remaining: Charité, Tokyo Med)
            </div>
          </div>
        )}

        {/* 2. Empty State */}
        {activeTab === 'empty' && (
          <div style={{ textAlign: 'center', maxWidth: '380px' }}>
            <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', marginBottom: '12px' }}>
              <Inbox size={32} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>No Active Experiments Configured</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              No federated deep learning trials are currently running in this consortium workspace. Configure hyperparameters and enroll partner hospitals to begin training.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={() => alert('Opening Setup Wizard')}>
              + Setup New Federated Trial
            </button>
          </div>
        )}

        {/* 3. Error State */}
        {activeTab === 'error' && (
          <div style={{ textAlign: 'center', maxWidth: '440px', padding: '24px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid var(--status-danger-border)', borderRadius: '8px' }}>
            <AlertTriangle size={36} color="var(--status-danger)" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--status-danger)' }}>
              mTLS Cryptographic Handshake Failed (Error 0xEF12)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Node <code>enc-charite-eu01</code> failed mutual TLS certificate verification. Certificate expired or revoked by DigiCert Healthcare CA.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '14px' }}>
              <button className="btn btn-secondary">Inspect CA Chain</button>
              <button className="btn btn-danger">Re-verify Handshake</button>
            </div>
          </div>
        )}

        {/* 4. Permission Denied State */}
        {activeTab === 'permission' && (
          <div style={{ textAlign: 'center', maxWidth: '420px', padding: '24px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}>
            <Lock size={36} color="var(--status-purple)" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>Access Denied — Tier-1 Admin Required</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Under Module 1 RBAC policy, this action requires Consortium Administrator credentials. Your current role is <strong>Lead FL Investigator (Level 3)</strong>.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={() => setActiveModal('switchRole')}>
              Switch Role to Consortium Admin
            </button>
          </div>
        )}

        {/* 5. Offline State */}
        {activeTab === 'offline' && (
          <div style={{ textAlign: 'center', maxWidth: '420px', padding: '24px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--status-warning-border)', borderRadius: '8px' }}>
            <WifiOff size={36} color="var(--status-warning)" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--status-warning)' }}>
              Enclave Straggler Detected — Quorum Dropped
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Tokyo University Hospital (Node 0x77c1aa) exceeded socket heartbeat timeout (180s). Central aggregation paused awaiting consensus threshold or auto-recovery.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '14px' }}>
              <button className="btn btn-secondary">Send Ping Pulse</button>
              <button className="btn btn-primary">Drop Straggler &amp; Aggregate (7/8)</button>
            </div>
          </div>
        )}

        {/* 6. Success State */}
        {activeTab === 'success' && (
          <div style={{ textAlign: 'center', maxWidth: '440px', padding: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--status-healthy-border)', borderRadius: '8px' }}>
            <CheckCircle size={36} color="var(--status-healthy)" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--status-healthy)' }}>
              Consensus Block #1,842,910 Committed to Ledger
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Round 14 model weights successfully sealed and notarized with 8/8 cryptographic signatures. Zero-Raw-Data compliance verified across all edge PACS cohorts.
            </p>
            <div className="font-mono" style={{ fontSize: '10px', color: '#38bdf8', marginTop: '10px' }}>
              TXID: tx_90412_f0b1220a • Ed25519 Verified
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
