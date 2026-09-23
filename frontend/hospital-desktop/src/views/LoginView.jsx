import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Mail, Building2, AlertCircle, ArrowRight } from 'lucide-react';

const LoginView = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('operator@stjude-clinical.org');
  const [password, setPassword] = useState('hospital123');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '12px',
            boxShadow: '0 4px 14px rgba(8, 145, 178, 0.4)'
          }}>
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            MedFL<span style={{ color: 'var(--accent-teal)' }}>.Hospital</span>
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Clinical Federated Deep Learning Training Workstation
          </div>
          <div style={{ marginTop: '8px' }}>
            <span className="badge badge-teal font-mono">
              Module 1: Hospital Isolation Active
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            color: 'var(--status-danger)',
            fontSize: '12px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Hospital Operator Email
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px'
            }}>
              <Mail size={15} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@hospital.org"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Authentication Key / Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px'
            }}>
              <Lock size={15} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-teal"
            style={{ width: '100%', padding: '10px', fontSize: '13px' }}
          >
            {isLoading ? 'Verifying Hospital Credentials...' : 'Authenticate Clinical Workstation'}
            {!isLoading && <ArrowRight size={15} />}
          </button>
        </form>

        {/* Demo Credentials Quick-fill */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#0a101d',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: '11px'
        }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
            Authorized Demo Hospital Node:
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Email: <code className="text-code">operator@stjude-clinical.org</code></span>
            <span>Password: <code className="text-code">hospital123</code></span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Bound to Facility: <strong>St. Jude AI Node (HOSP_000001)</strong>
          </div>
        </div>

        {/* Privacy Seal */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: 'var(--status-healthy)',
          fontSize: '11px'
        }}>
          <ShieldCheck size={14} />
          <span>Local Data Remains at Hospital — Zero External Raw Egress</span>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
