import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Network,
  Shield,
  Lock,
  Pause,
  StopCircle,
  Save,
  Download,
  CheckCircle,
  ArrowDown,
  Cpu,
  Activity,
  Layers,
  Clock,
  ShieldAlert,
  Zap
} from 'lucide-react';

export const FederatedTrainingView = () => {
  const { setActiveModal, setActiveScreen, sessionStatus, setSessionStatus } = useApp();
  const [algo, setAlgo] = useState('fedavg'); // 'fedavg' | 'fedprox'
  const [noiseMultiplier, setNoiseMultiplier] = useState(0.85);
  const [clipNorm, setClipNorm] = useState(1.0);
  const [batchSize, setBatchSize] = useState(32);
  const [epochs, setEpochs] = useState(5);
  const [viewTab, setViewTab] = useState('pipeline'); // 'pipeline' | 'details'

  const edgeEnclaves = [
    {
      name: 'Mayo Clinic Rochester',
      nodeId: '0x4f8269',
      dataset: '1,840 Chest CTs',
      training: 'Epoch 5/5 (Loss 0.142)',
      egress: 'Encrypted (ΔW)',
      latency: '142ms',
      norm: '0.94 < 1.0'
    },
    {
      name: 'Johns Hopkins Hospital',
      nodeId: '0x9c31be',
      dataset: '2,120 Scans (GE)',
      training: 'Epoch 5/5 (Loss 0.138)',
      egress: 'Encrypted (ΔW)',
      latency: '158ms',
      norm: '0.89 < 1.0'
    },
    {
      name: 'Charité Univ. Berlin',
      nodeId: '0xd8293f',
      dataset: '1,490 Scans (Siemens)',
      training: 'Epoch 5/5 (Loss 0.155)',
      egress: 'Encrypted (ΔW)',
      latency: '210ms',
      norm: '0.97 < 1.0'
    },
    {
      name: 'Mass General Brigham',
      nodeId: '0x117ca5',
      dataset: '1,960 Scans (Philips)',
      training: 'Epoch 5/5 (Loss 0.141)',
      egress: 'Encrypted (ΔW)',
      latency: '155ms',
      norm: '0.91 < 1.0'
    }
  ];

  const quorumLedger = [
    { name: 'Mayo Clinic', id: '0x4f8269', scans: '1,840', epoch: '5/5 Done', cos: '0.984', lat: '142ms', sig: '0x3fa...819' },
    { name: 'Johns Hopkins', id: '0x9c31be', scans: '2,120', epoch: '5/5 Done', cos: '0.991', lat: '158ms', sig: '0x7b5...442' },
    { name: 'Charité Berlin', id: '0xd8293f', scans: '1,490', epoch: '5/5 Done', cos: '0.978', lat: '210ms', sig: '0xec2...990' },
    { name: 'Mass General', id: '0x117ca5', scans: '1,960', epoch: '5/5 Done', cos: '0.987', lat: '155ms', sig: '0xa4a...318' },
    { name: 'Cleveland Clinic', id: '0x6e5921', scans: '1,310', epoch: '5/5 Done', cos: '0.975', lat: '172ms', sig: '0x15f...cd1' },
    { name: 'Karolinska Inst', id: '0xa22b0ca', scans: '1,820', epoch: '5/5 Done', cos: '0.982', lat: '224ms', sig: '0x298...a7e' },
    { name: 'UCSF Health', id: '0x6a18d3', scans: '2,400', epoch: '5/5 Done', cos: '0.993', lat: '131ms', sig: '0xe82...53d' },
    { name: 'Tokyo Univ Med', id: '0x77c1aa', scans: '1,260', epoch: '5/5 Done', cos: '0.971', lat: '230ms', sig: '0x821...bc9' },
  ];

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Session Metadata & Actions Header */}
      <div className="card" style={{ background: 'linear-gradient(180deg, #131b2e 0%, #0c1220 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              SESSION ID: <span style={{ color: '#38bdf8' }}>0x8892-D</span> • SECURE CONSENSUS REACHED • INITIATED: TODAY 08:50:12 UTC • TARGET: CHEST CT 3D NODULE SEGMENTATION
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
              Exp-FL-2025-084: Multi-Hospital Federated Segmentation &amp; Nodule Classification
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span className="badge badge-blue font-mono" style={{ fontSize: '10px' }}>
                ROUND 14 / 20 (Aggregating Parameter Tensors...)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--status-healthy)' }}>
                <Lock size={11} />
                <span>mTLS 1.3 Strict</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--status-healthy)' }}>
                <CheckCircle size={11} />
                <span>Zero-Raw-Data Protocol: Verified</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setSessionStatus(sessionStatus === 'running' ? 'paused' : 'running')}
            >
              <Pause size={13} />
              <span>{sessionStatus === 'running' ? 'Pause Training' : 'Resume'}</span>
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setActiveModal('haltTraining')}
            >
              <StopCircle size={13} />
              <span>Halt Session</span>
            </button>
            <button className="btn btn-secondary" onClick={() => alert('Checkpoint v2.4-R14 saved to ledger.')}>
              <Save size={13} />
              <span>Save Checkpoint</span>
            </button>
            <button className="btn btn-primary" onClick={() => setActiveModal('exportWeights')}>
              <Download size={13} />
              <span>Export Weights (.pt)</span>
            </button>
          </div>
        </div>

        {/* Tab switch for Workflow vs Detailed Timeline */}
        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <button
            className={`btn ${viewTab === 'pipeline' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => setViewTab('pipeline')}
          >
            <Network size={12} />
            <span>Topological Pipeline Workflow</span>
          </button>
          <button
            className={`btn ${viewTab === 'details' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => setViewTab('details')}
          >
            <Clock size={12} />
            <span>Round 1 - 14 Detailed Timeline</span>
          </button>
        </div>
      </div>

      {viewTab === 'pipeline' ? (
        /* Topological Data Flow DAG Pipeline */
        <div className="card" style={{ background: 'var(--bg-nested)', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>TOPOLOGICAL DATA FLOW</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                Privacy-Preserving Federated Aggregation Pipeline
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px' }}>
              <div className="badge badge-healthy">
                <span className="pulse-dot healthy" /> Pipeline Status: Latency Optimal (174ms)
              </div>
              <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                PROTOCOL: FedAvg + Gaussian DP (ε=1.24)
              </span>
            </div>
          </div>

          {/* Tier 01: Hospital Edge Enclaves (Local Compute Only) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>TIER 01: CLIENT EDGE ENCLAVES (LOCAL COMPUTE ONLY - ZERO RAW DATA EGRESS)</span>
              <span style={{ color: 'var(--status-healthy)', fontWeight: '600' }}>8 of 8 Enclaves Online &amp; Trained</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {edgeEnclaves.map((e, idx) => (
                <div key={idx} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '11px' }}>{e.name}</strong>
                    <span className="badge badge-healthy" style={{ fontSize: '8px', padding: '1px 4px' }}>● Ready</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Node ID: {e.nodeId}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Dataset:</span> <strong style={{ color: 'var(--text-primary)' }}>{e.dataset}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Local Training:</span> <span style={{ color: 'var(--status-healthy)' }}>{e.training}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gradient Egress:</span> <span className="font-mono" style={{ color: '#38bdf8' }}>{e.egress}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '6px' }}>
                    <span>Latency: {e.latency}</span>
                    <span style={{ color: 'var(--status-healthy)' }}>Norm: {e.norm}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connector Down Arrow */}
          <div style={{ textAlign: 'center', margin: '12px 0' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '10px',
              color: '#93c5fd'
            }}>
              <ArrowDown size={12} color="#60a5fa" />
              <span>8/8 Encrypted Gradient Tensors (ΔW) via TLS 1.3 mTLS with Mutual Attestation</span>
            </div>
          </div>

          {/* Tier 02: Byzantine Defense & DP Engine */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Byzantine Filter */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} color="var(--status-healthy)" />
                  <strong style={{ fontSize: '12px', color: '#f8fafc' }}>Byzantine Defense &amp; Anomaly Quarantine</strong>
                </div>
                <span className="badge badge-healthy" style={{ fontSize: '9px' }}>0 Poisoned Tensors</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '8px' }}>
                Multi-Krum geometric outlier filter cross-references gradient vectors. Extreme directional departures (&gt; 2.0σ) are instantly flagged and discarded before arithmetic aggregation.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-nested)', padding: '6px 8px', borderRadius: '4px' }}>
                <span>Algorithm: <strong>Multi-Krum (m=2)</strong></span>
                <span>L2 Norm Clip: <strong className="font-mono">C = 1.0 (Enforced)</strong></span>
                <span>Quarantine Status: <strong style={{ color: 'var(--status-healthy)' }}>PASS 8/8 Nodes</strong></span>
              </div>
            </div>

            {/* Differential Privacy Engine */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="var(--accent-teal)" />
                  <strong style={{ fontSize: '12px', color: '#f8fafc' }}>Differential Privacy Engine (DP-FedAvg)</strong>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '9px' }}>Active (ε=1.24)</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '8px' }}>
                Injects calibrated Gaussian noise N(0, σ² C² I) ensuring mathematical impossibility of patient record reconstruction from shared parameter updates.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-nested)', padding: '6px 8px', borderRadius: '4px' }}>
                <span>Epsilon Budget: <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>ε = 1.24 / 1.50 Max</strong></span>
                <span>Delta Guarantee: <strong className="font-mono">δ = 1e-5 Strict</strong></span>
                <span>Noise Multiplier: <strong className="font-mono">σ = 0.85 Calibrated</strong></span>
              </div>
            </div>
          </div>

          {/* Connector Down Arrow */}
          <div style={{ textAlign: 'center', margin: '12px 0' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '10px',
              color: 'var(--status-healthy)'
            }}>
              <ArrowDown size={12} color="var(--status-healthy)" />
              <span>Cleaned &amp; Perturbed Updates Dispatched to Aggregation Core</span>
            </div>
          </div>

          {/* Tier 03: Central Federated Aggregation Engine */}
          <div style={{
            background: 'linear-gradient(90deg, #131b2e 0%, #172440 100%)',
            border: '1px solid var(--brand-blue)',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#ffffff' }}>Central Federated Aggregation Engine</strong>
                  <span className="badge badge-blue" style={{ fontSize: '9px' }}>FedAvg v3.2</span>
                </div>
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Server computes parameter weight synthesis: W_(t+1) = Σ (n_k / N) W_t^k (Synchronous Consensus)
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>GLOBAL MODEL ARTIFACT</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--status-healthy)' }}>
                v2.4-Round14-Staging
              </div>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                Hash: 0x8a92...fc10 (Signed)
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Timeline for Rounds 1 - 14 */
        <div className="card">
          <div className="card-header">
            <span className="card-title">Chronological Training Timeline (Rounds 1 - 14)</span>
            <span className="badge badge-blue">14 / 20 Completed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { r: 14, acc: '93.84%', loss: '0.1420', nodes: '8/8', dp: 'ε=1.24', duration: '14.2s', status: 'RUNNING / AGGREGATING' },
              { r: 13, acc: '93.51%', loss: '0.1452', nodes: '8/8', dp: 'ε=1.21', duration: '14.5s', status: 'COMPLETED' },
              { r: 12, acc: '93.10%', loss: '0.1524', nodes: '8/8', dp: 'ε=1.18', duration: '14.1s', status: 'COMPLETED' },
              { r: 11, acc: '92.74%', loss: '0.1620', nodes: '8/8', dp: 'ε=1.13', duration: '14.4s', status: 'COMPLETED' },
              { r: 10, acc: '92.12%', loss: '0.1765', nodes: '8/8', dp: 'ε=1.06', duration: '14.8s', status: 'COMPLETED' },
              { r: 9, acc: '91.30%', loss: '0.1942', nodes: '8/8', dp: 'ε=0.98', duration: '14.2s', status: 'COMPLETED' }
            ].map((rnd) => (
              <div key={rnd.r} style={{
                display: 'grid',
                gridTemplateColumns: '80px 100px 100px 100px 100px 100px 1fr',
                gap: '10px',
                padding: '8px 12px',
                background: rnd.r === 14 ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-nested)',
                border: `1px solid ${rnd.r === 14 ? 'var(--brand-blue)' : 'var(--border-subtle)'}`,
                borderRadius: '5px',
                fontSize: '11px',
                alignItems: 'center'
              }}>
                <span className="font-mono" style={{ fontWeight: '600' }}>Round {rnd.r}</span>
                <span>Acc: <strong style={{ color: 'var(--status-healthy)' }}>{rnd.acc}</strong></span>
                <span>Loss: <strong style={{ color: '#60a5fa' }}>{rnd.loss}</strong></span>
                <span>Quorum: <strong className="font-mono">{rnd.nodes}</strong></span>
                <span>DP: <strong style={{ color: 'var(--accent-teal)' }}>{rnd.dp}</strong></span>
                <span>Time: {rnd.duration}</span>
                <span style={{ textAlign: 'right' }}>
                  <span className={`badge ${rnd.r === 14 ? 'badge-blue' : 'badge-healthy'}`} style={{ fontSize: '9px' }}>
                    {rnd.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Columns: Hyperparameters & Quorum Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px' }}>
        {/* Left: Hyperparameters */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Federated Hyperparameters</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>State: ACTIVE EXECUTION</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Aggregation Algorithm:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  className={`btn ${algo === 'fedavg' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '11px' }}
                  onClick={() => setAlgo('fedavg')}
                >
                  FedAvg (Momentum)
                </button>
                <button
                  className={`btn ${algo === 'fedprox' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '11px' }}
                  onClick={() => setAlgo('fedprox')}
                >
                  FedProx (μ=0.01)
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Total Fed Rounds:</span>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
                  20 <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(14 Done)</span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Client Local Epochs:</span>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
                  5 <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Per Round</span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Local Batch Size:</span>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
                  32 <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>3D Patches</span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Global Learning Rate:</span>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }} className="font-mono">
                  0.001 <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cosine</span>
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>DP Gaussian Noise Multiplier:</span>
                <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>σ = {noiseMultiplier}</strong>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={noiseMultiplier}
                onChange={(e) => setNoiseMultiplier(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                <span>L2 Norm Clip Bound: 1.0</span>
                <span>Projected Max ε: 1.24</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hospital Node Quorum Ledger Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="card-title">Hospital Node Quorum Ledger</span>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Round 14 Weight Ingestion Status • Consensus Threshold: 100%
              </div>
            </div>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>8/8 Updates Ingested</span>
          </div>

          <table className="fl-table">
            <thead>
              <tr>
                <th>NODE / INSTITUTION</th>
                <th>LOCAL DATASET</th>
                <th>EPOCH STATUS</th>
                <th>SIM (COS)</th>
                <th>LATENCY</th>
                <th>CRYPTOGRAPHIC SIG</th>
              </tr>
            </thead>
            <tbody>
              {quorumLedger.map((q, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{q.name}</div>
                    <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{q.id}</div>
                  </td>
                  <td>{q.scans} Scans</td>
                  <td>
                    <span className="badge badge-healthy" style={{ fontSize: '9px' }}>{q.epoch}</span>
                  </td>
                  <td className="font-mono" style={{ color: 'var(--status-healthy)' }}>{q.cos}</td>
                  <td className="font-mono" style={{ color: 'var(--text-muted)' }}>{q.lat}</td>
                  <td>
                    <code className="font-mono" style={{ fontSize: '10px', color: '#38bdf8' }}>{q.sig}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>GLOBAL DICE LOSS CONVERGENCE</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#60a5fa' }} className="font-mono">
            0.1412 <span style={{ fontSize: '10px', color: 'var(--status-healthy)' }}>-0.014 Δ</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target: &lt; 0.120</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SEGMENTATION DICE METRIC</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--status-healthy)' }} className="font-mono">
            91.4% <span style={{ fontSize: '10px', color: 'var(--status-healthy)' }}>+3.4% vs local baseline</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>IoU: 84.7%</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ROUND 14 AGGREGATION TIMER</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
            00:07:53 <span style={{ fontSize: '10px', color: 'var(--accent-teal)' }}>Live Clock</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Throughput: 34.2 MB/s • ETA: ~35 mins</div>
        </div>
      </div>
    </div>
  );
};
