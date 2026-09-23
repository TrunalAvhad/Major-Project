import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConvergenceChart } from '../components/charts/ConvergenceChart';
import {
  FlaskConical,
  Plus,
  Download,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  Maximize2
} from 'lucide-react';

export const ExperimentsView = () => {
  const { selectedExperimentId, setSelectedExperimentId, setActiveModal } = useApp();
  const [modalityFilter, setModalityFilter] = useState('all');

  const experiments = [
    {
      id: 'EXP-2025-084',
      name: 'Pan-Cancer Pulmo Nodule 3D Segmentation',
      target: 'LIDC-IDRI Enclave Cohort',
      arch: 'EfficientNet-B0 + 3D UNet',
      modality: 'CT / DICOM 3D',
      quorum: '8/8 Hospitals',
      quorumHealthy: true,
      strategy: 'FedAvg Aggregation • DP ε=1.24 • δ=1e-5',
      rounds: '14/20',
      progress: 70,
      metric: 'Dice: 0.914 AUC: 0.978',
      status: 'RUNNING',
      pi: 'Dr. E. Rostova'
    },
    {
      id: 'EXP-2025-079',
      name: 'Multi-Center Glioblastoma MRI Sub-Region Grading',
      target: 'BraTS-FL Multimodal Benchmark',
      arch: 'ResNet-50-FL (3D)',
      modality: 'Brain MRI',
      quorum: '8/8 Nodes',
      quorumHealthy: true,
      strategy: 'FedProx (μ=0.01) • DP ε=1.10',
      rounds: '25/25',
      progress: 100,
      metric: 'Dice: 0.892 Hausdorff: 4.2mm',
      status: 'COMPLETED',
      pi: 'Prof. M. L...'
    },
    {
      id: 'EXP-2025-072',
      name: 'Pediatric Pneumonia Radiograph Density Detector',
      target: 'Ped-X Consortium Trial',
      arch: 'DenseNet-121',
      modality: 'Chest X-Ray',
      quorum: '6/8 Nodes',
      quorumHealthy: false,
      strategy: 'SCAFFOLD • DP ε=0.95',
      rounds: '9/15',
      progress: 60,
      metric: 'Acc: 91.2% Sens: 93.8%',
      status: 'PAUSED',
      pi: 'Dr. A. O\'C...'
    },
    {
      id: 'EXP-2025-068',
      name: 'Prostate Glandular Histopathology WSI Attention',
      target: 'Gleason Grade Scoring Network',
      arch: 'Swin-UNETR-FL',
      modality: 'WSI Gigapixel',
      quorum: '5/8 Nodes',
      quorumHealthy: true,
      strategy: 'FedOpt (Adam) • DP ε=1.45',
      rounds: '30/30',
      progress: 100,
      metric: 'F1: 0.934 Kappa: 0.88',
      status: 'COMPLETED',
      pi: 'Dr. K. Tar...'
    },
    {
      id: 'EXP-2025-061',
      name: 'Cardiac Ventricular Ejection Fraction Estimation',
      target: 'Short-Axis Cine Temporal FL',
      arch: '3D ResNet Temporal',
      modality: 'Cine-MRI',
      quorum: '8/8 Nodes',
      quorumHealthy: true,
      strategy: 'FedAvg • DP ε=0.88',
      rounds: '18/18',
      progress: 100,
      metric: 'MSE: 0.018 R²: 0.941',
      status: 'COMPLETED',
      pi: 'Dr. H. Ch...'
    },
    {
      id: 'EXP-2025-055',
      name: 'Mammography Microcalcification Anomaly Screening',
      target: 'Archived Consortium Baseline',
      arch: 'ViT-B/16',
      modality: 'Mammography',
      quorum: '7/8 Nodes',
      quorumHealthy: true,
      strategy: 'FedAvg • DP ε=1.30',
      rounds: '20/20',
      progress: 100,
      metric: 'AUC: 0.965 F1: 0.902',
      status: 'ARCHIVED',
      pi: 'Dr. S. Var...'
    }
  ];

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CLINICAL FL ORCHESTRATION / PRODUCTION MATRIX</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
            Federated Experiments &amp; Trials
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Multi-institutional distributed deep learning trials across 8 federated hospital enclaves
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">
            <Download size={13} />
            <span>Export Matrix (.csv)</span>
          </button>
          <button className="btn btn-primary" onClick={() => alert('New Federated Trial Setup Wizard')}>
            <Plus size={13} />
            <span>New Experiment</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>Total Experiments: <strong className="font-mono" style={{ color: '#f8fafc' }}>24</strong></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="pulse-dot healthy" />
            <span>Active Running: <strong className="font-mono" style={{ color: 'var(--status-healthy)' }}>3</strong></span>
          </div>
          <div>Completed (Consensus): <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>18</strong></div>
          <div>Avg. Rounds/Trial: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>16.4</strong></div>
          <div>Differential Privacy: <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>ε ≤ 1.50</strong></div>
          <div>Target Modalities: <strong style={{ color: 'var(--text-secondary)' }}>CT, MRI, WSI...</strong></div>
        </div>
      </div>

      {/* Cohorts Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Registered Clinical Cohorts (6 Displayed)</span>
          <span className="font-mono" style={{ fontSize: '10px' }}>Sort: Round Descent • Zero-Raw-Data Attested</span>
        </div>

        <table className="fl-table">
          <thead>
            <tr>
              <th>RUN ID</th>
              <th>EXPERIMENT TRIAL NAME</th>
              <th>ARCHITECTURE</th>
              <th>MODALITY</th>
              <th>QUORUM</th>
              <th>FL STRATEGY &amp; PRIVACY</th>
              <th>ROUNDS</th>
              <th>BEST METRIC</th>
              <th>STATUS</th>
              <th>PI LEAD</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((exp) => {
              const isSelected = selectedExperimentId === exp.id;
              return (
                <tr
                  key={exp.id}
                  onClick={() => setSelectedExperimentId(exp.id)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--brand-blue)' : '3px solid transparent'
                  }}
                >
                  <td>
                    <code className="font-mono" style={{ color: '#38bdf8', fontWeight: '600' }}>{exp.id}</code>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{exp.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target: {exp.target}</div>
                  </td>
                  <td>{exp.arch}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>{exp.modality}</span>
                  </td>
                  <td>
                    <span className={`badge ${exp.quorumHealthy ? 'badge-healthy' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                      {exp.quorum}
                    </span>
                  </td>
                  <td className="font-mono" style={{ fontSize: '10px' }}>{exp.strategy}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono">{exp.rounds}</span>
                      <div style={{ width: '45px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${exp.progress}%`, height: '100%', background: exp.status === 'PAUSED' ? 'var(--status-warning)' : 'var(--status-healthy)' }} />
                      </div>
                    </div>
                  </td>
                  <td className="font-mono" style={{ color: 'var(--status-healthy)', fontWeight: '500' }}>{exp.metric}</td>
                  <td>
                    <span className={`badge ${exp.status === 'RUNNING' ? 'badge-healthy' : exp.status === 'PAUSED' ? 'badge-warning' : 'badge-blue'}`} style={{ fontSize: '9px' }}>
                      {exp.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{exp.pi}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Active Inspector Drawer */}
      <div className="card" style={{ background: 'var(--bg-nested)', border: '1px solid var(--border-strong)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-blue font-mono" style={{ fontSize: '9px' }}>ACTIVE INSPECTOR: EXP-2025-084</span>
            <strong style={{ fontSize: '13px', color: '#ffffff' }}>Pan-Cancer Pulmo Nodule 3D Segmentation</strong>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Commit: #c4f912e</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Global FedAvg Target: Round 20 • <strong style={{ color: 'var(--status-healthy)' }}>Est. Completion: 42m remaining</strong></span>
          </div>
        </div>

        {/* 3-Column Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
          {/* Col 1: Convergence Trajectory Chart */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Convergence Trajectory (Rounds 1-14)
            </div>
            <ConvergenceChart height={130} showTarget={false} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <div>Current Loss: <strong className="font-mono" style={{ color: '#60a5fa' }}>0.0841</strong></div>
              <div>Val Dice Score: <strong className="font-mono" style={{ color: 'var(--status-healthy)' }}>0.9142</strong></div>
              <div>Accumulated ε: <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>1.24 / 1.50</strong></div>
            </div>
          </div>

          {/* Col 2: Participating Enclaves (Telemetry) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Participating Enclaves</span>
              <span className="badge badge-healthy" style={{ fontSize: '8px' }}>8/8 Healthy</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { name: 'Johns Hopkins Medicine Enclave', node: 'JHU-MD-01', size: '48.2 MB', lat: '112ms' },
                { name: 'Mayo Clinic Rochester Node', node: 'MAYO-MN-04', size: '48.2 MB', lat: '98ms' },
                { name: 'Charité Universitätsmedizin Berlin', node: 'CHARITE-EU-02', size: '48.2 MB', lat: '142ms' },
                { name: 'Mass General Brigham Secure Cell', node: 'MGB-BOS-07', size: '48.2 MB', lat: '86ms' },
                { name: 'Cleveland Clinic Foundation', node: 'CCF-OH-03', size: '48.2 MB', lat: '104ms' },
              ].map((en, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-card)',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{en.name}</div>
                    <div className="font-mono" style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Node ID: {en.node} • TLS 1.3</div>
                  </div>
                  <div className="font-mono" style={{ textAlign: 'right' }}>
                    <div style={{ color: '#38bdf8' }}>{en.size}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{en.lat}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Artifact Integrity */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Artifact Integrity</span>
                <span className="badge badge-healthy" style={{ fontSize: '8px' }}>TPM 2.0 Attested</span>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)', marginBottom: '10px' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>WEIGHTS DIGEST (SHA-256)</div>
                <div className="font-mono" style={{ fontSize: '9px', color: '#38bdf8', wordBreak: 'break-all' }}>
                  0x8a92bb01c8fa334ef09c...e84d7a12
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Signed: 14m ago</span>
                  <span style={{ color: 'var(--brand-blue)', cursor: 'pointer' }}>COPY</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--status-healthy)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} />
                    <span>Zero Raw Patient Data</span>
                  </div>
                  <span style={{ fontWeight: '600' }}>Passed</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--status-healthy)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} />
                    <span>Differential Privacy Clip</span>
                  </div>
                  <span className="font-mono">C=1.0</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--status-healthy)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} />
                    <span>HIPAA Enclave Guard</span>
                  </div>
                  <span style={{ fontWeight: '600' }}>Active</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <button className="btn btn-secondary" style={{ fontSize: '10px' }} onClick={() => setActiveModal('exportWeights')}>
                <Download size={11} />
                <span>Export Checkpoint Weights (.pt)</span>
              </button>
              <button className="btn btn-ghost" style={{ fontSize: '10px' }} onClick={() => alert('Viewing Cryptographic Attestation Proof JSON.')}>
                <ExternalLink size={11} />
                <span>View Attestation Proof (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
