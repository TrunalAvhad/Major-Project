import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RadarChart } from '../components/charts/RadarChart';
import {
  Cpu,
  Layers,
  Shield,
  Download,
  Plus,
  ArrowLeftRight,
  CheckCircle,
  ExternalLink,
  Zap,
  Lock,
  Play
} from 'lucide-react';

export const ModelsView = () => {
  const { setActiveScreen, setActiveModal } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [compareSelection, setCompareSelection] = useState({ effnet: true, resnet: true });

  const models = [
    {
      id: 'effnet-b0',
      name: 'EfficientNet-B0-FL v2.4',
      badge: 'DEPLOYABLE',
      sha: '0x8a92...fc10',
      task: 'Chest CT Pulmo Segmentation & Nodule Classification',
      backbone: 'EffNet-B0 + 3D UNet',
      params: '5.3M',
      flScheme: 'FedAvg (Momentum)',
      dpNoise: 'σ=0.85 (ε=1.24)',
      dice: '91.4%',
      f1: '0.926',
      auc: '0.9782',
      loss: '0.1412',
      roundInfo: 'Round 14 of 20 (Converging smoothly)',
      dataset: '8 Nodes • 13,990 Scans',
      status: 'production',
      isPrimary: true
    },
    {
      id: 'resnet-50',
      name: 'ResNet-50-FL v1.9',
      badge: 'mTLS CERTIFIED',
      sha: '0x3fe1...99bc',
      task: 'Multi-Class Brain MRI Glioma Grading',
      backbone: 'ResNet-50 + MedHead',
      params: '25.6M',
      flScheme: 'FedProx (μ=0.01)',
      dpNoise: 'σ=0.90 (ε=1.12)',
      accuracy: '91.20%',
      f1: '0.904',
      auc: '0.9610',
      loss: '0.1840',
      roundInfo: 'Round 25 of 30 (Epoch Sync Phase)',
      dataset: '6 Enclaves • 8,420 Volumes',
      status: 'staging'
    },
    {
      id: 'swin-unetr',
      name: 'Swin-UNETR-FL v1.8',
      badge: 'ARCHIVED REFERENCE',
      sha: '0x7ca1...02fa',
      task: '3D Abdominal Organ Multi-Organ Segmentation',
      backbone: 'Swin Vision Transformer',
      params: '62.2M',
      flScheme: 'FedAvg',
      dpNoise: 'ε=1.45',
      dice: '88.7%',
      f1: '0.881',
      auc: '0.9420',
      loss: '0.2190',
      roundInfo: 'Converged (Run Terminal Status)',
      dataset: '5 Enclaves • 5,800 Volumes',
      status: 'archival'
    },
    {
      id: 'densenet-121',
      name: 'DenseNet-121-FL v0.8',
      badge: 'QUORUM DEFICIT',
      sha: '0x12b4...88dc',
      task: 'Pediatric Chest Radiograph Pneumonia Detection',
      backbone: 'DenseNet-121',
      params: '7.9M',
      flScheme: 'Multi-Krum Byz.',
      dpNoise: 'ε=0.98',
      accuracy: '89.65%',
      f1: '0.892',
      auc: '0.9540',
      loss: '0.2450',
      roundInfo: 'Node 03 (St. Jude) dropped offline',
      dataset: 'Waiting for 4/5 consensus',
      status: 'paused'
    }
  ];

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
              Global Federated Model Registry &amp; Architectures
            </h1>
            <span className="badge badge-blue font-mono" style={{ fontSize: '9px' }}>v4.1-STABLE</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Task-Specific Neural Architectures • FedAvg/FedProx Aggregated Checkpoints • Cryptographic Checksums &amp; Staging
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => alert('New Architecture Registration Wizard')}>
            <Plus size={13} />
            <span>Register New Architecture</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveModal('exportWeights')}>
            <Download size={13} />
            <span>Export Model Weights (.pt)</span>
          </button>
          <button className="btn btn-primary" onClick={() => {
            const el = document.getElementById('comparativeMatrix');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>
            <ArrowLeftRight size={13} />
            <span>Compare Selected Models</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Ribbon Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>TOP PERFORMING CHECKPOINT</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>Rank 01</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--brand-blue)' }}>EfficientNet-B0-FL <span className="font-mono" style={{ fontSize: '11px' }}>v2.4</span></div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', marginTop: '2px' }} className="font-mono">
            93.84% <span style={{ fontSize: '11px', color: 'var(--status-healthy)' }}>Dice 91.4%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Loss: 0.1412</span>
            <span style={{ color: 'var(--status-healthy)' }}>+0.82% vs Rd 13</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>GOVERNED FL PARAMETERS</span>
            <Cpu size={14} color="var(--accent-teal)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }} className="font-mono">
            284.6M
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Active Task Ensembles Across 4 Nodes
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>FP16 Gradient Cache</span>
            <span style={{ color: '#38bdf8' }}>569.2 MB Sync size</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>PRIVACY INVARIANT</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>Certified</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-teal)', marginTop: '4px' }} className="font-mono">
            ε = 1.24 <span style={{ fontSize: '12px' }}>DP</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '2px' }}>
            Zero Patient Inversion Possible
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Gaussian RDP σ=0.85</span>
            <span className="font-mono">δ &lt; 10⁻⁵</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>DEPLOYMENT PIPELINE</span>
            <span className="badge badge-blue" style={{ fontSize: '9px' }}>Triton v24.08</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
            Triton Inference Ready
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Signed Ed25519 Checkpoint Manifest
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span className="font-mono">SHA-256: 0x8a92...</span>
            <span style={{ color: 'var(--status-healthy)' }}>Enclave Safe</span>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Models (6)' },
            { id: 'prod', label: 'Production Active (2)' },
            { id: 'staging', label: 'Staging / Validation (2)' },
            { id: 'archived', label: 'Archival / Baselines (2)' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by architecture, modality, task..."
          style={{ width: '260px', height: '30px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', fontSize: '11px', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Model Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {models.map((m) => (
          <div
            key={m.id}
            className="card"
            style={{
              background: m.isPrimary ? 'linear-gradient(180deg, #131b2e 0%, #0d1527 100%)' : 'var(--bg-card)',
              border: `1px solid ${m.status === 'paused' ? 'var(--status-danger-border)' : 'var(--border-subtle)'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '14px', color: '#ffffff' }}>{m.name}</strong>
                  <span className={`badge ${m.status === 'paused' ? 'badge-danger' : 'badge-healthy'}`} style={{ fontSize: '9px' }}>
                    {m.badge}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.task}</div>
              </div>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SHA: {m.sha}</span>
            </div>

            {/* Architecture Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'var(--bg-nested)', padding: '8px 10px', borderRadius: '4px', fontSize: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>BACKBONE</div>
                <strong style={{ color: 'var(--text-primary)' }}>{m.backbone}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>PARAMETERS</div>
                <strong className="font-mono" style={{ color: '#38bdf8' }}>{m.params}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>FL SCHEME</div>
                <strong style={{ color: 'var(--text-primary)' }}>{m.flScheme}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>DP NOISE</div>
                <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>{m.dpNoise}</strong>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>GLOBAL DICE / ACC</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--status-healthy)' }} className="font-mono">{m.dice || m.accuracy}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>MACRO F1</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">{m.f1}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>AUC-ROC</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">{m.auc}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>GLOBAL LOSS</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }} className="font-mono">{m.loss}</div>
              </div>
            </div>

            {/* Status & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                <div>{m.roundInfo}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{m.dataset}</div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-ghost" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => alert(`Inspecting ${m.name}`)}>
                  Model Inspector
                </button>
                <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => setActiveModal('exportWeights')}>
                  <Download size={11} />
                  <span>Weights</span>
                </button>
                <button className="btn btn-primary" style={{ fontSize: '10px', padding: '3px 6px' }}>
                  Evaluate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Screen 09: Comparative Architectural Matrix */}
      <div id="comparativeMatrix" className="card" style={{ background: 'var(--bg-nested)', border: '1px solid var(--border-strong)', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeftRight size={15} color="var(--brand-blue)" />
              <strong style={{ fontSize: '14px' }}>Comparative Architectural Matrix</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Differential parameter breakdown, convergence rates &amp; edge inference latency
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Comparing: <strong style={{ color: 'var(--status-healthy)' }}>EfficientNet-B0-FL</strong> vs <strong style={{ color: '#3b82f6' }}>ResNet-50-FL</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Comparison Table */}
          <div>
            <table className="fl-table" style={{ fontSize: '11px' }}>
              <thead>
                <tr>
                  <th>EVALUATION METRIC / ATTRIBUTE</th>
                  <th>EFFICIENTNET-B0-FL (v2.4) [PROD]</th>
                  <th>RESNET-50-FL (v1.9) [STAGING]</th>
                  <th>DELTA / ADVANTAGE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Parameter Footprint</td>
                  <td className="font-mono">5,340,112 (5.3M)</td>
                  <td className="font-mono">25,610,480 (25.6M)</td>
                  <td style={{ color: 'var(--status-healthy)' }}>-79.1% (4.8x smaller)</td>
                </tr>
                <tr>
                  <td>FL Convergence Speed (to 90% Acc)</td>
                  <td className="font-mono">11 Rounds</td>
                  <td className="font-mono">17 Rounds</td>
                  <td style={{ color: 'var(--status-healthy)' }}>+35.3% faster sync</td>
                </tr>
                <tr>
                  <td>DP Budget Consumed (ε)</td>
                  <td className="font-mono">ε = 1.24 (σ=0.85)</td>
                  <td className="font-mono">ε = 1.12 (σ=0.90)</td>
                  <td style={{ color: 'var(--accent-teal)' }}>ResNet +0.12 strictness</td>
                </tr>
                <tr>
                  <td>Clinical Sensitivity (Recall)</td>
                  <td className="font-mono" style={{ color: 'var(--status-healthy)' }}>94.20%</td>
                  <td className="font-mono">91.80%</td>
                  <td style={{ color: 'var(--status-healthy)' }}>+2.40% Sensitivity</td>
                </tr>
                <tr>
                  <td>Clinical Specificity</td>
                  <td className="font-mono" style={{ color: 'var(--status-healthy)' }}>93.60%</td>
                  <td className="font-mono">90.90%</td>
                  <td style={{ color: 'var(--status-healthy)' }}>+2.70% Specificity</td>
                </tr>
                <tr>
                  <td>Edge Latency (NVIDIA A100 TensorRT)</td>
                  <td className="font-mono" style={{ color: 'var(--status-healthy)' }}>18.4 ms / slice</td>
                  <td className="font-mono">34.2 ms / slice</td>
                  <td style={{ color: 'var(--status-healthy)' }}>1.86x Real-time lead</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Radar Chart & ZK-Ledger Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', width: '100%', marginBottom: '4px' }}>
                MULTI-AXIS RADAR PROFILING
              </div>
              <RadarChart size={170} />
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '11px', color: '#f8fafc' }}>Zero-Knowledge Checkpoint Ledger</strong>
                <CheckCircle size={13} color="var(--status-healthy)" />
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '8px' }}>
                Every federated aggregation cycle requires signature verification from &gt;= 66% hospital nodes.
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-secondary" style={{ fontSize: '10px', flex: 1 }} onClick={() => alert('ZK Proof exported to cryptographic audit ledger.')}>
                  Export ZK Proof
                </button>
                <button className="btn btn-primary" style={{ fontSize: '10px', flex: 1 }} onClick={() => alert('Checkpoint promoted to production registry.')}>
                  Promote to Production
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
