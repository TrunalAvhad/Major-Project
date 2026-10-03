import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ShieldCheck, KeyRound, Check, AlertCircle, Loader2, ArrowLeft, Lock } from 'lucide-react';

export const AdminLoginView = () => {
  const { login, setActiveScreen } = useApp();
  const [email, setEmail] = useState('admin@consortium.org');
  const [passphrase, setPassphrase] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      await login(email, passphrase, 'admin', rememberMe);
    } catch (err) {
      setErrorMessage(err.message || 'Admin authentication failed. Verify root credentials.');
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
      background: 'radial-gradient(ellipse at top, #1e1138 0%, #0a0518 100%)',
      overflowY: 'auto',
      color: '#f8fafc'
    }}>
      {/* Top Security Banner */}
      <div style={{
        height: '36px',
        background: 'rgba(15, 7, 30, 0.9)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        fontSize: '11px',
        color: '#c084fc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={14} />
          <span><strong>CONSORTIUM SECURITY COUNCIL GATEWAY</strong> :: TIER-1 ROOT ORCHESTRATOR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px' }} className="font-mono">
          <span>ATTESTATION: <strong style={{ color: '#4ade80' }}>SGX-ENCLAVE ROOT</strong></span>
          <span>CONSENSUS: <strong style={{ color: '#c084fc' }}>COUNCIL VALIDATED</strong></span>
        </div>
      </div>

      {/* Main Login Card Container */}
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
          background: 'rgba(18, 11, 38, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.8), 0 0 24px rgba(124, 58, 237, 0.15)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 0 18px rgba(124, 58, 237, 0.5)'
            }}>
              <ShieldAlert size={26} color="#ffffff" />
            </div>

            <h1 style={{ fontSize: '19px', fontWeight: '700', letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
              MedFL<span style={{ color: '#c084fc' }}>.Admin Console</span>
            </h1>

            <div style={{ marginTop: '6px' }}>
              <span style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '999px',
                padding: '2px 10px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#d8b4fe',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                CONSORTIUM ROOT ADMINISTRATOR AUTHENTICATION
              </span>
            </div>

            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
              Sign in with Consortium Administrator credentials to manage researcher approvals, disease models, hospital node enrollments, and audit trails.
            </p>
          </div>

          {/* Quick-Fill Root Credential Pill */}
          <div style={{
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px'
          }}>
            <span style={{ color: '#c084fc' }}>Quick-Fill Root Admin:</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@consortium.org');
                setPassphrase('admin123');
                setErrorMessage(null);
              }}
              style={{
                background: 'rgba(139, 92, 246, 0.25)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                color: '#f5f3ff',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              admin@consortium.org
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f87171',
              fontSize: '12px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '5px' }}>
                ADMINISTRATIVE CREDENTIAL / INSTITUTIONAL EMAIL *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@consortium.org"
                style={{
                  width: '100%',
                  height: '36px',
                  background: 'rgba(15, 7, 30, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '0 10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#cbd5e1' }}>
                  ADMINISTRATIVE ROOT PASSPHRASE *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ background: 'transparent', border: 'none', color: '#c084fc', fontSize: '11px', cursor: 'pointer' }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  height: '36px',
                  background: 'rgba(15, 7, 30, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '0 10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#7c3aed' }}
                />
                <span>Maintain session token</span>
              </label>
              <span className="font-mono" style={{ color: '#c084fc', fontSize: '10px' }}>
                RBAC: LEVEL 4 ROOT
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: '42px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginTop: '6px',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Validating Root Credentials...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Authorize Consortium Admin Session</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(139, 92, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setActiveScreen('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#c084fc'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <ArrowLeft size={13} />
              <span>Return to Platform Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginView;
