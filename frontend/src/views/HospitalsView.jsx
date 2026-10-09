import React, { useEffect, useState } from 'react';
import { useAuthStore, selectRole } from '../stores/authStore';
import { useRequestsStore } from '../stores/requestsStore';
import { useAdminStore } from '../stores/adminStore';
import { useFederationStore, allRounds } from '../stores/federationStore';
import { Notice, Empty, fmtDate, pct, num, statusBadge } from '../components/common/Notice';
import { Building2, RefreshCw, Search, Cpu } from 'lucide-react';

/**
 * Hospitals known to the platform. Admins see every active hospital (Module 1) with its
 * Module 9 round participation; everyone sees training-request participation.
 */
export const HospitalsView = () => {
  const isAdmin = useAuthStore(selectRole) === 'admin';
  const { requests, loadRequests } = useRequestsStore();
  const { telemetry, loadTelemetry } = useAdminStore();
  const { jobs, loadJobs } = useFederationStore();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const reload = () => {
    loadRequests();
    if (isAdmin) { loadTelemetry(); loadJobs(); }
  };
  useEffect(reload, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // One row per hospital id, merged from the hospital registry and both participation sources.
  const byId = new Map();
  const row = (id, name) => {
    if (!byId.has(id)) byId.set(id, { id, name: name || '', registered: false, requests: [], rounds: [] });
    const r = byId.get(id);
    if (name && !r.name) r.name = name;
    return r;
  };
  (telemetry.data?.hospital_nodes || []).forEach((h) => { row(h.hospital_id, h.hospital_name).registered = true; });
  requests.data.forEach((req) => req.participating_hospitals.forEach((p) => row(p.hospital_id, p.hospital_name).requests.push({ req, p })));
  if (isAdmin) {
    allRounds(jobs.data).forEach((round) => round.expected_participants.forEach((id) => {
      const state = round.accepted_participants.includes(id) ? 'ACCEPTED'
        : round.rejected_participants.includes(id) ? 'REJECTED'
          : round.quarantined_participants.includes(id) ? 'QUARANTINED'
            : round.received_participants.includes(id) ? 'RECEIVED' : 'WAITING';
      row(id).rounds.push({ round, state });
    }));
  }
  const q = query.trim().toLowerCase();
  const hospitals = [...byId.values()]
    .filter((h) => !q || h.id.toLowerCase().includes(q) || h.name.toLowerCase().includes(q))
    .sort((a, b) => a.id.localeCompare(b.id));
  const selected = hospitals.find((h) => h.id === selectedId) || hospitals[0];
  const loading = [requests, telemetry, jobs].some((r) => r.status === 'loading');
  const errors = [requests.error, isAdmin && telemetry.error, isAdmin && jobs.error].filter(Boolean);
  const training = hospitals.filter((h) => h.requests.some(({ p }) => p.status === 'TRAINING')).length;

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="var(--accent-teal)" /> Hospitals
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isAdmin ? `${hospitals.filter((h) => h.registered).length} active registered hospital(s)` : 'Hospitals that joined a training request'}
            {' · '}{training} training now
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '9px' }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search id or name"
              style={{ height: '30px', paddingLeft: '26px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '5px', color: 'var(--text-primary)', fontSize: '12px' }} />
          </div>
          <button className="btn btn-secondary" onClick={reload} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> <span>Refresh</span>
          </button>
        </div>
      </div>

      {errors.map((e) => <Notice key={e} tone="error">{e}</Notice>)}

      <div className="card">
        {hospitals.length === 0 ? (
          <Empty>{loading ? 'Loading...' : 'No hospitals yet.'}</Empty>
        ) : (
          <div className="table-container">
            <table className="fl-table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  {isAdmin && <th>Registry</th>}
                  <th>Training requests</th>
                  <th>Latest local training</th>
                  {isAdmin && <th>Federation rounds (accepted / expected)</th>}
                </tr>
              </thead>
              <tbody>
                {hospitals.map((h) => {
                  const latest = [...h.requests].sort((a, b) => String(b.p.joined_at).localeCompare(String(a.p.joined_at)))[0];
                  return (
                    <tr key={h.id} className={h.id === selected?.id ? 'selected' : ''} onClick={() => setSelectedId(h.id)} style={{ cursor: 'pointer' }}>
                      <td>{h.name || h.id}<div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.id}</div></td>
                      {isAdmin && <td>{h.registered ? <span className="badge badge-healthy">active</span> : <span className="badge badge-neutral">not active</span>}</td>}
                      <td className="font-mono">{h.requests.length}</td>
                      <td>{latest ? <><span className={statusBadge(latest.p.status)}>{latest.p.status}</span> <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{latest.req.disease}</span></> : '-'}</td>
                      {isAdmin && <td className="font-mono">{h.rounds.filter((r) => r.state === 'ACCEPTED').length} / {h.rounds.length}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{selected.name || selected.id} <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{selected.id}</span></span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', margin: '4px 0 6px' }}>TRAINING REQUESTS</div>
          {selected.requests.length === 0 ? <Empty>Has not joined a training request.</Empty> : (
            <div className="table-container">
              <table className="fl-table">
                <thead><tr><th>Request</th><th>Status</th><th>Epoch</th><th>Loss</th><th>Accuracy</th><th>Joined</th></tr></thead>
                <tbody>
                  {selected.requests.map(({ req, p }) => (
                    <tr key={req.request_id}>
                      <td>{req.disease} <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{req.request_id}</span></td>
                      <td><span className={statusBadge(p.status)}>{p.status}</span></td>
                      <td className="font-mono">{p.training_metrics?.total_epochs ? `${p.training_metrics.current_epoch}/${p.training_metrics.total_epochs}` : '-'}</td>
                      <td className="font-mono">{num(p.training_metrics?.loss)}</td>
                      <td className="font-mono">{pct(p.training_metrics?.accuracy)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{fmtDate(p.joined_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isAdmin && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', margin: '14px 0 6px' }}>FEDERATION ROUNDS (MODULE 9)</div>
              {selected.rounds.length === 0 ? <Empty>Not expected in any federation round.</Empty> : (
                <div className="table-container">
                  <table className="fl-table">
                    <thead><tr><th>Job</th><th>Round</th><th>Round status</th><th>This hospital</th></tr></thead>
                    <tbody>
                      {selected.rounds.map(({ round, state }) => (
                        <tr key={round.round_id}>
                          <td>{round.job.task} <span style={{ color: 'var(--text-muted)' }}>· {round.job.architecture}</span></td>
                          <td className="font-mono">{round.round_number}</td>
                          <td><span className={statusBadge(round.status)}>{round.status}</span></td>
                          <td><span className={statusBadge(state)}>{state}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
            <Cpu size={13} /> Hardware telemetry: not available. Each hospital profiles its hardware locally (Module 8); reporting it to the server is Module 13, which is not implemented.
          </div>
        </div>
      )}
    </div>
  );
};
