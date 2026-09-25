import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Lock,
  Shield,
  KeyRound,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Save,
  RotateCcw,
  Copy
} from 'lucide-react';

export const SettingsView = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [noiseMultiplier, setNoiseMultiplier] = useState(0.85);
  const [clipNorm, setClipNorm] = useState(1.0);
  const [strategy, setStrategy] = useState('fedavg');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
            MedFL Engine / Consortium Governance / Settings &amp; Profile
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
              Platform Settings &amp; Investigator Profile
            </h1>
            <span className="badge badge-healthy font-mono" style={{ fontSize: '9px' }}>
              ● PRODUCTION ENCLAVE V2.4-STABLE
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">Discard Unsaved</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={12} />
            <span>{saved ? 'Saved Successfully!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px' }}>
        {/* Left Settings Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="card" style={{ padding: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-muted)', padding: '4px 6px' }}>
              WORKSPACE PREFERENCES
            </div>
            {[
              { id: 'profile', label: 'Profile & Credentials' },
              { id: 'protocols', label: 'Consortium & IRB Protocols' },
              { id: 'hyperparams', label: 'FL Hyperparameter Defaults' },
              { id: 'privacy', label: 'Differential Privacy Engine' },
              { id: 'keys', label: 'Cryptographic Keys & HSM', badge: 'FIPS 140-3' },
              { id: 'network', label: 'Enclave Network & mTLS' },
              { id: 'hooks', label: 'Notifications & Slurm Hooks' },
              { id: 'export', label: 'Audit & Compliance Export' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: activeTab === item.id ? 'var(--brand-blue)' : 'transparent',
                  color: activeTab === item.id ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: activeTab === item.id ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px'
                }}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: '8px', background: 'rgba(16,185,129,0.15)', color: 'var(--status-healthy)', padding: '1px 4px', borderRadius: '3px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{
            background: 'var(--bg-nested)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '10px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-healthy)', fontWeight: '600', marginBottom: '4px' }}>
              <Lock size={12} />
              <span>ZERO-TRUST PROTOCOL</span>
            </div>
            <p style={{ lineHeight: 1.35 }}>
              Local node policy strictly disallows transmission of unmasked weights and raw patient records.
            </p>
          </div>
        </div>

        {/* Right Settings Body */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Investigator Capsule */}
          <div className="card" style={{ background: 'var(--bg-nested)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-strong)' }}>
                  <span style={{ fontWeight: '700', color: '#ffffff' }}>ER</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13px' }}>{currentUser.shortName}</strong>
                    <span className="badge badge-blue" style={{ fontSize: '9px' }}>Lead Investigator</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Stanford Medicine AI Lab &amp; Consortium Lead</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span className="badge badge-healthy" style={{ fontSize: '8px' }}>✔ Hardware Root of Trust: TPM 2.0 Active</span>
                    <span className="badge badge-purple" style={{ fontSize: '8px' }}>Consortium Admin</span>
                    <span className="badge" style={{ fontSize: '8px', background: 'rgba(255,255,255,0.06)' }}>IRB Signoff Authority: Grade A</span>
                  </div>
                </div>
              </div>

              <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                CREDENTIAL EXPIRY: 2026-11-30T00:00:00Z
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Identity &amp; Cryptographic Keys</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>FULL ACADEMIC LEGAL NAME</label>
                <input
                  type="text"
                  defaultValue="Elena Rostova, M.D., Ph.D."
                  style={{ width: '100%', height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', color: 'var(--text-primary)', fontSize: '11px' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>INSTITUTIONAL CLINICAL EMAIL</label>
                <input
                  type="email"
                  defaultValue="e.rostova@med.stanford.edu"
                  style={{ width: '100%', height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', color: 'var(--text-primary)', fontSize: '11px' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>DEPARTMENT / OPERATIONAL DIVISION</label>
                <input
                  type="text"
                  defaultValue="Center for Biomedical Informatics & Quantitative Oncology"
                  style={{ width: '100%', height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', color: 'var(--text-primary)', fontSize: '11px' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>HARDWARE SECURITY KEY TOKEN</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--status-healthy-border)', borderRadius: '4px', padding: '0 8px', color: 'var(--status-healthy)', fontSize: '11px' }}>
                  <span>🔒 YubiKey 5 FIPS — Serial: #8839-4029-A (Validated)</span>
                  <KeyRound size={13} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                PGP / ECDSA PUBLIC KEY FINGERPRINT (FEDERATED COORDINATOR SIGNATURE)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '6px 10px' }}>
                <code className="font-mono" style={{ fontSize: '10px', color: '#38bdf8' }}>
                  SHA1:3E:99:A2:81:76:BC:54:19:62:00:EE:81:9F:34:1B:CC:90:DE:88:F2
                </code>
                <button type="button" className="btn btn-ghost" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={() => alert('PGP key fingerprint copied.')}>
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Federated Training & Privacy Default Preferences */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Federated Training &amp; Privacy Default Preferences</span>
            </div>

            {/* Strict Mode Toggle - HARD LOCKED */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid var(--status-healthy-border)',
              borderRadius: '6px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--status-healthy)' }}>
                  <CheckCircle size={14} />
                  <span>Zero-Raw-Data Strict Mode</span>
                  <span className="badge badge-healthy" style={{ fontSize: '8px' }}>Consortium Mandate</span>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Prevent any orchestration process from requesting raw DICOMs, slice pixel payloads, or unmasked patient metadata across hospital nodes.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-healthy" style={{ fontSize: '9px' }}>HARD-LOCKED (IMMUTABLE)</span>
                <input type="checkbox" defaultChecked disabled style={{ accentColor: 'var(--status-healthy)', width: '16px', height: '16px' }} />
              </div>
            </div>

            {/* Hyperparameter Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '11px' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>DEFAULT AGGREGATION STRATEGY</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '4px' }}>
                  {[
                    { id: 'fedavg', label: 'FedAvg + Adaptive Clip' },
                    { id: 'fedprox', label: 'FedProx (μ=0.01)' },
                    { id: 'scaffold', label: 'SCAFFOLD' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStrategy(s.id)}
                      className={`btn ${strategy === s.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '10px', padding: '4px' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>PRIVACY ENGINE FORMULATION</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '32px',
                  background: 'var(--bg-nested)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0 8px',
                  color: 'var(--text-primary)'
                }}>
                  <span>Rényi Differential Privacy (RDP - Gaussian)</span>
                  <Lock size={12} color="var(--text-muted)" />
                </div>
              </div>

              {/* Slider 1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>DEFAULT NOISE MULTIPLIER (σ)</span>
                  <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>{noiseMultiplier} σ</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={noiseMultiplier}
                  onChange={(e) => setNoiseMultiplier(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>L2 GRADIENT CLIPPING NORM (C)</span>
                  <strong className="font-mono" style={{ color: 'var(--status-healthy)' }}>C = {clipNorm.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={clipNorm}
                  onChange={(e) => setClipNorm(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--status-healthy)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>MAX PRIVACY BUDGET CAP (ε PER TRIAL)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.05"
                    defaultValue="1.50"
                    style={{ flex: 1, height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', color: 'var(--text-primary)', fontSize: '11px' }}
                  />
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>at δ = 1e-5</span>
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>MODEL WEIGHT DIFF COMPRESSION</label>
                <select style={{ width: '100%', height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', color: 'var(--text-primary)', fontSize: '11px' }}>
                  <option>FP16 Top-K Sparsification (k=0.10)</option>
                  <option>INT8 Quantization (Zero-Bias)</option>
                  <option>Full Precision FP32 (Uncompressed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enclave Session & Security Guardrails */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Enclave Session &amp; Security Guardrails</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '11px' }}>
              <div style={{ background: 'var(--bg-nested)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>INACTIVITY LOCK</span>
                <select style={{ width: '100%', height: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 6px', color: 'var(--text-primary)', fontSize: '10px', marginTop: '4px' }}>
                  <option>15 minutes (Mandatory)</option>
                  <option>30 minutes</option>
                  <option>60 minutes</option>
                </select>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Locks keys in TPM memory</div>
              </div>

              <div style={{ background: 'var(--bg-nested)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>HARDWARE ATTESTATION</span>
                <select style={{ width: '100%', height: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 6px', color: 'var(--text-primary)', fontSize: '10px', marginTop: '4px' }}>
                  <option>Every 6 hours (Consortium Std)</option>
                  <option>Every 12 hours</option>
                  <option>Every 24 hours</option>
                </select>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>SGX/SEV quote re-verification</div>
              </div>

              <div style={{ background: 'var(--bg-nested)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>2FA / WEBAUTHN</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '30px', background: 'var(--bg-card)', border: '1px solid var(--status-healthy-border)', borderRadius: '4px', padding: '0 8px', color: 'var(--status-healthy)', fontSize: '10px', marginTop: '4px' }}>
                  <span>FIDO2 Token Required</span>
                  <CheckCircle size={12} />
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Fallback SMS/TOTP disabled</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Configuration Hash: <code style={{ color: '#38bdf8' }}>6x4c8a...90be</code> • Signed by Stanford Health Root CA
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary">
                <RotateCcw size={12} />
                <span>Reset to Consortium Default</span>
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={12} />
                <span>Save All Preferences</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
