import React from 'react';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore, selectRole } from '../../stores/authStore';
import { useMockStore } from '../../stores/mockStore';
import { useCurrentUser } from '../../stores/authStore';
import {
  LayoutDashboard,
  Building2,
  Network,
  Cpu,
  FlaskConical,
  Activity,
  ShieldCheck,
  FileText,
  Bell,
  MessageSquare,
  Settings,
  Users,
  Layers,
  ArrowLeftRight,
  LogOut,
  Lock
} from 'lucide-react';

export const Sidebar = () => {
  const { activeScreen, setActiveScreen, setActiveModal } = useUiStore();
  const userRole = useAuthStore(selectRole);
  const logout = useAuthStore((s) => s.logout);
  const currentUser = useCurrentUser();
  const notificationsCount = useMockStore((s) => s.notificationsCount);
  const messagesCount = useMockStore((s) => s.messagesCount);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'training', label: 'Federated Training', icon: Network },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationsCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: messagesCount },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <aside style={{
      width: '230px',
      minWidth: '230px',
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
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)'
            }}>
              <Network size={16} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                MedFL<span style={{ color: 'var(--brand-blue)' }}>.Secure</span>
              </div>
              <div style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Clinical Federated AI
              </div>
            </div>
          </div>

          {/* Data-locality indicator */}
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
              Raw data stays at hospitals
            </span>
          </div>

          {/* Dedicated Non-Switchable Researcher Role Badge */}
          <div style={{
            marginTop: '8px',
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            borderRadius: '4px',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="pulse-dot cyan" style={{ width: '6px', height: '6px' }} />
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ROLE: LEAD RESEARCHER
            </span>
          </div>
        </div>

        {/* Navigation List */}
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
                  background: isActive ? 'var(--brand-blue)' : 'transparent',
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
                  <Icon size={15} color={isActive ? '#ffffff' : '#818cf8'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: isActive ? '#1d4ed8' : '#1e293b',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Demo State & Dialogs item */}
          <button
            onClick={() => setActiveScreen('states')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '7px 10px',
              borderRadius: '5px',
              border: 'none',
              background: activeScreen === 'states' ? 'var(--brand-blue)' : 'transparent',
              color: activeScreen === 'states' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '12px',
              marginTop: '4px'
            }}
          >
            <Layers size={15} color={activeScreen === 'states' ? '#ffffff' : '#64748b'} />
            <span>States & Dialogs</span>
          </button>
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
          title="View Academic Credentials & IRB Scope"
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-strong)',
            overflow: 'hidden'
          }}>
            <span style={{ fontWeight: '600', fontSize: '11px', color: '#ffffff' }}>{currentUser.initials}</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.shortName}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.roleTag}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span className="font-mono">{currentUser.account_id || currentUser.user_id}</span>
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
