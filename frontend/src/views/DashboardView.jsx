import React, { useEffect, useState } from 'react';
import { useUiStore } from '../stores/uiStore';
import { useAuthStore, selectRole } from '../stores/authStore';
import { useRequestsStore } from '../stores/requestsStore';
import { useAdminStore } from '../stores/adminStore';
import { useFederationStore, currentRound, latestEvaluation, federationTimeline } from '../stores/federationStore';
import { EpochLineChart } from '../components/charts/MLCharts';
import { useAggregateRound } from '../components/federation/AggregateRoundDialog';
import { Notice, Empty, fmtDate, pct, statusBadge } from '../components/common/Notice';
import { Building2, Network, Layers, Cpu, Clock, Loader2, Play, ClipboardCheck, ChevronRight } from 'lucide-react';

const COLLECTING = ['OPEN', 'RECEIVING', 'READY_FOR_AGGREGATION'];

const StatCard = ({ label, value, sub, onClick, icon: Icon }) => (
  <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{label}</span>
      {Icon && <Icon size={14} color="var(--text-muted)" />}
    </div>
    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }} className="font-mono">{value}</div>
    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub}</div>
  </div>
);

const Timeline = ({ events, emptyText }) => (
  events.length === 0 ? <Empty>{emptyText}</Empty> : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {events.slice(0, 8).map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 10px', background: 'var(--bg-nested)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-teal)', minWidth: '130px' }}>{fmtDate(m.time)}</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{m.title}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{m.detail}</div>
          </div>
        </div>
      ))}
    </div>
  )
);

/** Overview for admins (Module 9 federation + Module 1 data) and researchers (their training requests). */
export const DashboardView = () => {
  const isAdmin = useAuthStore(selectRole) === 'admin';
  return isAdmin ? <AdminOverview /> : <ResearcherOverview />;
};

