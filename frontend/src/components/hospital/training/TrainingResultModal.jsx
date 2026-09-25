import React from 'react';
import Modal from '../common/Modal';
import { 
  Award, 
  CheckCircle, 
  FileText, 
  Cpu, 
  Share2, 
  ShieldCheck, 
  HardDrive,
  BarChart3
} from 'lucide-react';

const TrainingResultModal = ({ isOpen, onClose, result }) => {
  if (!result) return null;

  const {
    session_id,
    status,
    model_architecture,
    model_id,
    dataset_id,
    duration_seconds,
    epochs_completed,
    metrics,
    checkpoint,
    resource_statistics,
    federation_handoff
  } = result;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} min ${s} sec`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Module 7 TrainingResult & Federation Handoff" maxWidth="680px">
      <div>
        {/* Success Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: '#0a1624',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-healthy)'
            }}>
              <CheckCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Training Completed Successfully
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Session: <span className="font-mono text-cyan">{session_id}</span> | Duration: {formatDuration(duration_seconds)}
              </div>
            </div>
          </div>
          <span className="badge badge-healthy font-mono">
            {status}
          </span>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
            <div className="card-title-muted">Final Val Acc</div>
            <div className="font-mono text-emerald" style={{ fontSize: '18px', fontWeight: 700 }}>
              {(metrics?.val_accuracy * 100).toFixed(1)}%
            </div>
          </div>

          <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
            <div className="card-title-muted">Val Loss</div>
            <div className="font-mono text-cyan" style={{ fontSize: '18px', fontWeight: 700 }}>
              {metrics?.val_loss?.toFixed(4)}
            </div>
          </div>

          <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
            <div className="card-title-muted">Test Acc</div>
            <div className="font-mono text-primary" style={{ fontSize: '18px', fontWeight: 700 }}>
              {(metrics?.test_accuracy * 100).toFixed(1)}%
            </div>
          </div>

          <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
            <div className="card-title-muted">ROC-AUC</div>
            <div className="font-mono text-purple" style={{ fontSize: '18px', fontWeight: 700 }}>
              {metrics?.roc_auc?.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Checkpoint Details */}
        <div style={{
          backgroundColor: '#090d16',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <HardDrive size={14} color="var(--brand-blue)" /> Local Checkpoint & Integrity
          </div>
          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
            <div>
              <span className="text-muted">Storage Path:</span>{' '}
              <span className="font-mono text-primary">{checkpoint?.local_path}</span>
            </div>
            <div>
              <span className="text-muted">Checkpoint Size:</span>{' '}
              <span className="font-mono text-primary">{checkpoint?.size_mb} MB</span>
            </div>
            <div>
              <span className="text-muted">SHA-256 Hash:</span>{' '}
              <span className="font-mono text-code" style={{ wordBreak: 'break-all' }}>{checkpoint?.sha256_hash}</span>
            </div>
          </div>
        </div>

        {/* Resource Footprint Statistics from Module 8 */}
        <div style={{
          backgroundColor: '#090d16',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Cpu size={14} color="var(--accent-teal)" /> Hardware Execution Profile (Module 8 Telemetry)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
            <div>
              <span className="text-muted">Peak VRAM:</span>
              <div className="font-mono text-primary">{resource_statistics?.peak_vram_mb} MB</div>
            </div>
            <div>
              <span className="text-muted">Avg GPU Load:</span>
              <div className="font-mono text-primary">{resource_statistics?.average_gpu_utilization_pct}%</div>
            </div>
            <div>
              <span className="text-muted">OOM Events:</span>
              <div className="font-mono text-emerald">{resource_statistics?.oom_events} (Zero OOM)</div>
            </div>
          </div>
        </div>

        {/* Module 9 Federation Handoff Status */}
        <div style={{
          backgroundColor: '#0c1a2e',
          border: '1px solid rgba(37, 99, 235, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Share2 size={14} /> Module 9 FederationHandoff Ready
            </div>
            <span className="badge badge-blue font-mono" style={{ fontSize: '10px' }}>
              READY FOR FEDAVG
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
            Local training tensors have been bundled into the frozen Module 9 format.
            Contains weight delta parameters across <strong>{federation_handoff?.num_examples}</strong> training examples.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--status-healthy)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <ShieldCheck size={13} />
            <span>{federation_handoff?.privacy_guarantee}</span>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          * Evaluation metrics reflect local cohort validation set performance and do not constitute clinical efficacy claims.
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-teal">
            Close Summary
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TrainingResultModal;
