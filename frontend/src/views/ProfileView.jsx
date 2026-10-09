import React, { useEffect } from 'react';
import { useAuthStore, selectRole } from '../stores/authStore';
import { useRequestsStore } from '../stores/requestsStore';
import { AccountCard } from '../components/common/Account';
import { Empty, fmtDate, statusBadge } from '../components/common/Notice';
import { User } from 'lucide-react';

/** The signed-in account and, for researchers, the training requests they published. */
export const ProfileView = () => {
  const isResearcher = useAuthStore(selectRole) === 'researcher';
  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <User size={18} color="var(--brand-blue)" /> Profile
      </h1>
      <AccountCard />
      {isResearcher && <MyRequests />}
    </div>
  );
};

const MyRequests = () => {
  const { myRequests, loadMyRequests } = useRequestsStore();
  useEffect(() => { loadMyRequests(); }, [loadMyRequests]);
  return (
    <div className="card">
      <div className="card-header"><span className="card-title">My training requests</span><span className="badge badge-neutral">{myRequests.data.length}</span></div>
      {myRequests.data.length === 0 ? <Empty>None yet.</Empty> : (
        <div className="table-container">
          <table className="fl-table">
            <thead><tr><th>Disease</th><th>Task</th><th>Status</th><th>Hospitals</th><th>Created</th></tr></thead>
            <tbody>
              {myRequests.data.map((r) => (
                <tr key={r.request_id}>
                  <td>{r.disease}</td>
                  <td>{r.task}</td>
                  <td><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td>{r.participating_hospitals.filter((h) => h.status !== 'WITHDRAWN').length}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
