import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShieldAlert,
  Layers,
  Building2,
  Network,
  Cpu,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  UserCheck
} from 'lucide-react';

export const AdminSidebar = () => {
  const {
    activeScreen,
    setActiveScreen,
    currentUser,
    logout
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Researcher Approvals', icon: UserCheck },
    { id: 'disease-models', label: 'Disease Models', icon: Layers },
    { id: 'hospitals', label: 'Hospital Nodes', icon: Building2 },
    { id: 'training', label: 'Federation Jobs', icon: Network },
    { id: 'federation-models', label: 'Federation Models', icon: Cpu },
    { id: 'models', label: 'Global Models', icon: Cpu },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Platform Security', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '235px',
      minWidth: '235px',
      height: '100%',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      userSelect: 'none',
      zIndex: 20
    }}>
      {/* Top Header Branding */}
      <div>
        <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(124, 58, 237, 0.4)'
            }}>
              <ShieldAlert size={16} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                MedFL<span style={{ color: '#c084fc' }}>.Admin</span>
              </div>
              <div style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Consortium Governance
              </div>
            </div>
          </div>

          {/* Zero-Raw-Data Strict Mode Indicator */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid var(--status-healthy-border)',
            borderRadius: '4px',
            padding: '3px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="pulse-dot healthy" />
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--status-healthy)', letterSpacing: '0.02em' }}>
              Zero-Raw-Data: ENFORCED
            </span>
          </div>

          {/* Dedicated Non-Switchable Admin Role Badge */}
          <div style={{
            marginTop: '8px',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '4px',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="pulse-dot purple" style={{ width: '6px', height: '6px' }} />
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ROLE: CONSORTIUM ADMIN
            </span>
          </div>
        </div>

        {/* Admin Navigation List */}
        <nav style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  textAlign: 'left',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-card)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <Icon size={15} color={isActive ? '#ffffff' : '#c084fc'} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card & Sign Out */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-nested)'
      }}>
        <div 
          onClick={() => setActiveScreen('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="View Root Administrator Identity"
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            overflow: 'hidden'
          }}>
            <span style={{ fontWeight: '600', fontSize: '11px', color: '#ffffff' }}>AD</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser?.name || 'Consortium Root Admin'}
            </div>
            <div style={{ fontSize: '10px', color: '#c084fc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Root Security Council
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span className="font-mono">🔐 TIER-1 ROOT</span>
          <button
            onClick={() => logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '11px'
            }}
            title="Log out and return to secure authentication gateway"
          >
            <LogOut size={12} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
