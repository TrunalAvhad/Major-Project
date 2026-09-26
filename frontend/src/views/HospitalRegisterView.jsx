import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck, CheckCircle2, ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';

export const HospitalRegisterView = () => {
  const { register, setActiveScreen } = useApp();
  const [hospitalName, setHospitalName] = useState('St. Jude Clinical Research & AI Node');
  const [hospitalEmail, setHospitalEmail] = useState('operator@stjude-clinical.org');
  const [registrationId, setRegistrationId] = useState(`HOSP_${Math.floor(100000 + Math.random() * 900000)}`);
  const [operatorName, setOperatorName] = useState('Dr. Marcus Vance');
  const [password, setPassword] = useState('hospital123');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const payload = {
        name: operatorName,
        email: hospitalEmail,
        password,
        role: 'hospital_operator',
        hospital_id: registrationId,
        hospital_name: hospitalName
      };
      const user = await register(payload);
      setCreatedUser(user);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Hospital node registration failed.');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)' }}>
          <Building2 size={14} />
          <span><strong>HOSPITAL NODE ENROLLMENT PROTOCOL</strong> :: FEDERATED CLINICAL NETWORK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px' }} className="font-mono">
          <span>COMPLIANCE: <strong style={{ color: 'var(--status-healthy)' }}>HIPAA / GDPR ENCLAVE</strong></span>
        </div>
      </div>

      {/* Container */}
      <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%', padding: '28px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            CLINICAL SITE REGISTRATION // FORM M3-HOSP
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
            Register Clinical Hospital Node
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enroll your hospital imaging enclave into the privacy-preserving federated deep learning consortium network.
          </p>
        </div>

        {submitted ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--status-healthy-border)',
            borderRadius: '8px',
            padding: '36px',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={48} color="var(--status-healthy)" style={{ marginBottom: '14px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Hospital Node Successfully Enrolled in MongoDB</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '520px', margin: '8px auto 0 auto' }}>
              Your hospital node credential record has been created in the database and linked to registration ID <code>{registrationId}</code>.
            </p>

            {createdUser && (
              <div style={{
                marginTop: '20px',
                background: 'var(--bg-nested)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '16px',
                maxWidth: '480px',
                margin: '20px auto 0 auto',
                textAlign: 'left',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>HOSPITAL REGISTRATION ID:</span>
                  <span className="font-mono" style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>{createdUser.hospital_id || registrationId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>HOSPITAL NAME:</span>
                  <span style={{ fontWeight: '500' }}>{hospitalName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>OPERATOR NAME:</span>
                  <span style={{ fontWeight: '500' }}>{createdUser.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>HOSPITAL EMAIL:</span>
                  <span className="font-mono">{createdUser.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>NODE ROLE &amp; STATUS:</span>
                  <span className="badge badge-teal">HOSPITAL_OPERATOR ({createdUser.status})</span>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ marginTop: '24px', background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)', border: 'none' }}
              onClick={() => setActiveScreen('hospital-login')}
            >
              Proceed to Hospital Node Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Error Banner */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f87171',
                fontSize: '12px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 01: Hospital Node Identifiers */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">01. CLINICAL SITE IDENTITY &amp; REGISTRATION ID</span>
                <span className="badge badge-teal">UNIQUE NODE IDENTIFIER</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    HOSPITAL FULL INSTITUTIONAL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. St. Jude Clinical Research & AI Node"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    HOSPITAL REGISTRATION ID (UNIQUE ID NUMBER) *
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    placeholder="e.g. HOSP_000001 or REG-HOSP-99"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--accent-teal)', fontWeight: '600', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    HOSPITAL INSTITUTIONAL EMAIL * <span style={{ color: 'var(--status-healthy)' }}>*Valid Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value)}
                    placeholder="e.g. operator@stjude-clinical.org"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    PRIMARY OPERATOR / RADIOMICS TECHNOLOGIST NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. Dr. Marcus Vance"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    NODE CRYPTOGRAPHIC PASSPHRASE / PASSWORD * <span style={{ color: 'var(--accent-teal)' }}>(Saved to MongoDB)</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password for hospital node authentication"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>

            {/* Zero Raw Egress Guarantee */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid var(--status-healthy-border)',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <ShieldCheck size={18} color="var(--status-healthy)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--status-healthy)' }}>Statutory Hospital Boundary Guarantee:</strong> Enrolling your hospital node guarantees that local DICOM image repositories and patient records will strictly remain inside your hospital firewall. Only aggregated differential-privacy weight updates will be communicated during training sessions.
              </div>
            </div>

            {/* Form Actions */}
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
                onClick={() => setActiveScreen('home')}
              >
                <ArrowLeft size={14} />
                <span>Return to Homepage</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.75 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Registering Hospital Node in Database...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Register Hospital Node</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HospitalRegisterView;
