import React, { useState, useEffect } from 'react';
import { getJobs, createJob, createRound, aggregateRound } from '../services/federationService';
import { Network, Plus, CheckCircle, RefreshCw } from 'lucide-react';

export const FederatedTrainingView = () => {

  const [jobs, setJobs] = useState([]);
  const [architectures, setArchitectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create Job Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    job_id: '',
    task: '',
    architecture: 'ResNet50', // Will default to first if available
    num_classes: 2,
    class_mapping_list: ['', ''], // dynamic list of class names
    minimum_participants: 2
  });

  const loadJobsAndArchs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resJobs, resArchs] = await Promise.all([
        getJobs(),
        import('../services/federationService').then(m => m.getArchitectures())
      ]);
      
      if (resArchs.success) {
        setArchitectures(resArchs.architectures);
        if (resArchs.architectures.length > 0 && !newJob.architecture) {
          setNewJob(prev => ({ ...prev, architecture: resArchs.architectures[0].name }));
        }
      }
      
      if (resJobs.success) {
        setJobs(resJobs.jobs);
      } else {
        setError(resJobs.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsAndArchs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      if (newJob.num_classes < 2) throw new Error("Number of classes must be >= 2");
      if (!newJob.architecture) throw new Error("Architecture is required");
      
      let class_mapping = {};
      const validClasses = newJob.class_mapping_list.map(s => s.trim()).filter(s => s);
      if (validClasses.length !== newJob.num_classes) {
        throw new Error(`Expected exactly ${newJob.num_classes} non-empty class names, got ${validClasses.length}`);
      }
      validClasses.forEach((name, idx) => { class_mapping[name] = idx; });

      await createJob({
        ...newJob,
        class_mapping
      });
      setShowCreateForm(false);
      loadJobsAndArchs();
    } catch (err) {
      alert("Error creating job: " + err.message);
    }
  };

  const handleAggregate = async (jobId, roundId) => {
    try {
      await aggregateRound(jobId, roundId);
      alert("Aggregation successful!");
      loadJobsAndArchs();
    } catch (err) {
      alert("Error aggregating round: " + err.message);
    }
  };

  const handleDeleteJob = async (job) => {
    const hasHistory = job.rounds && job.rounds.some(r => r.accepted_participants.length > 0 || !['CREATED', 'OPEN', 'RECEIVING'].includes(r.status));
    
    let msg = `Delete Federation Job?\n\n${job.federation_job_id}\n\n`;
    if (hasHistory) {
      msg += `This federation job contains completed federation activity.\nIt cannot be permanently deleted.\nYou may archive/cancel it instead.`;
    } else {
      msg += `This job has no federation history.\nIt will be permanently removed.`;
    }
    
    if (window.confirm(msg)) {
      try {
        const { deleteJob } = await import('../services/federationService');
        await deleteJob(job.federation_job_id);
        loadJobsAndArchs();
      } catch (err) { alert(err.message); }
    }
  };

  const handleDeleteRound = async (round) => {
    const hasHistory = round.accepted_participants.length > 0 || !['CREATED', 'OPEN', 'RECEIVING'].includes(round.status);
    
    let msg = `Delete Round?\n\nRound ${round.round_number}\n\n`;
    if (hasHistory) {
      msg += `This round contains federation history and cannot be permanently deleted.\nCancel round?`;
    } else {
      msg += `This round has no submitted updates and can be permanently deleted.`;
    }
    
    if (window.confirm(msg)) {
      try {
        const { deleteRound } = await import('../services/federationService');
        await deleteRound(round.round_id);
        loadJobsAndArchs();
      } catch (err) { alert(err.message); }
    }
  };

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>Federation Jobs & Rounds</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage federated learning jobs, participants, and aggregations</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={loadJobsAndArchs}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={14} /> New Federation Job
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '12px' }}>Create Federation Job</h3>
          <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Job ID</label>
                <input required placeholder="e.g. JOB_01" style={{ padding: '8px', background: 'var(--bg-nested)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px' }} value={newJob.job_id} onChange={e => setNewJob({...newJob, job_id: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Task / Disease</label>
                <input required placeholder="e.g. Malaria" style={{ padding: '8px', background: 'var(--bg-nested)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px' }} value={newJob.task} onChange={e => setNewJob({...newJob, task: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Architecture</label>
                <select required style={{ padding: '8px', background: 'var(--bg-nested)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px' }} value={newJob.architecture} onChange={e => setNewJob({...newJob, architecture: e.target.value})}>
                  {architectures.map(arch => (
                    <option key={arch.name} value={arch.name}>{arch.display_name || arch.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Number of Classes</label>
                <input type="number" min="2" required style={{ padding: '8px', background: 'var(--bg-nested)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px' }} value={newJob.num_classes} onChange={e => {
                  const num = parseInt(e.target.value);
                  let newList = [...newJob.class_mapping_list];
                  if (num > newList.length) {
                    while(newList.length < num) newList.push('');
                  } else if (num < newList.length) {
                    newList = newList.slice(0, num);
                  }
                  setNewJob({...newJob, num_classes: num, class_mapping_list: newList});
                }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>Canonical Class Mapping (Required)</label>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Specify the exact class labels for the dataset in order.</div>
              {newJob.class_mapping_list.map((cls, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '20px' }}>{idx}:</span>
                  <input required placeholder={`Class ${idx} (e.g. Normal)`} style={{ padding: '6px 8px', background: 'var(--bg-nested)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px', flex: 1 }} value={cls} onChange={e => {
                    const newList = [...newJob.class_mapping_list];
                    newList[idx] = e.target.value;
                    setNewJob({...newJob, class_mapping_list: newList});
                  }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="submit" className="btn btn-primary">Create Job</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#fff' }}>Loading jobs...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map(job => (
            <div key={job.federation_job_id} className="card" style={{ background: 'var(--bg-nested)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>{job.task} / {job.architecture}</div>
                  <h2 style={{ fontSize: '16px', color: '#fff' }}>{job.federation_job_id}</h2>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div className="badge badge-primary">{job.status}</div>
                  <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={() => handleDeleteJob(job)}>
                    Delete
                  </button>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Min Participants: {job.minimum_participants}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Canonical Class Mapping:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {job.class_mapping && Object.entries(job.class_mapping).map(([name, idx]) => (
                    <span key={name} style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      {idx}: <span style={{ color: '#fff' }}>{name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px' }}>Rounds</h4>
                {job.rounds && job.rounds.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {job.rounds.map(round => (
                      <div key={round.round_id} style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>Round {round.round_number} ({round.round_id})</span>
                            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Status: {round.status}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Base Model VERIFIED (ID: {round.base_model_id || 'N/A'})
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Deadline: {round.deadline}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary" onClick={() => handleAggregate(job.federation_job_id, round.round_id)} disabled={round.status === 'COMPLETED'}>
                              Aggregate Round
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDeleteRound(round)}>
                              Delete Round
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                          <h5 style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Participants ({round.received_participants.length})</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {round.received_participants.map((pid, idx) => {
                              const isAccepted = round.accepted_participants.includes(pid);
                              const isRejected = round.rejected_participants.includes(pid);
                              return (
                                <div key={idx} style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{pid}</span>
                                  {isAccepted ? <span style={{ color: 'var(--status-healthy)' }}>ACCEPTED ✓</span> : 
                                   isRejected ? <span style={{ color: '#ef4444' }}>REJECTED / EXPIRED</span> : 
                                   <span style={{ color: '#eab308' }}>WAITING</span>}
                                </div>
                              );
                            })}
                            {round.received_participants.length === 0 && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No updates received yet.</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No rounds created yet.</div>
                )}
              </div>
            </div>
          ))}
          {jobs.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No federation jobs found.</div>}
        </div>
      )}
    </div>
  );
};
