import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  Award,
  KeyRound,
  Download,
  Copy,
  ExternalLink,
  Lock,
  Building2,
  CheckCircle,
  FileText
} from 'lucide-react';

export const ProfileView = () => {
  const { currentUser } = useApp();

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
            Consortium Directory / Investigators / Dr. Elena Rostova
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
              Investigator Profile &amp; Academic Credentials
            </h1>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>
              ● TPM 2.0 HARDWARE ROOT VERIFIED
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">
            <span>Edit Bio / Affiliations</span>
          </button>
          <button className="btn btn-secondary">
            <KeyRound size={12} />
            <span>Rotate FIDO2 Security Key</span>
          </button>
          <button className="btn btn-primary" onClick={() => alert('Displaying IRB Signoff Dossier directly in verified profile credential view.')}>
            <Download size={12} />
            <span>View IRB Signoff Dossier</span>
          </button>
        </div>
      </div>

      {/* Profile Identity Card */}
      <div className="card" style={{ background: 'linear-gradient(180deg, #131b2e 0%, #0d1425 100%)' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e293b, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border-strong)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
          }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>ER</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>{currentUser.name}</h2>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ORCID: {currentUser.orcid}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>
              {currentUser.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {currentUser.affiliation}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>NIH R01 CO-INVESTIGATOR</span>
              <span className="badge badge-purple">IRB PROTOCOL LEAD #IRB-STAN-2024-91</span>
              <span className="badge badge-blue">CONSORTIUM ADMIN TIER-1</span>
              <span className="badge badge-healthy">ZERO-RAW-DATA ATTESTED</span>
            </div>
          </div>
        </div>

        {/* Public Key Strip */}
        <div style={{
          marginTop: '14px',
          padding: '8px 12px',
          background: 'var(--bg-nested)',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ color: 'var(--text-muted)' }}>ED25519 PUBKEY:</span>
            <code className="font-mono" style={{ color: '#38bdf8' }}>{currentUser.keyId}</code>
          </div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '10px', padding: '2px 6px' }}
            onClick={() => alert('Public signing key copied to clipboard.')}
          >
            <Copy size={11} />
            <span>COPY KEY</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Academic Credentials & Enrolled Trials */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        {/* Left: Academic & Clinical Credentials */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Academic &amp; Clinical Credentials</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>Active Status</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Medical License &amp; NPI:</span>
              <strong className="font-mono">{currentUser.npi}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Institutional SSO:</span>
              <span>Stanford Health Care AD (Federated Okta + Duo Health)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Hardware FIPS Token:</span>
              <span className="badge badge-healthy font-mono" style={{ fontSize: '9px' }}>{currentUser.fipsToken}</span>
            </div>
            <div style={{ marginTop: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Research Focus:</span>
              <p style={{ fontSize: '11px', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                Multi-organ CT/MRI federated segmentation, differential privacy budget optimization (ε ≤ 1.5), and non-IID domain adaptation in distributed clinical oncology imaging.
              </p>
            </div>
            <div style={{
              marginTop: '6px',
              padding: '6px 8px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid var(--status-healthy-border)',
              borderRadius: '4px',
              fontSize: '10px',
              color: 'var(--status-healthy)'
            }}>
              ✔ Attestation: Model weights strictly decrypted inside secure hardware enclave (TEE). Raw patient scans never leave local site firewalls.
            </div>
          </div>
        </div>

        {/* Right: Federated Research Trials */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Federated Research Trials</span>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>3 Enrolled Trials</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'var(--bg-nested)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600' }}>
                <span>Pan-Cancer Pulmo-3D Segmentation</span>
                <span className="badge badge-healthy" style={{ fontSize: '8px' }}>Round 14/20</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Role: Lead PI • FedAvg • 8 Connected Nodes • Budget: ε=1.24
              </div>
            </div>

            <div style={{ background: 'var(--bg-nested)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600' }}>
                <span>Multi-Center Glioblastoma MRI</span>
                <span className="badge badge-blue" style={{ fontSize: '8px' }}>Completed</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Role: Co-Investigator • FedProx • 8 Connected Nodes • Round 25/25
              </div>
            </div>

            <div style={{ background: 'var(--bg-nested)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600' }}>
                <span>Pediatric Pneumonia Radiograph Screening</span>
                <span className="badge badge-warning" style={{ fontSize: '8px' }}>Paused</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Role: Advisory Auditor • SCAFFOLD • 6 Hospitals • Awaiting IRB Addendum
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Node Delegation & IRB Scope Matrix */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="card-title">Hospital Node Delegation &amp; IRB Scope Matrix</span>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              Scope strictly limited to gradient aggregation validation. Zero access to patient PACS/EHR.
            </div>
          </div>
          <span className="badge badge-healthy" style={{ fontSize: '9px' }}>8 Nodes Federated</span>
        </div>

        <table className="fl-table">
          <thead>
            <tr>
              <th>CLINICAL CENTER</th>
              <th>DELEGATION SCOPE</th>
              <th>RAW PATIENT DATA</th>
              <th>GRADIENT VALIDATION</th>
              <th>IRB PROTOCOL REF</th>
              <th>ATTESTATION KEY</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Stanford Medicine', id: 'Node-US-WEST-01', scope: 'Full Coordinator & Host PI', raw: 'BLOCKED (By Protocol)', grad: 'Full Model Signing', ref: 'IRB-STAN-2024-91', key: '0x9B2D...7BC9' },
              { name: 'Johns Hopkins Medicine', id: 'Node-US-EAST-04', scope: 'Full Coordinator & Aggregation Lead', raw: 'BLOCKED (By Protocol)', grad: 'Consensus Signer', ref: 'JHM-IRB-003891', key: '0x4F12...884A' },
              { name: 'Charité – Universitätsmedizin Berlin', id: 'Node-EU-CENTRAL-02', scope: 'Co-PI & Gradient Validator', raw: 'BLOCKED (GDPR Art. 9)', grad: 'Gradient Validation Only', ref: 'CHAR-ETHIK-2023-44', key: '0x88CC...10EF' },
              { name: 'Mayo Clinic Rochester', id: 'Node-US-MIDWEST-02', scope: 'Signed Model Consumer', raw: 'BLOCKED (By Protocol)', grad: 'Inference Verification', ref: 'MAYO-MCR-22019', key: '0x110A...D349' },
            ].map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ fontWeight: '600' }}>{row.name}</div>
                  <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{row.id}</div>
                </td>
                <td>
                  <span className="badge badge-blue" style={{ fontSize: '9px' }}>{row.scope}</span>
                </td>
                <td>
                  <strong style={{ color: 'var(--status-danger)', fontSize: '10px' }}>{row.raw}</strong>
                </td>
                <td style={{ color: 'var(--status-healthy)' }}>{row.grad}</td>
                <td className="font-mono" style={{ fontSize: '10px' }}>{row.ref}</td>
                <td>
                  <code className="font-mono" style={{ fontSize: '9px', color: '#38bdf8' }}>{row.key}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
