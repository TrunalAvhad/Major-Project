import React, { useCallback, useEffect } from 'react';
import { useRequestsStore, useRequestRoomUpdates } from '../stores/requestsStore';
import { Notice, Empty, fmtDate, pct, num, statusBadge } from '../components/common/Notice';
import { Activity, RefreshCw, Radio, Cpu } from 'lucide-react';

/** Researcher: live local-training progress of every hospital in the researcher's open requests. */
export const MonitoringView = () => {
  const { myRequests, loadMyRequests } = useRequestsStore();
  useEffect(() => { loadMyRequests(); }, [loadMyRequests]);

  const open = myRequests.data.filter((r) => ['OPEN', 'ACTIVE'].includes(r.status));
  const refresh = useCallback(() => { loadMyRequests(); }, [loadMyRequests]);
  useRequestRoomUpdates(open.map((r) => r.request_id), refresh);

  const rows = open.flatMap((r) => r.participating_hospitals.filter((h) => h.status !== 'WITHDRAWN').map((h) => ({ r, h })));
  const count = (s) => rows.filter(({ h }) => h.status === s).length;

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--accent-teal)" /> Training Monitor
            {open.length > 0 && <span className="badge badge-healthy"><Radio size={10} /> Live</span>}
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Epoch, loss and accuracy reported by each hospital for your open requests. Updates arrive over Socket.io as hospitals report them.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadMyRequests} disabled={myRequests.status === 'loading'}>
          <RefreshCw size={13} className={myRequests.status === 'loading' ? 'spin' : ''} /> <span>Refresh</span>
        </button>
      </div>

      {myRequests.error && <Notice tone="error">{myRequests.error}</Notice>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[['OPEN REQUESTS', open.length], ['JOINED, NOT STARTED', count('ACCEPTED')], ['TRAINING', count('TRAINING')], ['COMPLETED', count('COMPLETED')]].map(([label, value]) => (
          <div key={label} className="card">
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Hospitals</span></div>
        {rows.length === 0 ? (
          <Empty>{myRequests.status === 'loading' ? 'Loading...' : 'No hospital is participating in an open request.'}</Empty>
        ) : (
          <div className="table-container">
            <table className="fl-table">
              <thead><tr><th>Hospital</th><th>Request</th><th>Status</th><th>Epoch</th><th>Loss</th><th>Accuracy</th><th>Request updated</th></tr></thead>
              <tbody>
                {rows.map(({ r, h }) => {
                  const m = h.training_metrics || {};
                  return (
                    <tr key={`${r.request_id}:${h.hospital_id}`}>
                      <td>{h.hospital_name || h.hospital_id}</td>
                      <td>{r.disease} <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.request_id}</span></td>
                      <td><span className={statusBadge(h.status)}>{h.status}</span></td>
                      <td className="font-mono">{m.total_epochs ? `${m.current_epoch}/${m.total_epochs}` : '-'}</td>
                      <td className="font-mono">{num(m.loss)}</td>
                      <td className="font-mono">{pct(m.accuracy)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{fmtDate(r.updated_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
        <Cpu size={13} /> GPU, VRAM and network telemetry per hospital: not available (Module 13 is not implemented).
      </div>
    </div>
  );
};
