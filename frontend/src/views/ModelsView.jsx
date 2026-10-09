import React, { useEffect, useState } from 'react';
import { useAuthStore, selectRole } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useAdminStore } from '../stores/adminStore';
import { useFederationStore, latestEvaluation } from '../stores/federationStore';
import { ConfusionMatrixGrid } from '../components/charts/MLCharts';
import { Notice, Empty, fmtDate, pct, statusBadge } from '../components/common/Notice';
import { Cpu, RefreshCw, ChevronRight } from 'lucide-react';

/** Class names in index order from a Module 9 class_mapping {name: index}. */
const classOrder = (mapping) => (mapping && typeof mapping === 'object'
  ? Object.entries(mapping).sort((a, b) => a[1] - b[1]).map(([name]) => name) : null);

/**
 * Model registry: Module 9 global model versions with their evaluations, the backend's
 * stored-model records and the Module 6 architecture catalog. These endpoints are admin-only.
 */
export const ModelsView = () => {
  const isAdmin = useAuthStore(selectRole) === 'admin';
  if (!isAdmin) {
    return (
      <div style={{ padding: '16px 20px' }}>
        <Notice>
          Global model versions, evaluations and the architecture catalog are served by admin-only endpoints
          (<span className="font-mono">/federation/models</span>, <span className="font-mono">/federation/architectures</span>).
          Ask a consortium admin for model results; your own requests' hospital progress is on the Training page.
        </Notice>
      </div>
    );
  }
  return <AdminModels />;
};

const AdminModels = () => {
  const setActiveScreen = useUiStore((s) => s.setActiveScreen);
  const { globalModels, architectures, loadGlobalModels, loadArchitectures } = useFederationStore();
  const { storedModels, loadStoredModels } = useAdminStore();
  const [selectedId, setSelectedId] = useState(null);

  const reload = () => { loadGlobalModels(); loadArchitectures(); loadStoredModels(); };
  useEffect(reload, []); // eslint-disable-line react-hooks/exhaustive-deps

  const models = [...globalModels.data].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const selected = models.find((m) => m.global_model_id === selectedId) || models[0];
  const evaluation = selected && latestEvaluation(selected);
  const loading = [globalModels, architectures, storedModels].some((r) => r.status === 'loading');

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--brand-blue)" /> Global Models
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Versions produced by federated aggregation (Module 9), evaluated on a held-out set before promotion.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={reload} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => setActiveScreen('federation-models')}>
            <span>Evaluate / promote</span> <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {[globalModels.error, architectures.error, storedModels.error].filter(Boolean).map((e) => <Notice key={e} tone="error">{e}</Notice>)}

      <div className="card">
        <div className="card-header"><span className="card-title">Global model versions</span><span className="badge badge-neutral">{models.length}</span></div>
        {models.length === 0 ? <Empty>{loading ? 'Loading...' : 'No global model yet. Aggregate a federation round to create one.'}</Empty> : (
          <div className="table-container">
            <table className="fl-table">
              <thead>
                <tr><th>Task</th><th>Version</th><th>Architecture</th><th>Status</th><th>Accuracy</th><th>F1</th><th>Hospitals</th><th>Aggregation</th><th>Created</th></tr>
              </thead>
              <tbody>
                {models.map((m) => {
                  const e = latestEvaluation(m);
                  return (
                    <tr key={m.global_model_id} className={m.global_model_id === selected?.global_model_id ? 'selected' : ''}
                      onClick={() => setSelectedId(m.global_model_id)} style={{ cursor: 'pointer' }}>
                      <td>{m.task}</td>
                      <td className="font-mono">v{m.version}</td>
                      <td className="font-mono">{m.architecture}</td>
                      <td><span className={statusBadge(m.status)}>{m.status}</span></td>
                      <td className="font-mono">{pct(e?.accuracy)}</td>
                      <td className="font-mono">{pct(e?.f1)}</td>
                      <td>{m.participating_hospitals.length}</td>
                      <td className="font-mono">{m.aggregation_method}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{fmtDate(m.created_at)}</td>
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
            <span className="card-title">{selected.task} v{selected.version} <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{selected.global_model_id}</span></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>Parameters: <strong className="font-mono">{selected.parameter_count?.toLocaleString() ?? '-'}</strong></div>
              <div>Artifact size: <strong className="font-mono">{selected.artifact_size ? `${(selected.artifact_size / 1048576).toFixed(1)} MB` : '-'}</strong></div>
              <div>Checksum: <span className="font-mono" style={{ wordBreak: 'break-all' }}>{selected.artifact_checksum || '-'}</span></div>
              <div>Source updates: <strong className="font-mono">{selected.source_update_ids?.length ?? 0}</strong></div>
              <div>Hospitals: {selected.participating_hospitals.length ? selected.participating_hospitals.join(', ') : '-'}</div>
              {evaluation && (
                <div style={{ marginTop: '6px' }}>
                  Evaluated on <strong>{evaluation.sample_count}</strong> samples ({evaluation.evaluation_dataset_id}):
                  accuracy <strong className="font-mono">{pct(evaluation.accuracy)}</strong>,
                  precision <strong className="font-mono">{pct(evaluation.precision)}</strong>,
                  recall <strong className="font-mono">{pct(evaluation.recall)}</strong>,
                  F1 <strong className="font-mono">{pct(evaluation.f1)}</strong>
                </div>
              )}
            </div>
            <div>
              {evaluation?.confusion_matrix
                ? <ConfusionMatrixGrid matrix={evaluation.confusion_matrix} classOrder={classOrder(selected.class_mapping)} />
                : <Empty>Not evaluated yet.</Empty>}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Stored model records</span><span className="badge badge-neutral">{storedModels.data.length}</span></div>
          {storedModels.data.length === 0 ? <Empty>No stored model records.</Empty> : (
            <div className="table-container">
              <table className="fl-table">
                <thead><tr><th>Disease</th><th>Architecture</th><th>Version</th><th>Status</th><th>Accuracy</th></tr></thead>
                <tbody>
                  {storedModels.data.map((m) => (
                    <tr key={m.model_id}>
                      <td>{m.disease}</td>
                      <td className="font-mono">{m.architecture}</td>
                      <td className="font-mono">{m.version}</td>
                      <td><span className="badge badge-neutral">{m.status}</span></td>
                      <td className="font-mono">{pct(m.metrics?.accuracy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Architecture catalog (Module 6)</span><span className="badge badge-neutral">{architectures.data.length}</span></div>
          {architectures.data.length === 0 ? <Empty>{loading ? 'Loading...' : 'Catalog unavailable.'}</Empty> : (
            <div className="table-container">
              <table className="fl-table">
                <thead><tr><th>Name</th><th>Family</th><th>Resource tier</th><th>Input</th><th>Pretrained</th></tr></thead>
                <tbody>
                  {architectures.data.map((a) => (
                    <tr key={a.name}>
                      <td>{a.display_name}<div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{a.name}</div></td>
                      <td>{a.family}</td>
                      <td>{a.resource_tier}</td>
                      <td className="font-mono">{a.default_input_size?.join('×')}</td>
                      <td>{a.supports_pretrained ? 'yes' : 'no'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
        Downloading model weights is not available yet (model export belongs to Module 15).
      </p>
    </div>
  );
};
