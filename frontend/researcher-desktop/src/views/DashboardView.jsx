import React from 'react';
import { useApp } from '../context/AppContext';
import { ConvergenceChart } from '../components/charts/ConvergenceChart';
import {
  Building2,
  Activity,
  Layers,
  Clock,
  ShieldCheck,
  Pause,
  Zap,
  CheckCircle,
  Network,
  Lock,
  ArrowUpRight,
  ChevronRight,
  Database
} from 'lucide-react';

export const DashboardView = () => {
  const { setActiveScreen, setActiveModal, sessionStatus, setSessionStatus } = useApp();

  const hospitalsAlignment = [
    { name: 'Johns Hopkins', cos: '0.968', lat: '48 ms', pct: 96.8 },
    { name: 'Mayo Clinic', cos: '0.952', lat: '62 ms', pct: 95.2 },
    { name: 'Charité Berlin', cos: '0.941', lat: '104 ms', pct: 94.1 },
    { name: 'Toronto General', cos: '0.974', lat: '39 ms', pct: 97.4 },
    { name: 'Mass General', cos: '0.981', lat: '41 ms', pct: 98.1 },
    { name: 'Seoul Nat Univ', cos: '0.918', lat: '162 ms', pct: 91.8 },
    { name: 'NHS Trust London', cos: '0.939', lat: '98 ms', pct: 93.9 },
  ];

  const milestones = [
    { time: '09:42:15', title: 'Global Model v2.4 Aggregated & Sealed', desc: 'Server-side FedAvg completed in 14.2s. Gaussian DP noise added (ε=1.24, clipping L2-norm=1.5). Weights dispatched to model registry.', hash: '0x9c..4a' },
    { time: '09:40:02', title: 'All 8 Edge Hospital Updates Received', desc: 'Zero Byzantine or label-flipping vectors detected by Multi-Krum & Trimmed Mean filter. Cosine similarity threshold standard satisfied.', status: '0 Poisoning' },
    { time: '08:35:10', title: 'Charité Berlin Local Training Completed', desc: 'Optimizer: AdamW (lr=1e-4). Local validation loss down to 0.158. Gradient delta ΔW uploaded via TLS 1.3 mTLS tunnel.', meta: 'Batch 32 • 5 Ep' },
    { time: '08:12:00', title: 'Round 14 Dispatched to Hospital Nodes', desc: 'Encrypted model weights synchronized across 8 local clinical firewalls. Client-side local training pipeline initiated.', meta: 'Global v2.3' }
  ];

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 5 Top Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {/* Card 1 */}
        <div className="card" onClick={() => setActiveScreen('hospitals')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>HOSPITAL NODES</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>● 100% QUORUM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">8</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 8 CONNECTED</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            mTLS 1.3 Strict <strong style={{ color: 'var(--status-healthy)' }}>0 egress</strong>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" onClick={() => setActiveScreen('training')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>LIVE FL SESSION</span>
            <span className="badge badge-blue" style={{ fontSize: '9px' }}>EXP-D84</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">1</span>
            <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>Chest CT Pulmo</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Nodule Detection <span style={{ color: '#60a5fa' }}>FedAvg v3</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card" onClick={() => setActiveScreen('models')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>TASK MODELS</span>
            <span className="badge" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)' }}>REGISTRY</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">6</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            DenseNet • SwinUN... <strong style={{ color: 'var(--text-primary)' }}>4 Prod</strong>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card" onClick={() => setActiveScreen('training')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>CURRENT ROUND</span>
            <span className="badge badge-cyan" style={{ fontSize: '9px' }}>EPOCH SYNC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">14</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 20</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px', marginLeft: 'auto' }}>70%</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Agg: 4m ago • <span style={{ color: '#38bdf8' }}>Next: 01:24</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="card" onClick={() => setActiveScreen('security')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>BYZANTINE GUARD</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>● OPTIMAL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--status-healthy)' }} className="font-mono">0</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Anomalies</span>
            <span style={{ fontSize: '10px', color: 'var(--accent-teal)', marginLeft: 'auto' }}>82% DP rem</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            ε=1.24 δ=1e-5 • <span style={{ color: 'var(--status-healthy)' }}>Laplace OK</span>
          </div>
        </div>
      </div>

      {/* Active FL Session Card */}
      <div className="card" style={{ background: 'linear-gradient(180deg, #131b2e 0%, #0e1526 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>ACTIVE SESSION</span>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: EXP-FL-2025-084</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-healthy)', fontSize: '11px' }}>
                <span className="pulse-dot healthy" /> Aggregating Server Online
              </span>
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
              EfficientNet-B0-FL v2.4 (Chest CT Pulmo Segmentation &amp; Nodule Classification)
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveModal('haltTraining')}
            >
              <Pause size={13} />
              <span>Pause Round</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setActiveScreen('training')}
            >
              <Zap size={13} />
              <span>Trigger Fast Eval</span>
            </button>
          </div>
        </div>

        {/* 4 Core Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          background: 'var(--bg-nested)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>GLOBAL ACCURACY</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--status-healthy)' }} className="font-mono">
              93.84% <span style={{ fontSize: '11px', color: '#10b981' }}>+1.12%</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target: 92.00% (✓ surpassed)</div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>GLOBAL LOSS (CROSS-ENTROPY)</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#60a5fa' }} className="font-mono">
              0.1420 <span style={{ fontSize: '11px', color: '#60a5fa' }}>-0.028</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Epoch convergence stable</div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>MACRO F1 SCORE</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }} className="font-mono">
              0.926 <span className="badge badge-healthy" style={{ fontSize: '9px', verticalAlign: 'middle' }}>Balanced</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AUC-ROC: 0.9782</div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>SERVER FEDAVG DURATION</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
              14.2s <span style={{ fontSize: '11px', color: 'var(--status-healthy)' }}>Krum check pass</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Weights: 184.2 MB compressed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span><strong>Round 14 of 20</strong> • Local training done • Differential noise applied</span>
            <span className="font-mono" style={{ color: 'var(--accent-teal)' }}>70% Session Progress</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #2563eb, #06b6d4)' }} />
          </div>
        </div>

        {/* 8 Participating Enclaves verified chips */}
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
            FEDERATED QUORUM (8/8 VERIFIED):
          </span>
          {[
            'Johns Hopkins', 'Mayo Clinic', 'Charité Berlin', 'Toronto General',
            'Mass General', 'Seoul Nat Univ', 'NHS Trust', 'Zurich Hospital'
          ].map((h, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--bg-nested)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 7px',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              <CheckCircle size={10} color="var(--status-healthy)" />
              <span>{h}</span>
              <span style={{ color: 'var(--status-healthy)', fontSize: '9px' }}>ΔW</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Convergence & Node Gradient Similarity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        {/* Left Column: Convergence Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Federated Global Convergence</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Accuracy &amp; Validation Loss Trajectory (Rounds 1 - 14)</div>
            </div>
          </div>
          <ConvergenceChart height={170} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
            <span>✔ Monotonic convergence pattern observed with zero gradient divergence across institutions.</span>
            <span>Learning Rate: <strong className="font-mono">1e-4 Cosine</strong></span>
          </div>
        </div>

        {/* Right Column: Node Gradient Similarity & Latency */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Node Gradient Similarity &amp; Latency</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cosine Alignment to FedAvg Consensus &amp; Round Uplink ms</div>
            </div>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>NO DATA DRIFT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {hospitalsAlignment.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '95px', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.name}
                </span>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${h.pct}%`, height: '100%', background: '#10b981' }} />
                </div>
                <span className="font-mono" style={{ fontSize: '10px', width: '50px', color: '#10b981', textAlign: 'right' }}>
                  cos {h.cos}
                </span>
                <span className="font-mono" style={{ fontSize: '10px', width: '45px', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {h.lat}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
            <span>Krum Outlier Threshold: <strong style={{ color: 'var(--status-danger)' }}>&lt; 0.700</strong></span>
            <span>Mean Cosine: <strong style={{ color: 'var(--status-healthy)' }}>0.9529 (±0.019)</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Milestones & Zero-Raw-Data Protocol Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '14px' }}>
        {/* Milestones */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={15} color="var(--brand-blue)" />
              <span>Federated Milestones &amp; Audit Log</span>
            </div>
            <button 
              className="btn btn-ghost" 
              style={{ fontSize: '11px', padding: '2px 6px' }}
              onClick={() => setActiveScreen('audit')}
            >
              <span>Full Audit Ledger</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {milestones.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                padding: '8px 10px',
                background: 'var(--bg-nested)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-teal)', minWidth: '55px' }}>
                  {m.time}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {m.title}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                    {m.desc}
                  </p>
                </div>
                {m.hash && (
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--status-healthy)', alignSelf: 'flex-start' }}>
                    {m.hash}
                  </span>
                )}
                {m.status && (
                  <span className="badge badge-healthy" style={{ fontSize: '9px', alignSelf: 'flex-start' }}>
                    {m.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Zero-Raw-Data Strict Air-Gap Protocol Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <Lock size={15} color="var(--status-healthy)" />
                <span>Zero-Raw-Data Protocol</span>
              </div>
              <span className="badge badge-healthy" style={{ fontSize: '9px' }}>STRICT AIR-GAP</span>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid var(--status-healthy-border)',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--status-healthy)', fontSize: '12px' }}>
                <ShieldCheck size={14} />
                <span>Zero Patient Images Transferred</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Strict mathematical guarantee. Only ephemeral numerical gradient updates (ΔW) leave local institutional PACS systems.
              </p>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Avg Node VRAM Utilization:</span>
                <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>14.2 GB / 24 GB (A100/H100)</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '63%', height: '100%', background: '#3b82f6' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span>Edge Compute Load:</span>
                <span style={{ color: 'var(--status-healthy)' }}>78% Peak (Nominal)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '14px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => setActiveScreen('training')}>
              <Network size={12} />
              <span>View Topology</span>
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => setActiveModal('exportWeights')}>
              <Database size={12} />
              <span>Inspect Weights</span>
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => setActiveScreen('security')}>
              <ShieldCheck size={12} />
              <span>Security Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
