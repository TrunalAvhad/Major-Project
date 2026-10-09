import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { Network, Lock, Check, AlertCircle, Loader2 } from 'lucide-react';

export const LoginView = () => {
  const login = useAuthStore((s) => s.login);
  const setActiveScreen = useUiStore((s) => s.setActiveScreen);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [selectedRole, setSelectedRole] = useState('researcher');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rememberMe, setRememberMe] = useState(true);
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
                          </div>

            <div style={{ marginTop: '4px' }}>
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                CLINICAL RESEARCH INVESTIGATOR GATEWAY
              </span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Clinical Federated Deep Learning Workstation
            </p>
          </div>

          {/* Data-locality note */}
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
              <strong style={{ color: 'var(--status-healthy)' }}>Raw medical data stays at the hospital</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                Hospitals train locally and send model parameter updates for aggregation; raw images are not uploaded to the central server.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  placeholder="name@institution.org"
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

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  PASSWORD
                </label>
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
            {/* Remember session */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="remSession"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--brand-blue)' }}
              />
              <label htmlFor="remSession" style={{ fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Keep me signed in on this device
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
                  <span>Sign in</span>
                </>
              )}
            </button>

            {/* Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Forgot your password? Ask a consortium admin.
              </span>
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
    </div>
  );
};
