import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Network, Lock, ShieldCheck, KeyRound, Check, ChevronDown, Terminal, AlertCircle, Loader2 } from 'lucide-react';

export const LoginView = () => {
  const { login, setActiveScreen } = useApp();
  const [authMethod, setAuthMethod] = useState('fido2'); // 'fido2' | 'totp' | 'mtls'
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('e.rostova@med.stanford.edu');
  const [passphrase, setPassphrase] = useState('researcher123');
  const [selectedRole, setSelectedRole] = useState('researcher');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rememberMe, setRememberMe] = useState(true);
  const [idp, setIdp] = useState('Stanford Medicine / Health Care SSO');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      await login(email, passphrase, selectedRole, rememberMe);
    } catch (err) {
      if (err.available_roles) {
        setAvailableRoles(err.available_roles);
      }
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas)',
      overflowY: 'auto'
    }}>
      {/* Top Security Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot healthy" />
            <span style={{ color: 'var(--status-healthy)', fontWeight: '600' }}>CONSORTIUM NETWORK: ENCLAVE-ACTIVE</span>
          </div>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span className="font-mono">TLS 1.3 mTLS VERIFIED</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--status-healthy)' }}>
            <ShieldCheck size={13} />
            <span style={{ fontWeight: '600' }}>ZERO-RAW-DATA PROTOCOL ENFORCED</span>
          </div>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>SYS-AUTH-NODE // v4.18.2</span>
        </div>
      </div>

      {/* Main Authentication Center */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)'
            }}>
              <Network size={22} color="#ffffff" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>
                MedFL<span style={{ color: 'var(--brand-blue)' }}>.Secure</span>
              </h1>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>v4.18-SGX</span>
            </div>

            <div style={{ marginTop: '4px' }}>
              <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                RESEARCHER &amp; CONSORTIUM ADMIN
              </span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Clinical Federated Deep Learning Workstation
            </p>
          </div>

          {/* Zero-Raw-Data Strict Mode Box */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid var(--status-healthy-border)',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span className="pulse-dot healthy" style={{ marginTop: '4px' }} />
            <div style={{ fontSize: '11px' }}>
              <strong style={{ color: 'var(--status-healthy)' }}>ZERO-RAW-DATA PROTOCOL ENFORCED</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                Federated gradient aggregation operates without central storage or ingress/egress of raw patient DICOM images or EHR records.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* IDP Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  INSTITUTIONAL IDENTITY PROVIDER (IDP)
                </label>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SAML 2.0 / OIDC</span>
              </div>
              <div style={{ position: 'relative' }}>
                <select
                  value={idp}
                  onChange={(e) => setIdp(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0 28px 0 10px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    appearance: 'none',
                    outline: 'none'
                  }}
                >
                  <option>Stanford Medicine / Health Care SSO</option>
                  <option>Johns Hopkins Medicine Identity Gateway</option>
                  <option>Charité - Universitätsmedizin Berlin SSO</option>
                  <option>Mayo Clinic Enterprise Federated Auth</option>
                  <option>Mass General Brigham Enclave Directory</option>
                </select>
                <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '11px', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f87171',
                fontSize: '11px'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Demo Credential Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>QUICK SEED CREDENTIALS (CLICK TO FILL):</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('e.rostova@med.stanford.edu');
                    setPassphrase('researcher123');
                    setSelectedRole('researcher');
                    setErrorMessage(null);
                  }}
                  style={{
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '10px',
                    color: 'var(--accent-teal)',
                    cursor: 'pointer'
                  }}
                >
                  Researcher (Dr. Elena)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('operator@stjude-clinical.org');
                    setPassphrase('hospital123');
                    setSelectedRole('hospital_operator');
                    setErrorMessage(null);
                  }}
                  style={{
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '10px',
                    color: '#38bdf8',
                    cursor: 'pointer'
                  }}
                >
                  Hospital Operator (St. Jude)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@consortium.org');
                    setPassphrase('admin123');
                    setSelectedRole('admin');
                    setErrorMessage(null);
                  }}
                  style={{
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '10px',
                    color: '#a855f7',
                    cursor: 'pointer'
                  }}
                >
                  Consortium Admin
                </button>
              </div>
            </div>

            {/* Account Role Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  ACCOUNT TYPE / ROLE
                </label>
                <span style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>Same email supported across roles</span>
              </div>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0 10px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="researcher">Researcher (Clinical Investigator)</option>
                  <option value="admin">Consortium Administrator</option>
                  <option value="hospital_operator">Hospital Operator (Clinical Node)</option>
                </select>
                <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '11px', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Email / Identifier */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                CLINICAL IDENTIFIER / INSTITUTIONAL EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.rostova@med.stanford.edu"
                  style={{
                    width: '100%',
                    height: '36px',
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0 32px 0 10px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
                <Check size={15} color="var(--status-healthy)" style={{ position: 'absolute', right: '10px', top: '10px' }} />
              </div>
            </div>

            {/* Cryptographic Passphrase */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  CRYPTOGRAPHIC PASSPHRASE
                </label>
                <span className="badge badge-healthy" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  ● FIPS 140-3 Validated
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter cryptographic passphrase"
                  style={{
                    width: '100%',
                    height: '36px',
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0 50px 0 10px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    letterSpacing: showPass ? 'normal' : '0.15em'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '8px',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Hardware Root-of-Trust Attestation Selector */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                HARDWARE ROOT-OF-TRUST ATTESTATION
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '6px',
                background: 'var(--bg-nested)',
                padding: '4px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}>
                {[
                  { id: 'fido2', label: 'FIDO2 / YubiKey' },
                  { id: 'totp', label: 'TOTP Code' },
                  { id: 'mtls', label: 'mTLS Cert' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAuthMethod(m.id)}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border: 'none',
                      background: authMethod === m.id ? 'var(--bg-card)' : 'transparent',
                      color: authMethod === m.id ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: authMethod === m.id ? '600' : '400',
                      cursor: 'pointer',
                      borderBottom: authMethod === m.id ? '2px solid var(--brand-blue)' : 'none'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '6px',
                fontSize: '10px',
                color: 'var(--text-muted)'
              }}>
                <span className="font-mono">KEY ID: 0x9B8A...F318</span>
                <span style={{ color: 'var(--status-healthy)', fontWeight: '600' }}>HARDWARE TOKEN READY</span>
              </div>
            </div>

            {/* Remember TPM Session */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="remSession"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--brand-blue)' }}
              />
              <label htmlFor="remSession" style={{ fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Remember hardware TPM-bound session (12h)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                height: '38px',
                fontSize: '13px',
                fontWeight: '600',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Authenticating with Backend...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Authenticate &amp; Verify Enclave Session</span>
                </>
              )}
            </button>

            {/* Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
              <a href="#forgot" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Forgot institutional credentials?
              </a>
              <span
                onClick={() => setActiveScreen('request-access')}
                style={{ color: 'var(--brand-blue)', cursor: 'pointer', textDecoration: 'none', fontWeight: '500' }}
              >
                Request Consortium Access
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setActiveScreen('home')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>← Return to Platform Homepage</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Terminal Cluster Telemetry Box */}
      <div style={{
        background: 'var(--bg-nested)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '12px 24px',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={14} color="var(--status-healthy)" />
          <span><strong>Consortium Cluster Telemetry:</strong> Ring 8/8 Nodes Online • Quorum Active</span>
        </div>
        <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          HIPAA §164.312 &amp; GDPR Ch. 5 Authorized Workstation • Zero-Knowledge Session Assertions Registered
        </div>
      </div>
    </div>
  );
};
