import React from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Server, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PauseCircle,
  BarChart2
} from 'lucide-react';

const TrainingMonitor = ({ session, onHalt, onViewResults }) => {
  if (!session) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <Activity size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          No Active Local Training Session
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Select a dataset and launch a resource-aware recommendation in the Start Training view.
        </p>
      </div>
    );
  }

  const {
    session_id,
    config,
    status,
    current_epoch,
    total_epochs,
    current_batch,
    total_batches_per_epoch,
    current_batch_size,
    train_loss,
    val_loss,
    train_acc,
    val_acc,
    elapsed_seconds,
    eta_seconds,
    gpu_util_pct,
    vram_used_mb,
    ram_used_gb,
    cpu_util_pct,
    adaptation_events,
    logs
  } = session;

  const isCompleted = status === 'COMPLETED';
  const isTraining = status === 'TRAINING';

  const epochProgress = Math.min(100, Math.round((current_epoch / total_epochs) * 100));
  const batchProgress = total_batches_per_epoch > 0 
    ? Math.min(100, Math.round((current_batch / total_batches_per_epoch) * 100))
    : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Active Session Status Header */}
      <div className="card" style={{ border: isTraining ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`pulse-dot ${isTraining ? 'warning' : isCompleted ? 'healthy' : 'healthy'}`} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Session: <span className="font-mono text-cyan">{session_id}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Architecture: <strong className="text-primary">{config?.architecture}</strong> | Device: <strong className="text-primary">{config?.hardware_execution?.device}</strong> ({config?.hardware_execution?.precision})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${isTraining ? 'badge-warning' : isCompleted ? 'badge-healthy' : 'badge-neutral'}`}>
              {status}
            </span>
            {isTraining && (
              <button onClick={onHalt} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                <PauseCircle size={13} /> Terminate
              </button>
            )}
            {isCompleted && onViewResults && (
              <button onClick={onViewResults} className="btn btn-teal" style={{ padding: '4px 10px', fontSize: '11px' }}>
                <CheckCircle size={13} /> View Full TrainingResult
              </button>
            )}
          </div>
        </div>

        {/* Progress Bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Epoch Progress:</span>
              <span className="font-mono text-primary" style={{ fontWeight: 600 }}>
                {current_epoch} / {total_epochs} ({epochProgress}%)
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#090d16', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${epochProgress}%`,
                background: 'linear-gradient(90deg, #0891b2 0%, #10b981 100%)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Batch Step Progress:</span>
              <span className="font-mono text-primary" style={{ fontWeight: 600 }}>
                Step {current_batch} / {total_batches_per_epoch}
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#090d16', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${batchProgress}%`,
                backgroundColor: 'var(--brand-blue)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Timing Counters */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px' }}>
          <div>
            <span className="text-muted">Elapsed Time:</span>{' '}
            <span className="font-mono text-primary" style={{ fontWeight: 600 }}>{formatTime(elapsed_seconds)}</span>
          </div>
          <div>
            <span className="text-muted">Estimated Remaining:</span>{' '}
            <span className="font-mono text-cyan" style={{ fontWeight: 600 }}>{isCompleted ? '0s' : formatTime(eta_seconds)}</span>
          </div>
          <div>
            <span className="text-muted">Effective Batch Size:</span>{' '}
            <span className="font-mono text-primary" style={{ fontWeight: 600 }}>{current_batch_size}</span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics & Hardware Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {/* Train Loss */}
        <div className="card" style={{ padding: '12px' }}>
          <div className="card-title-muted">Train Loss (CrossEntropy)</div>
          <div className="font-mono text-cyan" style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
            {train_loss.toFixed(4)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Decreasing as expected
          </div>
        </div>

        {/* Val Loss */}
        <div className="card" style={{ padding: '12px' }}>
          <div className="card-title-muted">Validation Loss</div>
          <div className="font-mono text-primary" style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
            {val_loss.toFixed(4)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Generalization monitored
          </div>
        </div>

        {/* Val Accuracy */}
        <div className="card" style={{ padding: '12px' }}>
          <div className="card-title-muted">Validation Accuracy</div>
          <div className="font-mono text-emerald" style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
            {(val_acc * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Train Acc: {(train_acc * 100).toFixed(1)}%
          </div>
        </div>

        {/* VRAM Live Usage */}
        <div className="card" style={{ padding: '12px' }}>
          <div className="card-title-muted">VRAM / GPU Utilization</div>
          <div className="font-mono text-primary" style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
            {vram_used_mb} MB <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({gpu_util_pct}%)</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '2px' }}>
            RAM: {ram_used_gb} GB | CPU: {cpu_util_pct}%
          </div>
        </div>
      </div>

      {/* Live Stream Execution Log */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="var(--accent-teal)" /> Module 7 Execution Stream
          </span>
          <span className="badge badge-teal font-mono" style={{ fontSize: '10px' }}>
            STDOUT / Telemetry
          </span>
        </div>
        <div style={{
          height: '140px',
          overflowY: 'auto',
          backgroundColor: '#070b12',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)'
        }}>
          {logs && logs.length > 0 ? (
            logs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes('Loss') ? '#38bdf8' : 'inherit' }}>
                {log}
              </div>
            ))
          ) : (
            <div className="text-muted">Awaiting Module 7 process spawn...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingMonitor;
