import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, FileCheck, CheckCircle2, KeyRound, ArrowLeft, Send } from 'lucide-react';

export const RequestAccessView = () => {
  const { setActiveScreen } = useApp();
  const [role, setRole] = useState('lead');
  const [tokenRegistered, setTokenRegistered] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas)',
      overflowY: 'auto'
    }}>
      {/* Top Banner */}
      <div style={{
        height: '36px',
        background: 'var(--bg-subcanvas)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        fontSize: '11px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-healthy)' }}>
          <ShieldCheck size={14} />
          <span><strong>INSTITUTIONAL VERIFICATION CHANNEL [ONLINE]</strong> :: GOV-SPEC-5441-REV3</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px' }} className="font-mono">
          <span>ENCLAVE ATTESTATION: <strong style={{ color: 'var(--status-healthy)' }}>SGX-V2 ACTIVE</strong></span>
          <span>CONSENSUS NODES: <strong style={{ color: '#38bdf8' }}>6 VERIFIED</strong></span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%', padding: '28px 24px' }}>
        {/* Header Block */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '20px'
        }}>
          <div>
            <div className="badge badge-blue" style={{ marginBottom: '6px' }}>
              FORM PROTOCOL // SEC-792-REQ AUTHORIZATION TIER 2
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
              Request Consortium Research Access
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Apply for federated deep learning training authorization across participating hospital enclave nodes.
            </p>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid var(--status-warning-border)',
            borderRadius: '6px',
            padding: '10px 14px',
            maxWidth: '340px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>SECURITY COUNCIL ATTESTATION</span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
              Account onboarding requires institutional email verification, IRB approval certificate, and Consortium Security Council approval.
            </p>
          </div>
        </div>

        {submitted ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--status-healthy-border)',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={48} color="var(--status-healthy)" style={{ marginBottom: '14px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Application Submitted Under Protocol SEC-792-REQ</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0 auto' }}>
              Your application has been cryptographically signed and routed to the Consortium Security Council. Estimated review time is 36 hours.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setActiveScreen('login')}>
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 01 */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">01. INVESTIGATOR IDENTITY &amp; INSTITUTION</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>ACADEMIC CREDENTIAL VALIDATION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    FULL ACADEMIC NAME &amp; DEGREE
                  </label>
                  <input
                    type="text"
                    defaultValue="Dr. Marcus Vance, M.D., Ph.D."
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    INSTITUTIONAL CLINICAL EMAIL <span style={{ color: 'var(--status-healthy)' }}>*Strictly .edu / .org</span>
                  </label>
                  <input
                    type="email"
                    defaultValue="vance@rad.jhmi.edu"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    SPONSORING INSTITUTION (FEDERATED PARTNER NODE)
                  </label>
                  <select style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}>
                    <option>Johns Hopkins Medicine (Node 0x9c31be)</option>
                    <option>Stanford Medicine (Node 0x01bf3a)</option>
                    <option>Charité - Universitätsmedizin Berlin</option>
                    <option>Mayo Clinic Rochester</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    CLINICAL NPI OR ACADEMIC ORCID ID
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      defaultValue="0000-0002-1825-0097"
                      style={{ flex: 1, height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                    />
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '11px' }}>
                      Verify Registry
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 02 */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">02. REQUESTED FEDERATED ROLE &amp; OPERATIONAL SCOPE</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>RBAC DELEGATION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { id: 'lead', title: 'Lead Investigator', sub: 'MODEL ARCHITECT & COORDINATOR', desc: 'Permits defining neural architectures, initiating FedAvg/FedProx rounds, orchestrating global aggregations.', scope: 'LEVEL 3' },
                  { id: 'co', title: 'Clinical Co-Investigator', sub: 'REVIEWER & BIOSTATISTICIAN', desc: 'Permits inspecting convergence trajectories, reviewing differential privacy loss metrics (ε, δ).', scope: 'LEVEL 2' },
                  { id: 'admin', title: 'Hospital Enclave Admin', sub: 'INFRASTRUCTURE & SECURITY', desc: 'Responsible for local PACS connectors, enclave eBPF firewalls, hardware SGX lifecycle on-premise.', scope: 'LEVEL 4' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setRole(item.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      background: role === item.id ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-nested)',
                      border: `1px solid ${role === item.id ? 'var(--brand-blue)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '12px' }}>{item.title}</strong>
                      <span className="badge badge-blue" style={{ fontSize: '9px' }}>{item.scope}</span>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--accent-teal)', fontWeight: '600', marginBottom: '6px' }}>{item.sub}</div>
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 03 */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">03. INSTITUTIONAL REVIEW BOARD (IRB) &amp; COMPLIANCE</span>
                <span className="badge badge-purple">HIPAA / GDPR BIO-ETHICS RECORD</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      ACTIVE IRB / ETHICS COMMITTEE PROTOCOL ID
                    </label>
                    <input
                      type="text"
                      defaultValue="IRB-2025-MED-8839-FED"
                      style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      IRB APPROVAL CERTIFICATE (.PDF WITH CRYPTOGRAPHIC SIGNATURE)
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: '34px',
                      background: 'var(--bg-nested)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '5px',
                      padding: '0 10px',
                      fontSize: '11px'
                    }}>
                      <span className="font-mono" style={{ color: 'var(--accent-teal)' }}>📄 irb_determination_signed_jhmi_2025.pdf</span>
                      <span style={{ color: 'var(--status-healthy)', fontSize: '10px' }}>SHA-256 Verified</span>
                    </div>
                  </div>
                </div>

                {/* Statutory Undertaking */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid var(--status-healthy-border)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <input type="checkbox" id="undertaking" defaultChecked style={{ marginTop: '3px', accentColor: 'var(--status-healthy)' }} />
                  <label htmlFor="undertaking" style={{ fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Statutory Non-Dissemination &amp; Zero-Raw-Data Protocol Undertaking:</strong> I certify under penalty of institutional disciplinary action and HIPAA/GDPR sanctions that all training rounds will execute exclusively via local containerized workers. Individual patient DICOM files, EHR notes, and genomic transcripts must NEVER exit institutional firewalls. Only securely aggregated, differential-privacy-injected model gradients (ε ≤ 0.5) will be transmitted to the central orchestrator.
                  </label>
                </div>
              </div>
            </div>

            {/* Section 04 */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">04. CRYPTOGRAPHIC IDENTITY &amp; KEY ENROLLMENT</span>
                <span className="badge badge-cyan">ED25519 / FIDO2 HARDWARE ATTESTATION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    PUBLIC SIGNING KEY (ED25519 OR RSA-4096)
                  </label>
                  <textarea
                    defaultValue="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOr8Y3e... vance@jhmi-enclave-lead"
                    rows="3"
                    className="font-mono"
                    style={{ width: '100%', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '8px', color: 'var(--text-primary)', fontSize: '11px', resize: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    HARDWARE SECURITY TOKEN (FIDO2 / WEBAUTHN)
                  </label>
                  <div style={{
                    padding: '14px',
                    borderRadius: '6px',
                    background: tokenRegistered ? 'var(--status-healthy-bg)' : 'var(--bg-nested)',
                    border: `1px solid ${tokenRegistered ? 'var(--status-healthy-border)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: 'calc(100% - 20px)'
                  }}>
                    <div style={{ fontSize: '11px', color: tokenRegistered ? 'var(--status-healthy)' : 'var(--text-secondary)' }}>
                      {tokenRegistered ? '✔ FIDO2 Hardware Token Registered (#YUBI-8839-FIPS)' : 'Mandatory: Touch YubiKey to enroll cryptographic hardware token'}
                    </div>
                    <button
                      type="button"
                      className={`btn ${tokenRegistered ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '11px', alignSelf: 'flex-start' }}
                      onClick={() => setTokenRegistered(true)}
                    >
                      <KeyRound size={12} />
                      <span>{tokenRegistered ? 'Re-enroll Key' : 'Register Security Key'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setActiveScreen('login')}
              >
                <ArrowLeft size={14} />
                <span>Return to Secure Login</span>
              </button>

              <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                <Send size={14} />
                <span>Submit Consortium Access Application</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
