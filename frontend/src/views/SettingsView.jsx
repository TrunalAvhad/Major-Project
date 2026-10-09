import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { AccountCard, ChangePasswordForm } from '../components/common/Account';
import { Settings, LogOut } from 'lucide-react';

/** Account settings backed by Module 1: identity, password change and sign-out. */
export const SettingsView = () => {
  const logout = useAuthStore((s) => s.logout);
  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} color="var(--brand-blue)" /> Settings
        </h1>
        <button className="btn btn-secondary" onClick={logout}><LogOut size={13} /> <span>Sign out</span></button>
      </div>
      <AccountCard />
      <ChangePasswordForm />
      <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
        Federated training settings (strategy, rounds, privacy) are set per federation job by an admin; differential privacy (Module 10) is not implemented.
      </p>
    </div>
  );
};
