import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Stethoscope, Microscope, LogIn, UserPlus, FileCheck, Building2 } from 'lucide-react';

export const HomeView = () => {
  const { setActiveScreen } = useApp();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(51, 65, 85, 0.6)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        padding: '36px',
        textAlign: 'center'
      }}>
        {/* Header Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#38bdf8',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          <Shield size={14} />
          <span>Privacy-Preserving Clinical AI Platform</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          lineHeight: '1.3',
          margin: '0 0 12px 0',
          color: '#ffffff'
        }}>
          Secure and Privacy-Preserving Federated Deep Learning Training Platform for Medical Imaging
        </h1>

        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          lineHeight: '1.6',
          maxWidth: '540px',
          margin: '0 auto 32px auto'
        }}>
          Decentralized medical imaging model training across clinical ring nodes.
          Protected patient records and raw imaging datasets strictly remain within hospital boundaries.
        </p>

        {/* Primary Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setActiveScreen('login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              height: '46px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0369a1'}
            onMouseOut={(e) => e.currentTarget.style.background = '#0284c7'}
          >
            <LogIn size={16} />
            <span>Secure Login as Researcher</span>
          </button>

          <button
            onClick={() => setActiveScreen('hospital-login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              height: '46px',
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Building2 size={16} />
            <span>Secure Login as Hospital</span>
          </button>
        </div>

        {/* Role Registration Selector Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'left'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '14px'
          }}>
            REGISTER FOR AUTHORIZED PLATFORM ACCESS:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => setActiveScreen('request-access')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '6px',
                color: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Microscope size={20} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Register as Researcher</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Institutional Principal Investigator (Subject to Admin Review)
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('hospital-register')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '6px',
                color: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Stethoscope size={20} color="#4ade80" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Register as Hospital</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Clinical Site Radiomics Technologist &amp; Node Operator
                </div>
              </div>
            </button>
          </div>

          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(51, 65, 85, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: '#64748b'
          }}>
            <Lock size={12} />
            <span>Admin registration is restricted and cannot be created via public signup.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
