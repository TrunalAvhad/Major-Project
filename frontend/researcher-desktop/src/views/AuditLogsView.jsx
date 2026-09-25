import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  ShieldCheck,
  Download,
  Copy,
  Check,
  CheckCircle,
  RotateCw,
  Search,
  Lock,
  Code
} from 'lucide-react';

export const AuditLogsView = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState('EVT-90412');
  const [copied, setCopied] = useState(false);

  const auditEvents = [
    {
      id: 'EVT-90412',
      time: '2025-02-24 09:42:15.892',
      actor: 'Dr. Elena Rostova',
      origin: '(Stanford Hub)',
      role: 'Lead Researcher',
      category: 'MODEL_AGGREGATE',
      target: 'EfficientNet-B0-FL v2.4 (Round 14)',
      outcome: 'SUCCESS',
      ip: '171.64.68.10 (Stanford VPN)'
    },
    {
      id: 'EVT-90411',
      time: '2025-02-24 09:40:02.114',
      actor: 'Automated Orchestrator',
      origin: '',
      role: 'Enclave Agent',
      category: 'ENCLAVE_ATTEST',
      target: 'Intel SGX Quote #882-Enclave-Prod',
      outcome: 'VERIFIED',
      ip: 'Internal Enclave RPC'
    },
    {
      id: 'EVT-90410',
      time: '2025-02-24 09:37:44.901',
      actor: 'Charité Berlin Edge Node',
      origin: '',
      role: 'Enclave Agent',
      category: 'PARAM_NOISE_INJECT',
      target: 'RDP Engine (ε=1.24, δ=1e-5)',
      outcome: 'VERIFIED',
      ip: '141.20.1.1 (Charité GW)'
    },
    {
      id: 'EVT-90409',
      time: '2025-02-24 09:28:19.450',
      actor: 'Security Key Vault',
      origin: '',
      role: 'System Admin',
      category: 'MTLS_HANDSHAKE',
      target: 'mTLS Intermediate CA #4',
      outcome: 'SUCCESS',
      ip: '128.12.0.44 (HSM Cluster)'
    },
    {
      id: 'EVT-90408',
      time: '2025-02-24 09:15:32.008',
      actor: 'Kyoto Univ Hospital Node',
      origin: '',
      role: 'Enclave Agent',
      category: 'WEIGHT_CHECKPOINT',
      target: 'Local Gradients L2 Norm > 15.0',
      outcome: 'FLAGGED & CLAMPED',
      ip: '133.3.241.8 (Kyoto Med)'
    },
    {
      id: 'EVT-90407',
      time: '2025-02-24 08:59:12.781',
      actor: 'Marcus Vance (Ops)',
      origin: '',
      role: 'System Admin',
      category: 'POLICY_OVERRIDE',
      target: 'Enclave Heartbeat Timeout: 120s -> 180s',
      outcome: 'SUCCESS',
      ip: '192.168.10.15 (Internal)'
    }
  ];

  const payloadJson = `{
  "ledger_block_index": 1842910,
  "transaction_id": "tx_90412_f0b1220a",
  "event_type": "FEDERATED_MODEL_AGGREGATE_COMMIT",
  "round_sequence": 14,
  "model_meta": {
    "architecture": "EfficientNet-B0-FL",
    "weights_sha256": "7e014a06bcb021e90ef818274acbb105e608031d2551a9298bb3c19f50011bc34",
    "tensor_count": 218,
    "floating_point_format": "IEEE-754_float32",
    "payload_bytes": 48291040
  },
  "privacy_differential": {
    "mechanism": "Renyi-DP",
    "current_epsilon": 1.24,
    "budget_cap": 1.50,
    "delta": 1e-05,
    "l2_clip_threshold": 1.0
  },
  "participating_enclaves": [
    { "enclave_id": "ENC-STANFORD-01", "contribution_weight": 0.38, "status": "ATTESTED_SGX2" },
    { "enclave_id": "ENC-CHARITE-04",  "contribution_weight": 0.34, "status": "ATTESTED_SGX2" },
    { "enclave_id": "ENC-KYOTO-02",    "contribution_weight": 0.28, "status": "ATTESTED_SGX2" }
  ],
  "governance_signatures": {
    "investigator_id": "did:medfl:elena-rostova",
    "cert_thumbprint": "SHA1:3E:99:A2:81:76:BC:54:19:62:00:EE:81",
    "tsa_timestamp": "2025-02-24T09:42:15.892019Z",
    "merkle_parent_hash": "0x4a129ef993a491c109288bb01948810c9b91024419aa12384910efcba19099ff"
  }
}`;

  const copyPayload = () => {
    navigator.clipboard?.writeText(payloadJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--brand-blue)" />
            <span>Cryptographic Audit Trail &amp; Governance Ledger</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Append-only SHA-256 chained transaction log verifying all federated operations, weight updates, and role authorizations under immutable consensus.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
            <button className="btn btn-ghost" style={{ fontSize: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              Live Stream
            </button>
            <button className="btn btn-ghost" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Historical Query
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => alert('Displaying Certified Ledger directly in application session audit inspector.')}>
            <Download size={13} />
            <span>View Certified Ledger</span>
          </button>
        </div>
      </div>

      {/* Merkle Height Status Bar */}
      <div style={{
        background: 'var(--bg-nested)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot healthy" />
            <span>Ledger Height: <strong className="font-mono" style={{ color: 'var(--status-healthy)' }}>#1,842,910</strong></span>
          </div>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Merkle Root:</span>
            <code className="font-mono" style={{ color: '#38bdf8' }}>0x9f8e4a2d810c97b8...12c8</code>
            <Copy size={12} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => alert('Merkle root hash copied.')} />
          </div>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>Status: <strong style={{ color: 'var(--status-healthy)' }}>Unbroken Block Chain (100%)</strong></span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="badge badge-healthy" style={{ fontSize: '9px' }}>HIPAA §164.312(b) OK</span>
          <span className="badge badge-purple" style={{ fontSize: '9px' }}>GDPR CH.5 ENCLAVE VERIFIED</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ position: 'relative', width: '360px' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '9px' }} />
            <input
              type="text"
              placeholder="Filter by actor, SHA hash, event ID, resource..."
              style={{ width: '100%', height: '30px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px 0 28px', fontSize: '11px', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {['All Events', 'Security Checks', 'Model Aggregations', 'Admin Overrides'].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(tab)}
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '10px', padding: '4px 8px' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>1,248</strong> verifiable records
        </div>
      </div>

      {/* Audit Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="fl-table">
          <thead>
            <tr>
              <th>TIMESTAMP (UTC)</th>
              <th>EVENT ID</th>
              <th>ACTOR / SOVEREIGN ORIGIN</th>
              <th>ROLE</th>
              <th>ACTION CATEGORY</th>
              <th>RESOURCE TARGET</th>
              <th>OUTCOME</th>
              <th>IP ORIGIN</th>
            </tr>
          </thead>
          <tbody>
            {auditEvents.map((ev) => {
              const isSelected = selectedEventId === ev.id;
              return (
                <tr
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--brand-blue)' : '3px solid transparent'
                  }}
                >
                  <td className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.time}</td>
                  <td>
                    <code className="font-mono" style={{ color: '#38bdf8', fontWeight: '600' }}>{ev.id}</code>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500' }}>{ev.actor}</span>{' '}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.origin}</span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', fontSize: '9px' }}>{ev.role}</span>
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: '10px', color: '#818cf8' }}>{ev.category}</span>
                  </td>
                  <td style={{ fontSize: '11px' }}>{ev.target}</td>
                  <td>
                    <span className={`badge ${ev.outcome === 'FLAGGED & CLAMPED' ? 'badge-warning' : 'badge-healthy'}`} style={{ fontSize: '9px' }}>
                      {ev.outcome}
                    </span>
                  </td>
                  <td className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cryptographic Payload Inspector Drawer */}
      <div className="card" style={{ background: 'var(--bg-nested)', border: '1px solid var(--border-strong)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--status-healthy)" />
              <strong style={{ fontSize: '13px' }}>Cryptographic Payload Inspector: {selectedEventId}</strong>
              <span className="badge badge-healthy" style={{ fontSize: '9px' }}>Verified Merkle Node</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Full immutable record, digital certificate path, zero-raw-data compliance verification.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => alert('Signature verified against root trust chain.')}>
              <RotateCw size={11} />
              <span>Re-verify Signature</span>
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={copyPayload}>
              {copied ? <Check size={11} color="var(--status-healthy)" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy Payload JSON'}</span>
            </button>
          </div>
        </div>

        {/* Guarantees Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-healthy)', fontWeight: '600', fontSize: '11px' }}>
              <CheckCircle size={13} />
              <span>Zero-Raw-Data (PHI / DICOM) Integrity Guarantee</span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
              Automated deep entropy analysis confirms zero Protected Health Information (PHI) or unmasked patient DICOM headers. Payload strictly confined to encrypted IEEE-754 float32 aggregated weight tensors (Size: 48,291,040 bytes).
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-blue)', fontWeight: '600', fontSize: '11px' }}>
              <Lock size={13} />
              <span>Cryptographic Signature &amp; Enclave Seal</span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
              Digitally signed via ECDSA (secp256r1) with Root Certificate Authority CN=MedFL-Trust-Chain-2025. Key fingerprint cross-checked against Stanford Enclave Hardware TPM.
            </p>
          </div>
        </div>

        {/* Split JSON & Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
          {/* JSON Block */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '6px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>
              <span>ATTESTATION_PAYLOAD.JSON</span>
              <span style={{ color: 'var(--status-healthy)' }}>SHA-256 Verified Match</span>
            </div>
            <pre style={{
              padding: '12px',
              fontSize: '11px',
              lineHeight: 1.4,
              fontFamily: 'var(--font-mono)',
              color: '#38bdf8',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {payloadJson}
            </pre>
          </div>

          {/* Ledger Summary */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                CONSORTIUM ATTESTATION LEDGER
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Federated Round:</span>
                  <strong className="font-mono">14 / 20</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nodes in Quorum:</span>
                  <strong className="font-mono" style={{ color: 'var(--status-healthy)' }}>3 / 3 (100%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Privacy Budget:</span>
                  <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>ε = 1.24 (Safe)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>L2 Norm Gradient:</span>
                  <strong className="font-mono">0.841 &lt; 1.00</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Hardware Enclave:</span>
                  <strong>Intel SGX2 FIPS</strong>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '10px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>COMPLIANCE SIGNOFF</div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                IRB Protocol #STAN-2024-AI-09. All weight increments comply with multi-center non-disclosive federated averaging standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
