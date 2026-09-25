import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, ShieldCheck, X, Check } from 'lucide-react';

export const SwitchRoleModal = () => {
  const { activeModal, setActiveModal, userRole, setUserRole } = useApp();

  if (activeModal !== 'switchRole') return null;

  const roles = [
    {
      id: 'researcher',
      title: 'Lead FL Investigator / Researcher',
      badge: 'Level 3 Access',
      desc: 'Can initiate federated training trials, inspect convergence trajectories, review differential privacy budgets, and interact with authorized hospital enclaves.',
      color: 'var(--brand-blue)',
      icon: UserCheck
    },
    {
      id: 'admin',
      title: 'Consortium Administrator',
      badge: 'Tier-1 Root Authority',
      desc: 'Full administrative access: user account approvals, hospital enclave onboarding, policy overrides, immutable audit log verification, and node quarantine controls.',
      color: 'var(--status-purple)',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--brand-blue)" />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Switch Operational Role (Module 1 RBAC)</span>
          </div>
          <button 
            onClick={() => setActiveModal(null)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Module 1 enforces strict role-based access control. Switch roles below to test and demonstrate different permission scopes across Module 2.
          </p>

          {roles.map((r) => {
            const isSelected = userRole === r.id;
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                onClick={() => {
                  setUserRole(r.id);
                  setActiveModal(null);
                }}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: `1px solid ${isSelected ? r.color : 'var(--border-subtle)'}`,
                  background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-nested)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} color={r.color} />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{r.title}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                      {r.badge}
                    </span>
                    {isSelected && <Check size={14} color="var(--status-healthy)" />}
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {r.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
