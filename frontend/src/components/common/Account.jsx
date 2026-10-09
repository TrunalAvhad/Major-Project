import React, { useState } from 'react';
import { useAuthStore, useCurrentUser } from '../../stores/authStore';
import { Notice, statusBadge } from './Notice';
import { KeyRound, Loader2 } from 'lucide-react';

/** Identity of the signed-in account, exactly as Module 1 returns it. */
export const AccountCard = () => {
  const user = useCurrentUser();
  const rows = [
    ['Email', user.email],
    ['Role', user.roleTag],
    ['Account ID', user.account_id || '-'],
    ['User ID', user.user_id],
    ...(user.hospital_id ? [['Hospital', `${user.hospital_name || ''} (${user.hospital_id})`]] : []),
  ];
  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e293b, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>{user.initials}</span>
        </div>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>{user.name}</h2>
          <span className={statusBadge(user.status)}>{user.status}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', fontSize: '12px' }}>
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
            <span className="font-mono">{v}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)',
  borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px',
};

/** POST /auth/change-password (Module 1). */
export const ChangePasswordForm = () => {
  const changePassword = useAuthStore((s) => s.changePassword);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [state, setState] = useState({ saving: false, error: null, done: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setState({ saving: false, error: 'The new passwords do not match.', done: false });
      return;
    }
    setState({ saving: true, error: null, done: false });
    try {
      await changePassword(form.current, form.next);
      setForm({ current: '', next: '', confirm: '' });
      setState({ saving: false, error: null, done: true });
    } catch (err) {
      setState({ saving: false, error: err.message, done: false });
    }
  };

  return (
    <form className="card" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="card-header"><span className="card-title"><KeyRound size={14} /> Change password</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[['current', 'Current password', 'current-password'], ['next', 'New password', 'new-password'], ['confirm', 'Repeat new password', 'new-password']].map(([k, label, ac]) => (
          <label key={k} style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {label}
            <input type="password" required autoComplete={ac} value={form[k]} onChange={set(k)} style={{ ...inputStyle, marginTop: '4px' }} />
          </label>
        ))}
      </div>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.done && <Notice tone="success">Password changed.</Notice>}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={state.saving}>
          {state.saving && <Loader2 size={13} className="spin" />} <span>Update password</span>
        </button>
      </div>
    </form>
  );
};
