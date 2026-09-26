import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Lock, ShieldCheck, Check, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

export const HospitalLoginView = () => {
  const { login, setActiveScreen } = useApp();
  const [identifier, setIdentifier] = useState('operator@stjude-clinical.org');
  const [password, setPassword] = useState('hospital123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      await login(identifier, password, 'hospital_operator', rememberMe);
    } catch (err) {
      setErrorMessage(err.message || 'Hospital node authentication failed. Check registration ID / credentials.');
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
          <span><strong>CLINICAL NODE GATEWAY</strong> :: ENCLAVE PACS PORTAL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px' }} className="font-mono">
          <span>ISOLATION PROTOCOL: <strong style={{ color: 'var(--status-healthy)' }}>ENCLAVE LOCKED</strong></span>
          <span>FIREWALL: <strong style={{ color: '#38bdf8' }}>ZERO RAW EGRESS</strong></span>
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
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 0 16px rgba(8, 145, 178, 0.4)'
            }}>
              <Building2 size={24} color="#ffffff" />
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>
              MedFL<span style={{ color: 'var(--accent-teal)' }}>.Hospital Workstation</span>
            </h1>

            <div style={{ marginTop: '4px' }}>
              <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                HOSPITAL NODE OPERATOR AUTHENTICATION
              </span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Log in with your Hospital Institutional Email OR Registration ID
            </p>
          </div>

          {/* Seed Quick Pill */}
          <div style={{
            background: 'var(--bg-nested)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>QUICK SEED CLINICAL NODE:</span>
            <button
              type="button"
              onClick={() => {
                setIdentifier('operator@stjude-clinical.org');
                setPassword('hospital123');
                setErrorMessage(null);
              }}
              style={{
                background: 'rgba(8, 145, 178, 0.15)',
                border: '1px solid rgba(8, 145, 178, 0.3)',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '10px',
                color: 'var(--accent-teal)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              St. Jude Node (HOSP_000001)
            </button>
          </div>

          {/* Error Banner */}
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
              fontSize: '11px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email or Registration ID */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                HOSPITAL EMAIL OR REGISTRATION ID *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. HOSP_000001 or operator@stjude-clinical.org"
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
                <Check size={15} color="var(--accent-teal)" style={{ position: 'absolute', right: '10px', top: '10px' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Accepts Hospital Email or unique Registration ID (e.g., HOSP_000001)
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  HOSPITAL NODE PASSWORD *
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hospital operator password"
                  style={{
                    width: '100%',
                    height: '36px',
                    background: 'var(--bg-nested)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0 50px 0 10px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none'
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

            {/* Remember Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="remHospital"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent-teal)' }}
              />
              <label htmlFor="remHospital" style={{ fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Keep local hospital workstation session active
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
                background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                border: 'none',
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
                  <span>Authenticating Hospital Node...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Log In as Hospital Operator</span>
                </>
              )}
            </button>

            {/* Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px' }}>
              <span
                onClick={() => setActiveScreen('hospital-register')}
                style={{ color: 'var(--accent-teal)', cursor: 'pointer', fontWeight: '500' }}
              >
                + Register New Hospital Node
              </span>
              <span
                onClick={() => setActiveScreen('home')}
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ← Return Home
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalLoginView;
