import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminApprovalView = () => {
  const [pendingResearchers, setPendingResearchers] = useState([]);
  const [allResearchers, setAllResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, all] = await Promise.all([
        apiService.getPendingResearchers().catch(() => []),
        apiService.getAllResearchers().catch(() => [])
      ]);
      setPendingResearchers(pending || []);
      setAllResearchers(all || []);
    } catch (err) {
      setError(err.message || 'Failed to load researcher records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      await apiService.approveResearcher(userId);
      setMessage(`Researcher ${userId} successfully approved.`);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to approve researcher');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this researcher application?')) return;
    setActionLoading(userId);
    setMessage(null);
    try {
      await apiService.rejectResearcher(userId);
      setMessage(`Researcher ${userId} application rejected.`);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to reject researcher');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Researcher Approvals &amp; Identity Verification
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Consortium Admin Gate: Review institutional credentials before granting access to federated training orchestration.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          padding: '10px 14px',
          marginBottom: '16px',
          color: '#34d399',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={15} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '10px 14px',
          marginBottom: '16px',
          color: '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Pending Researchers Requiring Approval */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-orange)" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Pending Researcher Applications
            </span>
          </div>
          <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
            {pendingResearchers.length} Awaiting Review
          </span>
        </div>

        {pendingResearchers.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No pending researcher registrations at this time. All submitted clinical accounts are reviewed.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-nested)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>ACCOUNT ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>RESEARCHER NAME</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>INSTITUTIONAL EMAIL</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>STATUS</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>REGISTERED DATE</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pendingResearchers.map(r => (
                  <tr key={r.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--accent-teal)' }}>
                      {r.account_id || r.user_id}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '500' }}>
                      {r.name}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                      {r.email}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-yellow" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleApprove(r.user_id)}
                          disabled={actionLoading === r.user_id}
                          style={{ padding: '5px 12px', fontSize: '11px', background: '#10b981', borderColor: '#059669' }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleReject(r.user_id)}
                          disabled={actionLoading === r.user_id}
                          style={{ padding: '5px 12px', fontSize: '11px', color: '#f87171' }}
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: All Registered Researchers */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} color="var(--brand-blue)" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Consortium Researchers Directory
            </span>
          </div>
          <span className="badge badge-blue" style={{ fontSize: '11px' }}>
            {allResearchers.length} Total Registered
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-nested)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>ACCOUNT ID</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>NAME</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>EMAIL</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>STATUS</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>LAST LOGIN</th>
              </tr>
            </thead>
            <tbody>
              {allResearchers.map(r => (
                <tr key={r.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--accent-teal)' }}>
                    {r.account_id || r.user_id}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '500' }}>
                    {r.name}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                    {r.email}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      className={`badge ${r.status === 'active' ? 'badge-green' : r.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}
                      style={{ textTransform: 'uppercase', fontSize: '10px' }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                    {r.last_login_at ? new Date(r.last_login_at).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalView;
