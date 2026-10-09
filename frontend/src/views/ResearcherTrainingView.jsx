import React, { useCallback, useEffect, useState } from 'react';
import { useRequestsStore, useRequestRoomUpdates } from '../stores/requestsStore';
import { Notice, Empty, fmtDate, pct, num, statusBadge } from '../components/common/Notice';
import { Network, Plus, RefreshCw, Loader2, Radio } from 'lucide-react';

const inputStyle = {
  width: '100%', height: '32px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)',
  borderRadius: '5px', padding: '0 10px', color: 'var(--text-primary)', fontSize: '12px',
};
const labelStyle = { fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' };

// Architectures in the Module 6 registry (hospital_client/model_management/registry.py).
const ARCHITECTURES = ['efficientnet_b0', 'efficientnet_b4', 'mobilenet_v2', 'mobilenet_v3_small', 'mobilevit_xxs', 'resnet18', 'resnet50', 'vit_b16'];
const EMPTY_FORM = { disease: '', task: 'Image Classification', description: '', model_architecture: 'efficientnet_b0', target_epochs: 5, batch_size: 16, learning_rate: 0.001 };

/** Researcher: publish training requests (Module 1-3 backend) and follow each hospital's local training live. */
export const ResearcherTrainingView = () => {
  const { myRequests, loadMyRequests, createRequest } = useRequestsStore();
  const requests = myRequests.data;
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => { loadMyRequests(); }, [loadMyRequests]);

  // Live: a hospital joined, withdrew or reported epoch progress -> reload the list.
  const refresh = useCallback(() => { loadMyRequests(); }, [loadMyRequests]);
  useRequestRoomUpdates(requests.filter((r) => ['OPEN', 'ACTIVE'].includes(r.status)).map((r) => r.request_id), refresh);

  const selected = requests.find((r) => r.request_id === selectedId) || requests[0];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const created = await createRequest({
        disease: form.disease,
        task: form.task,
        description: form.description,
        model_architecture: form.model_architecture,
        training_config: {
          target_epochs: Number(form.target_epochs),
          batch_size: Number(form.batch_size),
          learning_rate: Number(form.learning_rate),
        },
      });
      setSelectedId(created.request_id);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} color="var(--brand-blue)" /> Training Requests
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Publish a request; hospitals join it from their desktop app and train locally. Their epoch, loss and accuracy appear here as they report them.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={loadMyRequests} disabled={myRequests.status === 'loading'}>
            <RefreshCw size={13} className={myRequests.status === 'loading' ? 'spin' : ''} /> <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={13} /> <span>New request</span>
          </button>
        </div>
      </div>

      {myRequests.error && <Notice tone="error">{myRequests.error}</Notice>}

      {showForm && (
        <form className="card" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-header"><span className="card-title">New training request</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Target disease *</label>
              <input style={inputStyle} required value={form.disease} onChange={set('disease')} placeholder="e.g. Malaria" />
            </div>
            <div>
              <label style={labelStyle}>Task</label>
              <input style={inputStyle} value={form.task} onChange={set('task')} />
            </div>
            <div>
              <label style={labelStyle}>Suggested architecture</label>
              <select style={inputStyle} value={form.model_architecture} onChange={set('model_architecture')}>
                {ARCHITECTURES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Target epochs</label>
              <input style={inputStyle} type="number" min="1" max="500" value={form.target_epochs} onChange={set('target_epochs')} />
            </div>
            <div>
              <label style={labelStyle}>Batch size</label>
              <input style={inputStyle} type="number" min="1" max="1024" value={form.batch_size} onChange={set('batch_size')} />
            </div>
            <div>
              <label style={labelStyle}>Learning rate</label>
              <input style={inputStyle} type="number" step="any" min="0" value={form.learning_rate} onChange={set('learning_rate')} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea rows="2" value={form.description} onChange={set('description')}
              style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical' }} />
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            A request holds metadata only. Each hospital's Module 8 picks the configuration that fits its own hardware, so these values are guidance.
          </p>
          {formError && <Notice tone="error">{formError}</Notice>}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={13} className="spin" /> : <Plus size={13} />} <span>Publish request</span>
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">My requests</span>
          <span className="badge badge-neutral">{requests.length}</span>
        </div>
        {myRequests.status === 'loading' && requests.length === 0 ? (
          <Empty><Loader2 size={14} className="spin" /> Loading...</Empty>
        ) : requests.length === 0 ? (
          <Empty>You have not published a training request yet.</Empty>
        ) : (
          <div className="table-container">
            <table className="fl-table">
              <thead>
                <tr><th>Request</th><th>Disease</th><th>Task</th><th>Architecture</th><th>Status</th><th>Hospitals</th><th>Created</th></tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const active = r.participating_hospitals.filter((h) => h.status !== 'WITHDRAWN').length;
                  return (
                    <tr key={r.request_id} className={r.request_id === selected?.request_id ? 'selected' : ''}
                      onClick={() => setSelectedId(r.request_id)} style={{ cursor: 'pointer' }}>
                      <td className="font-mono">{r.request_id}</td>
                      <td>{r.disease}</td>
                      <td>{r.task}</td>
                      <td className="font-mono">{r.model_architecture}</td>
                      <td><span className={statusBadge(r.status)}>{r.status}</span></td>
                      <td>{active}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{fmtDate(r.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <RequestDetail request={selected} />}
    </div>
  );
};

const RequestDetail = ({ request }) => {
  const cfg = request.training_config || {};
  const live = ['OPEN', 'ACTIVE'].includes(request.status);
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{request.disease} &middot; <span className="font-mono">{request.request_id}</span></span>
        {live && <span className="badge badge-healthy"><Radio size={10} /> Live updates</span>}
      </div>
      {request.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{request.description}</p>}
      <div style={{ display: 'flex', gap: '18px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        <span>Target epochs: <strong className="font-mono">{cfg.target_epochs ?? '-'}</strong></span>
        <span>Batch size: <strong className="font-mono">{cfg.batch_size ?? '-'}</strong></span>
        <span>Learning rate: <strong className="font-mono">{cfg.learning_rate ?? '-'}</strong></span>
        <span>Researcher: <strong>{request.researcher_name}</strong></span>
      </div>

      {request.participating_hospitals.length === 0 ? (
        <Empty>No hospital has joined this request yet.</Empty>
      ) : (
        <div className="table-container">
          <table className="fl-table">
            <thead>
              <tr><th>Hospital</th><th>Status</th><th>Progress</th><th>Loss</th><th>Accuracy</th><th>Joined</th><th>Note</th></tr>
            </thead>
            <tbody>
              {request.participating_hospitals.map((h) => {
                const m = h.training_metrics || {};
                const ratio = m.total_epochs ? Math.min(1, (m.current_epoch || 0) / m.total_epochs) : 0;
                return (
                  <tr key={h.hospital_id}>
                    <td>{h.hospital_name || h.hospital_id}<div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.hospital_id}</div></td>
                    <td><span className={statusBadge(h.status)}>{h.status}</span></td>
                    <td style={{ minWidth: '140px' }}>
                      {m.total_epochs ? (
                        <>
                          <div className="font-mono" style={{ fontSize: '11px' }}>epoch {m.current_epoch}/{m.total_epochs}</div>
                          <div style={{ height: '4px', background: 'var(--bg-nested)', borderRadius: '2px', marginTop: '3px' }}>
                            <div style={{ width: `${ratio * 100}%`, height: '100%', background: 'var(--brand-blue)', borderRadius: '2px' }} />
                          </div>
                        </>
                      ) : <span style={{ color: 'var(--text-muted)' }}>{m.status || 'No progress reported'}</span>}
                    </td>
                    <td className="font-mono">{num(m.loss)}</td>
                    <td className="font-mono">{pct(m.accuracy)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{fmtDate(h.joined_at)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{h.withdrawal_reason || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px' }}>
        Hospitals report summary metrics only (epoch, loss, accuracy); no images or patient records are sent.
      </p>
    </div>
  );
};

export default ResearcherTrainingView;
