import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  FileCheck,
  Radio,
  Download,
  Filter,
  Sliders,
  Lock,
  Activity,
  Check
} from 'lucide-react';

export const NotificationsView = () => {
  const { setActiveModal, setActiveScreen } = useApp();
  const [filterTopic, setFilterTopic] = useState('all');

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Subheader Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
            Consortium Root / Pan-Cancer v4.2 / Security &amp; Telemetry Feed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
              Consortium Notifications &amp; Alert Center
            </h1>
            <span className="badge badge-danger" style={{ fontSize: '9px' }}>
              ● 1 Critical Fault Clamped
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => alert('All notifications marked as read.')}>
            <Check size={12} />
            <span>Mark all as read</span>
          </button>
          <button className="btn btn-secondary">
            <Sliders size={12} />
            <span>Routing Rules</span>
          </button>
          <button className="btn btn-primary" onClick={() => alert('Audit receipt exported to local keychain.')}>
            <Download size={12} />
            <span>Export Audit Receipt</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Alerts 24' },
            { id: 'unread', label: 'Unread Actionable 3' },
            { id: 'critical', label: 'Critical Security 1' },
            { id: 'quorum', label: 'Enclave Quorum 2' },
            { id: 'irb', label: 'Governance & IRB 0' }
          ].map((f) => (
            <button
              key={f.id}
              className={`btn ${f.id === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '10px', padding: '4px 10px' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--status-healthy)' }}>✔ mTLS Synced</span>
          <span>Auto-refresh: 10s</span>
        </div>
      </div>

      {/* 2-Column Layout: Sidebar Breakdown & Main Alert Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' }}>
        {/* Left Sub-Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Severity Breakdown */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">SEVERITY BREAKDOWN</span>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>24 Events</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-danger)' }}>
                  <span className="pulse-dot danger" /> Critical Faults
                </span>
                <strong className="font-mono">1</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-warning)' }}>
                  <span className="pulse-dot warning" /> Urgent Approvals
                </span>
                <strong className="font-mono">2</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span>●</span> Warnings
                </span>
                <strong className="font-mono">4</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <span>●</span> System Info
                </span>
                <strong className="font-mono">17</strong>
              </div>
            </div>
          </div>

          {/* Clinical Topics */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">FILTER BY CLINICAL TOPIC</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              {[
                { name: 'Byzantine & Poisoning', count: 1, color: 'var(--status-danger)' },
                { name: 'FL Training Rounds', count: 14, color: 'var(--brand-blue)' },
                { name: 'Hospital Node Disconnects', count: 0, color: 'var(--text-muted)' },
                { name: 'Differential Privacy Budget', count: 2, color: 'var(--accent-teal)' },
                { name: 'IRB / Model Governance', count: 1, color: 'var(--status-purple)' }
              ].map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '2px 0' }}>
                  <span style={{ color: t.count > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t.name}</span>
                  <span className="font-mono" style={{ color: t.color }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Relays */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">TELEMETRY RELAYS</span>
              <span className="pulse-dot healthy" />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Webhook (Slurm HPC):</span>
                <span style={{ color: 'var(--status-healthy)' }}>active (200 OK)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PagerDuty Bridge:</span>
                <span style={{ color: 'var(--status-healthy)' }}>mTLS v1.3 UP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Digest Dispatch:</span>
                <span className="font-mono">Daily @ 06:00 UTC</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Attestation Box */}
          <div style={{
            background: 'var(--bg-nested)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '10px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
              CRYPTOGRAPHIC ATTESTATION
            </div>
            <p style={{ lineHeight: 1.35 }}>
              Notifications are cryptographically hashed via Ed25519 node signatures and ledgered directly to the immutable local consortium ring.
            </p>
            <div className="font-mono" style={{ color: '#38bdf8', marginTop: '4px' }}>
              SHA256: 9b2d8e41f0c2a88d710...
            </div>
          </div>
        </div>

        {/* Main Feed Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Card 1: Critical Byzantine Fault */}
          <div className="card" style={{ border: '1px solid var(--status-danger-border)', background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, #131b2e 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-danger" style={{ fontSize: '9px' }}>
                  CRITICAL - BYZANTINE FAULT
                </span>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  ENC-KYOTO-02 (Kyoto Univ Hospital) • <strong style={{ color: 'var(--status-danger)' }}>Unread</strong>
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                2025-05-18 14:32:09 UTC
              </span>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
              Byzantine Gradient Outlier Detected &amp; Clamped - Round 14
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
              During gradient aggregation for Round 14, node <code>ENC-KYOTO-02</code> submitted parameter deltas with an L2-norm of <strong>17.42</strong> (strict consortium threshold: 15.00). Anomaly score: 0.942. Gradient was isolated and clamped via Multi-Krum aggregation filter. Requires investigator sign-off before final Round 15 aggregation commit.
            </p>

            <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-nested)', padding: '6px 10px', borderRadius: '4px', fontSize: '10px', marginBottom: '10px' }}>
              <span>Calculated L2-Norm: <strong style={{ color: 'var(--status-danger)' }}>17.42 (+16.1% over cap)</strong></span>
              <span>Aggregation Defense: <strong>Multi-Krum (m=1, k=6)</strong></span>
              <span>Isolated Tensor Hash: <code className="font-mono" style={{ color: '#38bdf8' }}>7c8b41...df01</code></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ fontSize: '10px' }} onClick={() => setActiveModal('quarantine')}>
                  Inspect Gradient Tensor
                </button>
                <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => alert('Sanitization approved.')}>
                  <Check size={11} />
                  <span>Approve Sanitize Action</span>
                </button>
                <button className="btn btn-danger" style={{ fontSize: '10px' }} onClick={() => alert('Kyoto node muted for 1 hour.')}>
                  Mute Node (1h)
                </button>
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Signed by FedAvg Overseer Daemon #04</span>
            </div>
          </div>

          {/* Card 2: Governance Approval Required */}
          <div className="card" style={{ border: '1px solid var(--status-warning-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-warning" style={{ fontSize: '9px' }}>
                  GOVERNANCE APPROVAL REQUIRED
                </span>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Node: Charité Berlin (ENC-BERLIN-01) • <strong style={{ color: 'var(--status-warning)' }}>Unread</strong>
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                2025-05-18 13:11:45 UTC
              </span>
            </div>

            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
              IRB Model Weights Export Request: Pan-Cancer Pulmo-3D v2.4 Checkpoint
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
              Lead Radiologist Dr. Markus Weber (Charité Universitätsmedizin Berlin) requested an export clearance for aggregated model checkpoint <code>CKPT-PULMO3D-R14.pt</code> to conduct external cross-scanner validation against 200 non-consortium CT examinations. Export policy requires hardware-backed token authorization.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => alert('Opening differential privacy expenditure log...')}>
                  Review Differential Privacy Log
                </button>
                <button className="btn btn-primary" style={{ fontSize: '10px' }} onClick={() => setActiveModal('exportWeights')}>
                  Sign with Hardware Token
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '10px' }}>Decline</button>
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>IRB Protocol: Charite-EA4-1029-23</span>
            </div>
          </div>

          {/* Card 3: DP Budget Warning */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                  DP BUDGET WARNING
                </span>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Experiment: Exp-FL-2025-084 • <strong style={{ color: 'var(--accent-teal)' }}>Unread</strong>
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                2025-05-18 11:04:12 UTC
              </span>
            </div>

            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
              Differential Privacy Budget Approaching Ceiling (ε = 1.24 / 1.50)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
              Cumulative privacy spend has consumed <strong>82.6%</strong> of allocated Rényi Differential Privacy (RDP) quota (δ = 1e-5). At the current Gaussian noise multiplier (σ = 0.85) and batch sampling ratio, the budget will exhaust entirely at Round 18.
            </p>

            <div style={{ background: 'var(--bg-nested)', padding: '6px 10px', borderRadius: '4px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
                <span>Rényi-DP Consumption Curve</span>
                <span className="font-mono" style={{ color: 'var(--accent-teal)' }}>ε = 1.2442 (Limit 1.50)</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '82.6%', height: '100%', background: '#f59e0b' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Rounds completed: 14/20</span>
                <span>Recommended: Increase batch size from 64 to 128 or lower clip norm to 1.0</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => setActiveScreen('training')}>
                Adjust DP Noise &amp; Clip Hyperparameters
              </button>
              <button className="btn btn-ghost" style={{ fontSize: '10px' }}>Dismiss Warning</button>
            </div>
          </div>

          {/* Card 4: Aggregation Quorum Reached */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-healthy" style={{ fontSize: '9px' }}>
                  AGGREGATION QUORUM
                </span>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Consortium Network Resolved
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                2025-05-18 08:45:00 UTC
              </span>
            </div>

            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
              Hospital Enclave Quorum Reached (8/8 Nodes) for Round 14
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
              All 8 participating clinical centers completed localized model fitting across a combined cohort of <strong>14,820</strong> annotated volumetric scans. Tensors transferred safely via mutual TLS 1.3 with AES-GCM 256-bit encryption. Zero raw patient telemetry migrated off hospital premises.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {['Johns Hopkins (2,100 scans)', 'Mayo Clinic (3,450 scans)', 'Charité Berlin (1,840 scans)', 'Mass General (2,010 scans)', 'Cleveland Clinic (1,920 scans)', 'Karolinska (1,150 scans)', 'UCSF (1,400 scans)', 'Tokyo Univ (950 scans)'].map((h, i) => (
                <span key={i} className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '9px' }}>
                  {h}
                </span>
              ))}
            </div>

            <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => setActiveScreen('training')}>
              View Round 14 Telemetry Visualizer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