const AdminOverview = () => {
  const setActiveScreen = useUiStore((s) => s.setActiveScreen);
  const { requests, loadRequests } = useRequestsStore();
  const { telemetry, loadTelemetry } = useAdminStore();
  const { jobs, globalModels, loadJobs, loadGlobalModels, evaluateModel } = useFederationStore();
  const [aggregateDialog, startAggregate] = useAggregateRound(() => loadGlobalModels());
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => { loadRequests(); loadTelemetry(); loadJobs(); loadGlobalModels(); },
    [loadRequests, loadTelemetry, loadJobs, loadGlobalModels]);

  const models = globalModels.data;
  const round = currentRound(jobs.data);
  const roundModels = round ? models.filter((m) => m.federation_job_id === round.federation_job_id) : [];
  const versions = [...roundModels].sort((a, b) => a.version - b.version)
    .map((m) => ({ m, e: latestEvaluation(m) }))
    .filter(({ e }) => e)
    .map(({ m, e }) => ({ epoch: m.version, accuracy: e.accuracy, f1: e.f1 }));
  const latestModel = [...roundModels].sort((a, b) => b.version - a.version)[0];
  const mainModel = models.find((m) => m.status === 'MAIN');
  const openRounds = jobs.data.flatMap((j) => j.rounds || []).filter((r) => COLLECTING.includes(r.status)).length;
  const openRequests = requests.data.filter((r) => ['OPEN', 'ACTIVE'].includes(r.status)).length;
  const hospitals = telemetry.data?.hospital_nodes || [];
  const errors = [jobs.error, globalModels.error, telemetry.error, requests.error, actionError].filter(Boolean);

  const run = async (key, fn) => {
    setBusy(key);
    setActionError(null);
    try { await fn(); } catch (e) { setActionError(e.message); } finally { setBusy(null); }
  };

  const canAggregate = round && COLLECTING.includes(round.status)
    && round.accepted_participants.length >= Math.max(1, round.minimum_participants || 1);

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {aggregateDialog}
      {errors.map((e) => <Notice key={e} tone="error">{e}</Notice>)}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <StatCard label="ACTIVE HOSPITALS" icon={Building2} value={hospitals.length}
          sub="Registered with status active" onClick={() => setActiveScreen('hospitals')} />
        <StatCard label="TRAINING REQUESTS" icon={Layers} value={openRequests}
          sub={`open or active, of ${requests.data.length} total`} />
        <StatCard label="FEDERATION JOBS" icon={Network} value={jobs.data.length}
          sub={`${openRounds} round(s) collecting updates`} onClick={() => setActiveScreen('training')} />
        <StatCard label="GLOBAL MODELS" icon={Cpu} value={models.length}
          sub={mainModel ? `Main: ${mainModel.task} v${mainModel.version}` : 'No model promoted yet'} onClick={() => setActiveScreen('federation-models')} />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Current federation round</div>
            {round && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {round.job.task} · {round.job.architecture} · round {round.round_number} · <span className="font-mono">{round.round_id}</span>
            </div>}
          </div>
          {round && <span className={statusBadge(round.status)}>{round.status}</span>}
        </div>

        {jobs.status === 'loading' && !round ? <Empty><Loader2 size={14} className="spin" /> Loading...</Empty> : !round ? (
          <Empty>No federation round yet. Create a job and a round on the Federation Jobs page.</Empty>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'var(--bg-nested)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '12px', fontSize: '11px' }}>
              <div>Expected<div className="font-mono" style={{ fontSize: '18px', fontWeight: 700 }}>{round.expected_participants.length}</div></div>
              <div>Accepted<div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--status-healthy)' }}>{round.accepted_participants.length}</div></div>
              <div>Rejected / quarantined<div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--status-danger)' }}>{round.rejected_participants.length + round.quarantined_participants.length}</div></div>
              <div>Deadline<div className="font-mono" style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{fmtDate(round.deadline)}</div></div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>EXPECTED HOSPITALS:</span>
              {round.expected_participants.map((h) => {
                const state = round.accepted_participants.includes(h) ? 'ACCEPTED'
                  : round.rejected_participants.includes(h) ? 'REJECTED'
                    : round.received_participants.includes(h) ? 'RECEIVED' : 'WAITING';
                return <span key={h} className={statusBadge(state)} style={{ fontSize: '10px' }}>{h} · {state}</span>;
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" disabled={!canAggregate || busy}
                title={canAggregate ? '' : 'Needs the minimum number of accepted updates while the round is collecting'}
                onClick={() => startAggregate(round.job, round)}>
                <Play size={13} /> <span>Aggregate round</span>
              </button>
              {latestModel && !latestEvaluation(latestModel) && (
                <button className="btn btn-secondary" disabled={!!busy} onClick={() => run('eval', () => evaluateModel(latestModel.global_model_id))}>
                  {busy === 'eval' ? <Loader2 size={13} className="spin" /> : <ClipboardCheck size={13} />} <span>Evaluate v{latestModel.version}</span>
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setActiveScreen('training')}>
                <span>Federation jobs</span> <ChevronRight size={12} />
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '14px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Global model evaluation by version</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{round ? round.job.task : 'Current job'} · held-out evaluation set</div>
            </div>
          </div>
          <EpochLineChart epochs={versions} xLabel="global model version" yMax={1}
            emptyText="No evaluated global model for this job yet."
            series={[{ key: 'accuracy', label: 'Accuracy', color: '#06b6d4' }, { key: 'f1', label: 'F1', color: '#60a5fa' }]} />
          {versions.length > 0 && (
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Latest: accuracy <strong className="font-mono">{pct(versions[versions.length - 1].accuracy)}</strong>,
              F1 <strong className="font-mono">{pct(versions[versions.length - 1].f1)}</strong>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><Clock size={15} color="var(--brand-blue)" /> <span>Federation timeline</span></div>
            <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '2px 6px' }} onClick={() => setActiveScreen('audit')}>
              <span>Audit log</span> <ChevronRight size={12} />
            </button>
          </div>
          <Timeline events={federationTimeline(jobs.data, models)} emptyText="Nothing has happened in Module 9 yet." />
        </div>
      </div>
    </div>
  );
};

const ResearcherOverview = () => {
  const setActiveScreen = useUiStore((s) => s.setActiveScreen);
  const { myRequests, loadMyRequests } = useRequestsStore();
  useEffect(() => { loadMyRequests(); }, [loadMyRequests]);

  const requests = myRequests.data;
  const participations = requests.flatMap((r) => r.participating_hospitals.map((h) => ({ ...h, request: r })));
  const hospitals = new Set(participations.filter((p) => p.status !== 'WITHDRAWN').map((p) => p.hospital_id));
  const training = participations.filter((p) => p.status === 'TRAINING');
  const completed = participations.filter((p) => p.status === 'COMPLETED');

  const events = [
    ...requests.map((r) => ({ time: r.created_at, title: `Request published: ${r.disease}`, detail: `${r.task} · ${r.request_id}` })),
    ...participations.map((p) => ({ time: p.joined_at, title: `${p.hospital_name || p.hospital_id} joined`, detail: `${p.request.disease} · ${p.status}` })),
    ...participations.filter((p) => p.withdrawn_at).map((p) => ({ time: p.withdrawn_at, title: `${p.hospital_name || p.hospital_id} withdrew`, detail: p.withdrawal_reason || p.request.disease })),
  ].sort((a, b) => String(b.time).localeCompare(String(a.time)));

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {myRequests.error && <Notice tone="error">{myRequests.error}</Notice>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <StatCard label="MY REQUESTS" icon={Layers} value={requests.length}
          sub={`${requests.filter((r) => ['OPEN', 'ACTIVE'].includes(r.status)).length} open or active`} onClick={() => setActiveScreen('training')} />
        <StatCard label="PARTICIPATING HOSPITALS" icon={Building2} value={hospitals.size} sub="across my requests" onClick={() => setActiveScreen('hospitals')} />
        <StatCard label="TRAINING NOW" icon={Network} value={training.length} sub="hospitals reporting epochs" onClick={() => setActiveScreen('monitoring')} />
        <StatCard label="LOCAL TRAINING DONE" icon={ClipboardCheck} value={completed.length} sub="hospital runs completed" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><Clock size={15} color="var(--brand-blue)" /> <span>Activity on my requests</span></div>
          <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '2px 6px' }} onClick={() => setActiveScreen('training')}>
            <span>Training requests</span> <ChevronRight size={12} />
          </button>
        </div>
        <Timeline events={events} emptyText="No activity yet. Publish a training request to get started." />
      </div>
    </div>
  );
};
