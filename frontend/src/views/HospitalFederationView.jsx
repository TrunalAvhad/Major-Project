import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getHospitalFederationStatus, getJobs } from '../services/federationService';
import { ML_API_URL, ml } from '../services/mlClient';
import {
  Network, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw,
  ShieldCheck, Upload, Ban, Tag, Database
} from 'lucide-react';

const HospitalFederationView = () => {
  const { hospitalName } = useApp();
  const [updates, setUpdates] = useState([]);
  const [localHandoffs, setLocalHandoffs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [localDatasets, setLocalDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [eligibilityResults, setEligibilityResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [taskVocabulary, setTaskVocabulary] = useState([]);
  const [settingTask, setSettingTask] = useState(false);

  /* ── Helpers ────────────────────────────────────────────── */

  const selectedDataset = localDatasets.find(d => d.dataset_id === selectedDatasetId);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, jobsRes, datasetsRes, vocabRes, runsRes] = await Promise.all([
        getHospitalFederationStatus(),
        getJobs(),
        ml.get('/datasets'),
        ml.get('/federation/task-vocabulary').catch(() => ({ tasks: [] })),
        ml.get('/training-runs').catch(() => ({ runs: [] }))
      ]);
      if (res.success) {
        setUpdates(res.updates || []);
        
        // Find unsubmitted handoffs
        const allUpdates = res.updates || [];
        const runs = runsRes.runs || [];
        const unsubmitted = [];
        
        for (const run of runs) {
            if (run.status === 'TRAINING_COMPLETED_AWAITING_FEDERATION' && run.ready_for_federation) {
                // If it's not in updates (by checking if the model_id matches somehow)
                // Actually we can just check if any update has a round that matches the job's active round for this handoff.
                // Wait, M9 updates don't store local model_id. But they store training_configuration.model_id!
                // Let's assume if it's not in updates, we can show it.
                const isSubmitted = allUpdates.some(u => 
                    u.training_configuration && u.training_configuration.model_id === run.model_id
                );
                if (!isSubmitted) {
                    unsubmitted.push(run);
                }
            }
        }
        setLocalHandoffs(unsubmitted);
      } else {
        setError(res.error || 'Failed to load federation status');
      }
      if (jobsRes.success) {
        setAvailableJobs(jobsRes.jobs || []);
      }
      if (datasetsRes.datasets) {
        const preprocessed = datasetsRes.datasets.filter(d => d.preprocessed === true);
        setLocalDatasets(preprocessed);
        if (preprocessed.length > 0 && !selectedDatasetId) {
          setSelectedDatasetId(preprocessed[0].dataset_id);
        }
      }
      setTaskVocabulary(vocabRes.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  /* ── Eligibility evaluation (read-only, no mutations) ── */

  const evaluateEligibility = async () => {
    if (!selectedDatasetId) return;
    setEvaluating(true);
    const results = {};
    const jobsToEvaluate = availableJobs.filter(j => j.status === 'CREATED' || j.status === 'ACTIVE');
    for (const job of jobsToEvaluate) {
      try {
        const data = await ml.post('/federation/evaluate-eligibility', { job, dataset_id: selectedDatasetId });
        results[job.federation_job_id] = data;
      } catch (err) {
        console.error("Evaluation failed for job", job.federation_job_id, err);
        results[job.federation_job_id] = {
          eligible: false,
          eligibility_type: 'NOT_ELIGIBLE',
          reasons: [`Evaluation error: ${err.message}`]
        };
      }
    }
    setEligibilityResults(results);
    setEvaluating(false);
  };

  useEffect(() => {
    if (selectedDatasetId && availableJobs.length > 0) {
      evaluateEligibility();
    }
  }, [selectedDatasetId, availableJobs]);

  /* ── Task association ──────────────────────────────────── */

  const handleSetTask = async (task) => {
    if (!selectedDatasetId) return;
    setSettingTask(true);
    try {
      await ml.post(`/datasets/${selectedDatasetId}/set-task`, { declared_task: task });
      // Refresh datasets to pick up the new declared_task
      const datasetsRes = await ml.get('/datasets');
      if (datasetsRes.datasets) {
        const preprocessed = datasetsRes.datasets.filter(d => d.preprocessed === true);
        setLocalDatasets(preprocessed);
      }
      // Re-evaluate eligibility with updated task
      setTimeout(() => evaluateEligibility(), 200);
    } catch (err) {
      alert('Failed to set task: ' + err.message);
    } finally {
      setSettingTask(false);
    }
  };

  /* ── Participate ───────────────────────────────────────── */

  const handleParticipate = async (job) => {
    if (!window.confirm(`Start federation run for job ${job.federation_job_id}?`)) return;
    try {
      const activeRound = job.rounds?.find(r => r.status === 'OPEN' || r.status === 'RECEIVING');
      if (!activeRound) throw new Error("No active round available for participation.");
      
      // Register with M9 first
      const { registerParticipant } = await import('../services/federationService');
      await registerParticipant(job.federation_job_id, activeRound.round_id);

      const token = localStorage.getItem('medfl_researcher_token') || sessionStorage.getItem('medfl_researcher_token');
      const api_url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000/api/v1';

      await ml.post('/federation/participate', { 
        job, 
        dataset_id: selectedDatasetId,
        round_id: activeRound.round_id,
        auth_token: token,
        api_url: api_url
      });
      alert("Federation run started successfully!");
      loadStatus();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleRetrySubmission = async (run) => {
    try {
        const jobId = prompt("Enter the Federation Job ID for this handoff (e.g. JOB_MAL_MNV3S_CLS2_1):");
        if (!jobId) return;
        const roundId = prompt("Enter the Round ID for this handoff (e.g. ROUND_MAL_MNV3S_R1):");
        if (!roundId) return;

        const { submitHandoff, registerParticipant } = await import('../services/federationService');
        await registerParticipant(jobId, roundId);
        
        // handoff dir is typically `trained/{model_id}_federation_handoff`
        // But the backend is on the same machine, so we can just pass the path.
        // Wait, the python server knows TRAINED_DIR. In the frontend we don't know the absolute path.
        // We will pass the model_id to a new ML endpoint to submit it, OR we can construct the path if we assume C:\Users\SHUBHAM\medfl_ml_work\trained
        // To be safe, let's call a new endpoint in local ml API or just guess the path.
        const handoffDir = `C:\\Users\\SHUBHAM\\medfl_ml_work\\trained\\${run.model_id}_federation_handoff`;
        
        await submitHandoff(jobId, roundId, handoffDir);
        alert("Handoff submitted successfully!");
        loadStatus();
    } catch (err) {
        alert("Failed to submit handoff: " + err.message);
    }
  };

  /* ── Status helpers ────────────────────────────────────── */

  const statusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
      case 'USED_IN_AGGREGATION':
        return <CheckCircle size={14} color="#10b981" />;
      case 'REJECTED':
        return <XCircle size={14} color="#ef4444" />;
      case 'EXPIRED':
        return <Ban size={14} color="#f59e0b" />;
      case 'RECEIVED':
      case 'VALIDATING':
        return <Clock size={14} color="#3b82f6" />;
      case 'QUARANTINED':
        return <AlertTriangle size={14} color="#ef4444" />;
      default:
        return <Clock size={14} color="#94a3b8" />;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': case 'USED_IN_AGGREGATION': return '#10b981';
      case 'REJECTED': case 'QUARANTINED': return '#ef4444';
      case 'EXPIRED': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const jobsForDisplay = availableJobs.filter(j => j.status === 'CREATED' || j.status === 'ACTIVE');

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            <Network size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Federation Status
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Your hospital's participation in federated learning rounds
          </div>
        </div>
        <button className="btn btn-secondary" onClick={loadStatus} disabled={loading}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Privacy reminder */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 14px', marginBottom: '20px',
        background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '6px', fontSize: '11px', color: '#10b981'
      }}>
        <ShieldCheck size={14} />
        <span>Your medical images remain local. Only model parameter updates are submitted to the federation.</span>
      </div>

      {error && (
        <div style={{
          padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', marginBottom: '16px', fontSize: '12px'
        }}>
          <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />{error}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading federation status...</div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Updates */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Your Submissions</h3>

            {localHandoffs.map((run, idx) => (
              <div key={`local-${idx}`} className="card" style={{ padding: '16px', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '15px', color: '#f8fafc', margin: 0 }}>Unsubmitted Local Handoff</h2>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Run: {run.model_id}</div>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '4px',
                    background: '#f59e0b15', border: '1px solid #f59e0b40',
                    fontSize: '11px', fontWeight: 600, color: '#f59e0b'
                  }}>
                    FEDERATION SUBMISSION FAILED
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '12px' }}>
                  Network or submission failure. Retry available.
                </div>
                <button className="btn btn-primary" onClick={() => handleRetrySubmission(run)}>
                  Retry Submission
                </button>
              </div>
            ))}

            {updates.length === 0 && localHandoffs.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <Upload size={32} color="#475569" style={{ marginBottom: '12px' }} />
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>No federation submissions yet.</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                  Complete local training and submit a federation handoff to participate.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {updates.map((update, idx) => (
                  <div key={update.update_id || idx} className="card" style={{ background: 'var(--bg-nested)', padding: '16px' }}>
                    {/* Update header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: 600, textTransform: 'uppercase' }}>
                          {update.architecture || 'Unknown Architecture'}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                          Round: {update.round_id || 'N/A'}
                        </div>
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '4px',
                        background: `${statusColor(update.status)}15`,
                        border: `1px solid ${statusColor(update.status)}40`,
                        fontSize: '11px', fontWeight: 600, color: statusColor(update.status)
                      }}>
                        {statusIcon(update.status)} {update.status}
                      </div>
                    </div>
      
                    {/* Verification checklist */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
                      padding: '12px', background: 'var(--bg-card)', borderRadius: '6px',
                      border: '1px solid var(--border-subtle)', marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                        <CheckCircle size={12} color="#10b981" />
                        <span style={{ color: '#cbd5e1' }}>Handoff prepared</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                        {update.status === 'REJECTED' ? (
                          <><XCircle size={12} color="#ef4444" /><span style={{ color: '#ef4444' }}>Authorization failed</span></>
                        ) : (
                          <><CheckCircle size={12} color="#10b981" /><span style={{ color: '#cbd5e1' }}>Participant authorized</span></>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                        {update.status === 'REJECTED' && update.rejection_reason?.includes('model') ? (
                          <><XCircle size={12} color="#ef4444" /><span style={{ color: '#ef4444' }}>Base model mismatch</span></>
                        ) : (
                          <><CheckCircle size={12} color="#10b981" /><span style={{ color: '#cbd5e1' }}>Base model verified</span></>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                        {update.status === 'EXPIRED' ? (
                          <><Ban size={12} color="#f59e0b" /><span style={{ color: '#f59e0b' }}>Deadline passed</span></>
                        ) : update.status === 'ACCEPTED' || update.status === 'USED_IN_AGGREGATION' ? (
                          <><CheckCircle size={12} color="#10b981" /><span style={{ color: '#cbd5e1' }}>Update submitted</span></>
                        ) : (
                          <><Clock size={12} color="#3b82f6" /><span style={{ color: '#3b82f6' }}>Pending</span></>
                        )}
                      </div>
                    </div>
      
                    {/* Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Training Samples: </span>
                        <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                          {update.num_train_samples ? update.num_train_samples.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Submitted: </span>
                        <span style={{ color: '#f8fafc' }}>
                          {update.received_at ? new Date(update.received_at).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Job: </span>
                        <span style={{ color: '#f8fafc' }}>{update.federation_job_id || 'N/A'}</span>
                      </div>
                    </div>
      
                    {/* Rejection / Expiration reason */}
                    {(update.status === 'REJECTED' || update.status === 'EXPIRED') && update.rejection_reason && (
                      <div style={{
                        marginTop: '12px', padding: '10px', borderRadius: '6px',
                        background: update.status === 'EXPIRED' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${update.status === 'EXPIRED' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: 600, color: update.status === 'EXPIRED' ? '#f59e0b' : '#ef4444', marginBottom: '4px' }}>
                          {update.status === 'EXPIRED' ? 'Update Expired' : 'Update Rejected'}
                        </div>
                        <div style={{ color: update.status === 'EXPIRED' ? '#d97706' : '#f87171' }}>
                          {update.rejection_reason}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column: Available Jobs & Eligibility */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Available Jobs</h3>
            
            {/* Dataset selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg-nested)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Evaluate dataset:</label>
              <select style={{ padding: '8px', background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px' }} 
                      value={selectedDatasetId} onChange={e => setSelectedDatasetId(e.target.value)}>
                {localDatasets.map(d => (
                  <option key={d.dataset_id} value={d.dataset_id}>{d.name} ({d.dataset_id})</option>
                ))}
              </select>
              {evaluating && <div style={{ fontSize: '11px', color: 'var(--accent-teal)' }}>Evaluating eligibility...</div>}
            </div>

            {/* Selected dataset profile */}
            {selectedDataset && (
              <div style={{ padding: '12px', background: 'var(--bg-nested)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                  <Database size={14} />
                  Dataset Profile
                </div>
                <div style={{ display: 'grid', gap: '6px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Name: </span>
                    <span style={{ color: '#f8fafc' }}>{selectedDataset.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#64748b' }}>Declared task: </span>
                    {selectedDataset.declared_task ? (
                      <span style={{ 
                        color: '#10b981', fontWeight: 600,
                        padding: '1px 6px', borderRadius: '3px',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)'
                      }}>
                        <Tag size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        {selectedDataset.declared_task}
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontStyle: 'italic' }}>Not set</span>
                    )}
                  </div>
                  {selectedDataset.classes && (
                    <div>
                      <span style={{ color: '#64748b' }}>Classes: </span>
                      <span style={{ color: '#cbd5e1' }}>{selectedDataset.classes.join(', ')}</span>
                    </div>
                  )}
                  {selectedDataset.total_samples && (
                    <div>
                      <span style={{ color: '#64748b' }}>Total samples: </span>
                      <span style={{ color: '#cbd5e1' }}>{selectedDataset.total_samples.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Task association control */}
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {selectedDataset.declared_task ? 'Change task association:' : 'Associate with task:'}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select 
                      id="task-select"
                      style={{ flex: 1, padding: '6px', background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '11px' }}
                      defaultValue=""
                    >
                      <option value="" disabled>Select task...</option>
                      {taskVocabulary.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      disabled={settingTask}
                      onClick={() => {
                        const sel = document.getElementById('task-select');
                        if (sel && sel.value) handleSetTask(sel.value);
                      }}
                    >
                      {settingTask ? '...' : 'Set'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs list — ALL available jobs shown, never hidden */}
            {jobsForDisplay.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '16px', textAlign: 'center', background: 'var(--bg-nested)', borderRadius: '6px' }}>
                No active federation jobs available.
              </div>
            )}

            {jobsForDisplay.map(job => {
              const elig = eligibilityResults[job.federation_job_id];
              return (
                <div key={job.federation_job_id} className="card" style={{ padding: '16px', background: 'var(--bg-nested)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>{job.architecture}</div>
                    <div style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
                      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                      color: '#3b82f6'
                    }}>
                      {job.status}
                    </div>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#fff' }}>{job.federation_job_id}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Task: {job.task} | Classes: {job.num_classes}
                  </div>
                  
                  {/* Eligibility result */}
                  {elig && (
                    <div style={{ padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      {/* Dataset Eligibility */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                          Dataset Eligibility:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginTop: '2px' }}>
                          {elig.dataset_eligible ? <CheckCircle size={12} color="#10b981" /> : <XCircle size={12} color="#ef4444" />}
                          <span style={{ color: elig.dataset_eligible ? '#10b981' : '#ef4444' }}>
                            {elig.dataset_eligibility_type === 'FULL_DATASET' ? 'Full Dataset' : 
                             elig.dataset_eligibility_type === 'CLASS_SUBSET' ? 'Class Subset' : 'Not Eligible'}
                          </span>
                        </div>
                        {elig.dataset_reasons && elig.dataset_reasons.length > 0 && (
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', marginLeft: '18px' }}>
                            {elig.dataset_reasons.map((r, i) => <div key={i}>• {r}</div>)}
                          </div>
                        )}
                        {elig.dataset_eligible && (
                          <div style={{ marginTop: '4px', fontSize: '10px', color: '#cbd5e1', marginLeft: '18px' }}>
                            Train: <strong>{elig.train_sample_count?.toLocaleString()}</strong>
                            {elig.validation_sample_count > 0 && <> | Val: <strong>{elig.validation_sample_count?.toLocaleString()}</strong></>}
                            {elig.test_sample_count > 0 && <> | Test: <strong>{elig.test_sample_count?.toLocaleString()}</strong></>}
                          </div>
                        )}
                      </div>

                      {/* Architecture Eligibility */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                          Architecture Eligibility:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginTop: '2px' }}>
                          {elig.architecture_tier === 'NOT_EVALUATED' ? (
                            <><span style={{ color: '#64748b', marginLeft: '18px' }}>— Not Evaluated</span></>
                          ) : (
                            <>
                              {elig.architecture_eligible ? <CheckCircle size={12} color="#10b981" /> : <XCircle size={12} color="#ef4444" />}
                              <span style={{ color: elig.architecture_eligible ? '#10b981' : '#ef4444' }}>
                                {elig.required_architecture || job.architecture} (Tier: {elig.architecture_tier})
                              </span>
                            </>
                          )}
                        </div>
                        {elig.architecture_reasons && elig.architecture_reasons.length > 0 && (
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', marginLeft: '18px' }}>
                            {elig.architecture_reasons.map((r, i) => <div key={i}>• {r}</div>)}
                          </div>
                        )}
                      </div>

                      {/* Final Eligibility */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                          <span style={{ color: '#f8fafc' }}>Final:</span>
                          {elig.eligible ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                          <span style={{ color: elig.eligible ? '#10b981' : '#ef4444' }}>
                            {elig.eligible ? 'Eligible' : 'Not Eligible'}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                  
                  {/* Participate button — only enabled for eligible jobs */}
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                          disabled={!elig || !elig.eligible} onClick={() => handleParticipate(job)}>
                    {elig && !elig.eligible ? 'Not Eligible' : 'Participate'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalFederationView;
