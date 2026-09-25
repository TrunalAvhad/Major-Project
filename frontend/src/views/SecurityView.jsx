import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ByzantineVectorSpace } from '../components/charts/ByzantineVectorSpace';
import { PrivacyGauge } from '../components/charts/PrivacyGauge';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  FileCheck,
  Radio,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Zap,
  Terminal
} from 'lucide-react';

export const SecurityView = () => {
  const { setActiveModal, privacyMetrics } = useApp();
  const [severityFilter, setSeverityFilter] = useState('all');

  const securityEvents = [
    {
      id: 'SEC-8921',
      time: '09:42:15 UTC',
      source: 'Central Aggregator',
      classification: 'Round 14 Weight DP Noise Addition (σ=0.85)',
      severity: 'INFO',
      status: 'Enforced',
      sig: '0x8a92...fc10'
    },
    {
      id: 'SEC-8920',
      time: '09:40:02 UTC',
      source: 'Mayo Clinic Rochester',
      classification: 'mTLS Certificate Re-Verification',
      severity: 'INFO',
      status: 'Verified',
      sig: '0x3fa...819'
    },
    {
      id: 'SEC-8919',
      time: '09:35:10 UTC',
      source: 'Charité Univ. Berlin',
      classification: 'High Gradient Norm Spike (Clamped to L2=1.0)',
      severity: 'WARNING',
      status: 'Clipped & Mitigated',
      sig: '0xec7...990'
    },
    {
      id: 'SEC-8918',
      time: '09:12:08 UTC',
      source: 'Tokyo Univ Hospital',
      classification: 'Socket Reconnect Handshake Latency Spike',
      severity: 'WARNING',
      status: 'Recovered (238ms)',
      sig: '0x821...bc9'
    },
    {
      id: 'SEC-8917',
      time: '08:30:12 UTC',
      source: 'Stanford Admin Portal',
      classification: 'Security Session Initiated by Dr. Elena Rostova',
      severity: 'INFO',
      status: 'MFA Authenticated',
      sig: '0xdd4...112'
    },
    {
      id: 'SEC-8916',
      time: '08:00:00 UTC',
      source: 'Central Node',
      classification: 'Automated TPM 2.0 Firmware Attestation Sweep',
      severity: 'INFO',
      status: 'All 8 Nodes Passed',
      sig: '0xfe3...901'
    }
  ];

  const filteredEvents = securityEvents.filter((ev) => {
    if (severityFilter === 'all') return true;
    if (severityFilter === 'warning') return ev.severity === 'WARNING';
    if (severityFilter === 'info') return ev.severity === 'INFO';
    return true;
  });

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-healthy font-mono" style={{ fontSize: '9px' }}>
              DEFENSE SHIELD LEVEL 4 : ARMED
            </span>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              TPM 2.0 HARDWARE ROOT OF TRUST
            </span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
            Security, Byzantine Defense &amp; Zero-Raw-Data Shield
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Cryptographic Attestation • Multi-Krum Poisoning Mitigation • Differential Privacy Budget Ledger
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => alert('Triggering automated Byzantine stress injection test...')}>
            <Zap size={13} color="var(--status-warning)" />
            <span>Trigger Byzantine Stress Test</span>
          </button>
          <button className="btn btn-secondary" onClick={() => alert('Cryptographic audit proof exported to local verifiable keystore.')}>
            <FileCheck size={13} />
            <span>Export Cryptographic Audit Proof</span>
          </button>
          <button className="btn btn-primary" onClick={() => alert('Rotating enclave ephemeral session keys across 8 nodes.')}>
            <RotateCw size={13} />
            <span>Rotate Enclave Keys</span>
          </button>
        </div>
      </div>

      {/* Security Status Banner */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid var(--status-healthy-border)',
        borderRadius: '6px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-healthy)', fontWeight: '700' }}>
            <ShieldCheck size={16} />
            <span>SECURITY LEVEL: OPTIMAL</span>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>8/8 Enclaves Attested • Zero Poisoned Updates</span>
          <span style={{ color: 'var(--accent-teal)' }}>Differential Privacy Active (ε=1.24/1.50 Max Ceiling + σ=0.85 Gaussian)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>CONSENSUS INTEGRITY: <strong className="font-mono" style={{ color: 'var(--status-healthy)' }}>99.98%</strong></span>
          <span className="badge badge-healthy" style={{ fontSize: '9px' }}>● ZERO-INGRESS AIR-GAP</span>
        </div>
      </div>

      {/* 4 Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>BYZANTINE DEFENSE FILTER</span>
            <span className="badge badge-healthy" style={{ fontSize: '8px' }}>ONLINE</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--status-healthy)' }}>
            PASS <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(0 Quarantined)</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-Krum Outlier Elimination
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Filter Param (m = 3/8)</span>
            <span style={{ color: 'var(--status-healthy)' }}>Passed</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>DP NOISE INJECTION</span>
            <span className="badge badge-cyan" style={{ fontSize: '8px' }}>ENFORCED</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--accent-teal)' }} className="font-mono">
            ε = 1.24 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>δ = 1e-5</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gaussian Mechanism (RDP)
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Noise σ = 0.85</span>
            <span>Clipping L2 = 1.0</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>TRANSPORT PROTOCOL</span>
            <span className="badge badge-blue font-mono" style={{ fontSize: '8px' }}>TLS 1.3</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
            mTLS Strict
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            TPM 2.0 Remote Quote Attested
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Hardware Enclaves</span>
            <span style={{ color: 'var(--status-healthy)' }}>Attested</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>ZERO-RAW-DATA POLICY</span>
            <span className="badge badge-healthy" style={{ fontSize: '8px' }}>LOCKED</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--status-healthy)' }}>
            100% Verified
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Local PACS Isolation
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Egress Filters:</span>
            <span style={{ color: 'var(--status-healthy)' }}>0 B Raw DICOM</span>
          </div>
        </div>
      </div>

      {/* 2 Central Visualizers: Byzantine Vector Space & Privacy Budget Dial */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Byzantine Vector Space &amp; Cosine Distance Matrix</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Multi-Krum Gradient Directional Alignment versus Consensus Barycenter (Round 14 Aggregate)
              </div>
            </div>
          </div>
          <ByzantineVectorSpace />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Privacy Budget (RDP) Tracker</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Cumulative (ε, δ)-Differential Privacy Tracker (HIPAA / GDPR)
              </div>
            </div>
          </div>
          <PrivacyGauge value={privacyMetrics.epsilon} max={privacyMetrics.maxEpsilon} delta={privacyMetrics.delta} />
        </div>
      </div>

      {/* Real-Time Security Events Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title">Real-Time Security Events &amp; Intrusion Defense Log</div>
            <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              Immutable SHA-256 Ledger • TPM Hardware Attestation Stream
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'all', label: 'ALL (6)' },
              { id: 'info', label: 'NORMAL (4)' },
              { id: 'warning', label: 'WARNING (2)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSeverityFilter(f.id)}
                className={`btn ${severityFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '10px', padding: '3px 8px' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <table className="fl-table">
          <thead>
            <tr>
              <th>EVENT ID</th>
              <th>TIMESTAMP</th>
              <th>NODE / SOURCE</th>
              <th>EVENT CLASSIFICATION</th>
              <th>SEVERITY</th>
              <th>MITIGATION STATUS</th>
              <th>AUDIT SIGNATURE</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <code className="font-mono" style={{ color: '#38bdf8' }}>{ev.id}</code>
                </td>
                <td className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.time}</td>
                <td style={{ fontWeight: '500' }}>{ev.source}</td>
                <td>{ev.classification}</td>
                <td>
                  <span className={`badge ${ev.severity === 'WARNING' ? 'badge-warning' : 'badge-healthy'}`} style={{ fontSize: '9px' }}>
                    {ev.severity}
                  </span>
                </td>
                <td>
                  <span style={{ color: ev.severity === 'WARNING' ? 'var(--status-warning)' : 'var(--status-healthy)', fontSize: '11px' }}>
                    {ev.status}
                  </span>
                </td>
                <td>
                  <code className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.sig}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom 8 Node Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span>DISTRIBUTED HOSPITAL ENCLAVE FLEET (8 NODES)</span>
          <span style={{ color: 'var(--status-healthy)' }}>✔ 100% Cryptographically Verified</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { name: 'Mayo Clinic (Node 01)', tpm: 'TPM: v2.0 Valid', cos: '0.988', batch: '64 (CT Angio)', lat: '18ms', lock: 'SGX Locked' },
            { name: 'Johns Hopkins (Node 02)', tpm: 'TPM: v2.0 Valid', cos: '0.976', batch: '48 (Brain MRI)', lat: '24ms', lock: 'SGX Locked' },
            { name: 'Charité Berlin (Node 03)', tpm: 'TPM: v2.0 Valid', cos: '0.952', batch: '64 (Mammo)', lat: '88ms', lock: 'Norm Clipped' },
            { name: 'Tokyo Univ (Node 08)', tpm: 'TPM: v2.0 Valid', cos: '0.958', batch: '32 (Cardio CT)', lat: '142ms', lock: 'SGX Locked' },
          ].map((c, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-nested)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{c.name}</strong>
                <span className="pulse-dot healthy" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>{c.tpm}</span>
                <span className="font-mono" style={{ color: 'var(--status-healthy)' }}>cos {c.cos}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '2px', fontSize: '9px' }}>
                <span>Batch: {c.batch}</span>
                <span style={{ color: c.lock === 'Norm Clipped' ? 'var(--status-warning)' : 'var(--accent-teal)' }}>{c.lock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
