import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { Notice, Empty, fmtDate } from '../components/common/Notice';
import { FileText, RefreshCw, Search, Copy, Check } from 'lucide-react';

/** Admin: the Module 1 audit trail (logins, approvals, training-request participation and progress). */
export const AuditLogsView = () => {
  const { auditLogs, loadAuditLogs } = useAdminStore();
  const [action, setAction] = useState('');
  const [outcome, setOutcome] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState(false);

  const reload = () => loadAuditLogs({ action, limit: 500 });
  useEffect(() => { reload(); }, [action]); // eslint-disable-line react-hooks/exhaustive-deps

  const logs = auditLogs.data;
  const actions = [...new Set([action, ...logs.map((l) => l.action)].filter(Boolean))].sort();
  const q = query.trim().toLowerCase();
  const shown = logs.filter((l) => (outcome === 'all' || (outcome === 'ok') === l.success)
    && (!q || [l.user_id, l.hospital_id, l.resource_id, l.ip_address].some((v) => v && v.toLowerCase().includes(q))));
  const selected = shown.find((l) => l.audit_id === selectedId) || shown[0];

  const copy = () => {
    navigator.clipboard?.writeText(JSON.stringify(selected, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const control = { height: '30px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px', padding: '0 8px' };

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--brand-blue)" /> Audit Log
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Append-only records written by the backend for sign-ins, account approvals and training-request activity (newest 500).
            Passwords and tokens are stripped before an entry is stored.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={reload} disabled={auditLogs.status === 'loading'}>
          <RefreshCw size={13} className={auditLogs.status === 'loading' ? 'spin' : ''} /> <span>Refresh</span>
        </button>
      </div>

      {auditLogs.error && <Notice tone="error">{auditLogs.error}</Notice>}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select value={action} onChange={(e) => setAction(e.target.value)} style={control}>
          <option value="">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={outcome} onChange={(e) => setOutcome(e.target.value)} style={control}>
          <option value="all">Success and failure</option>
          <option value="ok">Success only</option>
          <option value="fail">Failures only</option>
        </select>
        <div style={{ position: 'relative' }}>
          <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '9px' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="User, hospital, resource or IP" style={{ ...control, width: '240px', paddingLeft: '26px' }} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{shown.length} entries</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '14px', alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {shown.length === 0 ? <Empty>{auditLogs.status === 'loading' ? 'Loading...' : 'No audit entries match.'}</Empty> : (
            <div className="table-container">
              <table className="fl-table">
                <thead><tr><th>Time</th><th>Action</th><th>User</th><th>Hospital</th><th>Resource</th><th>Result</th></tr></thead>
                <tbody>
                  {shown.map((l) => (
                    <tr key={l.audit_id} className={l.audit_id === selected?.audit_id ? 'selected' : ''} onClick={() => setSelectedId(l.audit_id)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(l.timestamp)}</td>
                      <td className="font-mono" style={{ fontSize: '11px' }}>{l.action}</td>
                      <td className="font-mono" style={{ fontSize: '11px' }}>{l.user_id || '-'}</td>
                      <td className="font-mono" style={{ fontSize: '11px' }}>{l.hospital_id || '-'}</td>
                      <td style={{ fontSize: '11px' }}>{l.resource_type ? `${l.resource_type} ${l.resource_id || ''}` : '-'}</td>
                      <td><span className={`badge ${l.success ? 'badge-healthy' : 'badge-danger'}`}>{l.success ? 'ok' : 'failed'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Entry</span>
            {selected && (
              <button className="btn btn-ghost" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={copy}>
                {copied ? <Check size={12} /> : <Copy size={12} />} <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>
          {selected ? (
            <pre className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--bg-nested)', borderRadius: '6px', padding: '10px', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(selected, null, 2)}
            </pre>
          ) : <Empty>Select an entry.</Empty>}
        </div>
      </div>
    </div>
  );
};
