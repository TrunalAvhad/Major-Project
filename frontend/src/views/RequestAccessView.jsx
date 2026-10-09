import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { ShieldCheck, FileCheck, CheckCircle2, KeyRound, ArrowLeft, Send, AlertCircle, Loader2, Database } from 'lucide-react';

export const RequestAccessView = () => {
  const register = useAuthStore((s) => s.register);
  const setActiveScreen = useUiStore((s) => s.setActiveScreen);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role: 'researcher'
      };
      const user = await register(payload);
      setCreatedUser(user);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-healthy)' }}>
          <ShieldCheck size={14} />
          <span><strong>RESEARCHER ACCESS REQUEST</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px' }} className="font-mono">
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
              Apply for a researcher account on the federated deep learning platform.
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
              <span>ADMIN APPROVAL REQUIRED</span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
              New researcher accounts stay pending until a consortium admin approves them.
            </p>
          </div>
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
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Application Recorded in Database (MongoDB Atlas)</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '520px', margin: '8px auto 0 auto' }}>
              Your account record has been successfully created in the <code>test.users</code> collection and an immutable audit log entry was written to <code>test.auditlogs</code>.
            </p>

            {createdUser && (
              <div style={{
                marginTop: '20px',
                background: 'var(--bg-nested)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '16px',
                maxWidth: '460px',
                margin: '20px auto 0 auto',
                textAlign: 'left',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ASSIGNED USER ID:</span>
                  <span className="font-mono" style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>{createdUser.user_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>NAME:</span>
                  <span style={{ fontWeight: '500' }}>{createdUser.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>EMAIL:</span>
                  <span className="font-mono">{createdUser.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ROLE:</span>
                  <span className="badge badge-blue">{createdUser.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ACCOUNT STATUS:</span>
                  <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>{createdUser.status || 'pending'}</span>
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => setActiveScreen('login')}>
              Proceed to Secure Login
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

            {/* Section 01 */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">01. INVESTIGATOR IDENTITY &amp; INSTITUTION</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>ACADEMIC CREDENTIAL VALIDATION</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    FULL ACADEMIC NAME &amp; DEGREE *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    INSTITUTIONAL CLINICAL EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.org"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    ACCOUNT PASSPHRASE * <span style={{ color: 'var(--accent-teal)' }}>(Saved to MongoDB)</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a secure passphrase"
                    style={{ width: '100%', height: '34px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.75 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Writing to Database...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Consortium Access Application</span>
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
