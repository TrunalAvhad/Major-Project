import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { useAuthStore } from '../stores/authStore';
import { useConfirm } from '../components/common/ConfirmDialog';
import { Notice, Empty, fmtDate, statusBadge } from '../components/common/Notice';
import { Users, RefreshCw, Search } from 'lucide-react';

const ROLE_TABS = [['all', 'All'], ['researcher', 'Researchers'], ['hospital_operator', 'Hospital operators'], ['admin', 'Admins']];
const ROLE_BADGE = { admin: 'badge-purple', researcher: 'badge-blue', hospital_operator: 'badge-healthy' };

// Which Module 1 status actions apply to an account in a given status.
const ACTIONS = {
  pending: [['approve', 'Approve', 'btn-primary'], ['reject', 'Reject', 'btn-danger']],
  active: [['suspend', 'Suspend', 'btn-secondary']],
  suspended: [['approve', 'Reactivate', 'btn-secondary']],
  rejected: [['approve', 'Approve', 'btn-secondary']],
};

/** Admin: every account from Module 1 with approve / reject / suspend. */
export const UserManagementView = () => {
  const { users, loadUsers, setUserStatus } = useAdminStore();
  const me = useAuthStore((s) => s.user);
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [confirmDialog, confirm] = useConfirm();

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const all = users.data;
  const q = query.trim().toLowerCase();
  const shown = all.filter((u) => (role === 'all' || u.role === role)
    && (!q || [u.name, u.email, u.user_id, u.account_id, u.hospital_id].some((v) => v && v.toLowerCase().includes(q))));
  const count = (pred) => all.filter(pred).length;

  const act = async (u, action, label) => {
    if (action !== 'approve' && !(await confirm({
      title: `${label} ${u.name}?`,
      message: action === 'suspend'
        ? 'The account can no longer sign in until an admin reactivates it.'
        : 'The application is rejected and the account cannot sign in.',
      confirmLabel: label,
      danger: true,
    }))) return;
    setBusy(u.user_id);
    setError(null);
    try { await setUserStatus(u.user_id, action); } catch (e) { setError(e.message); } finally { setBusy(null); }
  };

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {confirmDialog}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--status-purple)" /> User Management
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Approve, reject or suspend researcher, hospital operator and admin accounts.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadUsers} disabled={users.status === 'loading'}>
          <RefreshCw size={13} className={users.status === 'loading' ? 'spin' : ''} /> <span>Refresh</span>
        </button>
      </div>

      {[users.error, error].filter(Boolean).map((e) => <Notice key={e} tone="error">{e}</Notice>)}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          ['PENDING REVIEW', count((u) => u.status === 'pending'), 'var(--status-warning)'],
          ['ACTIVE RESEARCHERS', count((u) => u.role === 'researcher' && u.status === 'active'), 'var(--brand-blue)'],
          ['ACTIVE HOSPITAL OPERATORS', count((u) => u.role === 'hospital_operator' && u.status === 'active'), 'var(--status-healthy)'],
          ['ADMINS', count((u) => u.role === 'admin'), 'var(--status-purple)'],
        ].map(([label, value, color]) => (
          <div key={label} className="card">
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{label}</span>
            <div style={{ fontSize: '22px', fontWeight: '700', color, marginTop: '4px' }} className="font-mono">{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {ROLE_TABS.map(([id, label]) => (
            <button key={id} onClick={() => setRole(id)} className={`btn ${role === id ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '10px', padding: '4px 8px' }}>
              {label} ({id === 'all' ? all.length : count((u) => u.role === id)})
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '9px' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or id"
            style={{ width: '260px', height: '30px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px 0 26px', fontSize: '11px', color: 'var(--text-primary)' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {shown.length === 0 ? <Empty>{users.status === 'loading' ? 'Loading...' : 'No matching accounts.'}</Empty> : (
          <div className="table-container">
            <table className="fl-table">
              <thead>
                <tr><th>Name &amp; email</th><th>Role</th><th>Hospital</th><th>Account</th><th>Status</th><th>Registered</th><th>Last login</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
              </thead>
              <tbody>
                {shown.map((u) => (
                  <tr key={u.user_id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{u.name}</div>
                      <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-neutral'}`} style={{ fontSize: '9px' }}>{u.role}</span></td>
                    <td>{u.hospital_id ? <>{u.hospital_name || u.hospital_id}<div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.hospital_id}</div></> : '-'}</td>
                    <td className="font-mono" style={{ fontSize: '11px' }}>{u.account_id || u.user_id}</td>
                    <td><span className={statusBadge(u.status)} style={{ fontSize: '9px' }}>{u.status}</span></td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmtDate(u.created_at)}</td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.last_login_at ? fmtDate(u.last_login_at) : 'Never'}</td>
                    <td style={{ textAlign: 'right' }}>
                      {u.user_id === me?.user_id ? <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>you</span> : (
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          {(ACTIONS[u.status] || []).map(([action, label, cls]) => (
                            <button key={action} className={`btn ${cls}`} style={{ fontSize: '10px', padding: '3px 8px' }}
                              disabled={busy === u.user_id} onClick={() => act(u, action, label)}>{label}</button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
