import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Shield,
  BookOpen,
  Bell,
  HelpCircle,
  Lock,
  ChevronDown,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const TopNav = () => {
  const {
    activeScreen,
    setActiveScreen,
    privacyMetrics,
    quorumStatus,
    notificationsCount,
    setActiveModal
  } = useApp();

  return (
    <header style={{
      height: '50px',
      minHeight: '50px',
      background: 'var(--bg-header)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 10
    }}>
      {/* Left Area: Consortium Select & Health Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-nested)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ color: '#60a5fa' }}>CONSORTIUM:</span>
          <span style={{ color: 'var(--text-primary)' }}>Pan-Cancer Federated Trial</span>
          <ChevronDown size={12} color="var(--text-muted)" />
        </div>

        {/* Live Cluster Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="badge badge-healthy" title="Infrastructure Uptime">
            <span className="pulse-dot healthy" />
            <span>Online 99.98%</span>
          </div>
          
          <div className="badge badge-blue" title="Active Aggregation Algorithm">
            <span>FedAvg {quorumStatus.fedAvgVersion}</span>
          </div>

          <div className="badge badge-cyan" title="Node Synchronicity">
            <RefreshCw size={10} className="spin-slow" />
            <span>Synced</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid var(--status-healthy-border)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            color: 'var(--status-healthy)'
          }}>
            <Lock size={10} />
            <span className="font-mono">8/8 TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <Search
          size={14}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search experiments, models, rounds, hospital nodes... [/]"
          style={{
            width: '100%',
            height: '30px',
            background: 'var(--bg-nested)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '5px',
            padding: '0 32px 0 30px',
            color: 'var(--text-primary)',
            fontSize: '11px',
            outline: 'none'
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--brand-blue)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
        <span style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#1e293b',
          border: '1px solid var(--border-subtle)',
          borderRadius: '3px',
          padding: '1px 5px',
          fontSize: '9px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Differential Privacy Metric Invariant Badge */}
        <div 
          onClick={() => setActiveScreen('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            color: 'var(--accent-teal)'
          }}
          title="Differential Privacy Bound: Click to inspect security & Rényi DP gauge"
        >
          <Shield size={12} />
          <span style={{ fontWeight: '600' }} className="font-mono">DP: ε={privacyMetrics.epsilon} Active</span>
        </div>

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => setActiveScreen('notifications')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              position: 'relative'
            }}
            title="Consortium Notifications"
          >
            <Bell size={15} />
            {notificationsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--status-danger)'
              }} />
            )}
          </button>

          <button 
            onClick={() => setActiveScreen('audit')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px'
            }}
            title="Cryptographic Ledger Documentation"
          >
            <BookOpen size={15} />
          </button>

          <button 
            onClick={() => setActiveScreen('settings')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px'
            }}
            title="Platform Settings & Preferences"
          >
            <Sliders size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
