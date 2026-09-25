import React from 'react';
import { LatencyStackBar, GpuSplineChart } from '../components/charts/LatencyStackBar';
import {
  Activity,
  Server,
  ShieldCheck,
  Cpu,
  Radio,
  Download,
  Lock,
  CheckCircle,
  HardDrive
} from 'lucide-react';

export const MonitoringView = () => {
  const nodes = [
    {
      name: 'Johns Hopkins Medicine',
      id: 'enc-jhm-node01.baltimore.med',
      os: 'Ubuntu 22.04 LTS (AMD SEV-SNP)',
      gpu: '2x NVIDIA A100 80GB SXM4',
      heartbeat: 'Active • Round 14, Ep 4/5',
      lat: '19ms ±1.2ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    },
    {
      name: 'Mayo Clinic',
      id: 'enc-mayo-rochester-fl02',
      os: 'RHEL 9.2 (AMD SEV-SNP)',
      gpu: '2x NVIDIA H100 80GB PCIe',
      heartbeat: 'Active • Round 14, Ep 5/5',
      lat: '24ms ±2.1ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    },
    {
      name: 'Charité – Universitätsmedizin',
      id: 'enc-berlin-charite-eu01',
      os: 'Ubuntu 22.04 LTS (Intel SGX/TDX)',
      gpu: '2x NVIDIA A100 80GB SXM4',
      heartbeat: 'Active • Round 14, Ep 4/5',
      lat: '88ms ±4.0ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    },
    {
      name: 'Mass General Brigham',
      id: 'enc-mgb-boston-cluster04',
      os: 'Ubuntu 22.04 LTS (AMD SEV-SNP)',
      gpu: '4x NVIDIA A100 80GB SXM4',
      heartbeat: 'Active • Round 14, Ep 3/5',
      lat: '18ms ±0.8ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    },
    {
      name: 'Cleveland Clinic',
      id: 'enc-ccf-ohio-enclave08',
      os: 'Ubuntu 22.04 LTS (AMD SEV-SNP)',
      gpu: '2x NVIDIA H100 80GB PCIe',
      heartbeat: 'Active • Round 14, Ep 4/5',
      lat: '28ms ±1.9ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    },
    {
      name: 'Karolinska Institutet',
      id: 'enc-ki-stockholm-edge',
      os: 'Debian 12 (Intel SGX/TDX)',
      gpu: '2x NVIDIA A100 80GB SXM4',
      heartbeat: 'Active • Round 14, Ep 5/5',
      lat: '102ms ±5.2ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    },
    {
      name: 'UCSF Medical Center',
      id: 'enc-ucsf-parnassus-vm01',
      os: 'Ubuntu 22.04 LTS (AMD SEV-SNP)',
      gpu: '2x NVIDIA H100 80GB PCIe',
      heartbeat: 'Active • Round 14, Ep 4/5',
      lat: '32ms ±1.8ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    },
    {
      name: 'Univ. of Tokyo Hospital',
      id: 'enc-u-tokyo-hongo-jp03',
      os: 'Ubuntu 22.04 LTS (AMD SEV-SNP)',
      gpu: '2x NVIDIA A100 80GB SXM4',
      heartbeat: 'Active • Round 14, Ep 3/5',
      lat: '134ms ±6.4ms',
      tpm: 'Passed [PCR07]',
      guard: 'Active • Strict Tensor Out'
    }
  ];

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
              Cluster Telemetry &amp; Enclave Infrastructure Monitoring
            </h1>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>
              ● LIVE SECURE FEED
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Real-time telemetry from central FedAvg aggregation coordinator and 8 edge hospital enclaves
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
            {['Past 1 Hour', 'Past 6 Hours', 'Past 24 Hours'].map((t, idx) => (
              <button
                key={idx}
                className="btn btn-ghost"
                style={{ fontSize: '10px', padding: '4px 8px', background: idx === 0 ? 'var(--bg-card)' : 'transparent', color: idx === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary">
            <Radio size={12} color="var(--accent-teal)" />
            <span>Trigger Health Ping</span>
          </button>
          <button className="btn btn-secondary">
            <Download size={12} />
            <span>Download Diagnostics</span>
          </button>
        </div>
      </div>

      {/* 4 Telemetry Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>AGGREGATION SERVER</span>
            <Server size={14} color="var(--brand-blue)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
            CPU 34% <span style={{ fontSize: '11px', color: 'var(--status-healthy)' }}>EPYC 64C</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            RAM In-Use: <strong className="font-mono">42.1 GB / 128 GB</strong>
          </div>
          <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Coordinator ID: srv-us-west-enclave-0
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>mTLS WEIGHT INGRESS/EGRESS</span>
            <ShieldCheck size={14} color="var(--status-healthy)" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
            4.2 MB/s <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>in</span> • 384 KB/s <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>out</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '4px' }}>
            🔒 Zero DICOM Transfer (Strict)
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Payload Guard: <strong style={{ color: 'var(--accent-teal)' }}>Float32 Weights Only</strong>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>GPU ENCLAVE FLEET (8/8)</span>
            <Cpu size={14} color="var(--accent-teal)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">
            74.2% <span style={{ fontSize: '11px', color: '#60a5fa' }}>Fleet Avg Util</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Aggregated VRAM: <strong className="font-mono">138.4 / 256 GB</strong>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Architecture: NVIDIA A100 &amp; H100
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>BYZANTINE &amp; DP SANITIZER</span>
            <Lock size={14} color="var(--status-warning)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--status-healthy)' }} className="font-mono">
            0 Dropped <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Healthy Tensors</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-Krum Filter: <strong className="font-mono">18ms latency</strong>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Current Epsilon: <strong className="font-mono" style={{ color: 'var(--accent-teal)' }}>ε = 1.24 / 1.50</strong>
          </div>
        </div>
      </div>

      {/* Latency & GPU Graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Gradient Aggregation Latency per Round</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Rounds 8 through 14 • Average breakdown (Compute, mTLS, FedAvg)</div>
            </div>
          </div>
          <LatencyStackBar />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Hospital Edge GPU Telemetry</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>A100 / H100 Compute Load over past 60 minutes</div>
            </div>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>All 8 GPUs Nominal</span>
          </div>
          <GpuSplineChart />
        </div>
      </div>

      {/* Federated Enclave Cluster Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="card-title">Federated Enclave Cluster Nodes</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>8/8 Enclaves Verified</span>
          </div>
          <input
            type="text"
            placeholder="Filter hospital, hardware, PCR status..."
            style={{ width: '240px', height: '26px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', fontSize: '10px', color: 'var(--text-primary)' }}
          />
        </div>

        <table className="fl-table">
          <thead>
            <tr>
              <th>HOSPITAL NODE / ENCLAVE ID</th>
              <th>HOST OS &amp; CONFIDENTIAL VM</th>
              <th>EDGE HARDWARE</th>
              <th>LOCAL TRAINING HEARTBEAT</th>
              <th>LATENCY / JITTER</th>
              <th>TPM 2.0 PCR ATTESTATION</th>
              <th>EBPF ZERO-RAW-DATA GUARD</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((n, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: '600' }}>{n.name}</div>
                  <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{n.id}</div>
                </td>
                <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.os}</td>
                <td style={{ fontSize: '11px' }}>{n.gpu}</td>
                <td>
                  <span className="badge badge-healthy" style={{ fontSize: '9px' }}>
                    <span className="pulse-dot healthy" /> {n.heartbeat}
                  </span>
                </td>
                <td className="font-mono" style={{ fontSize: '11px' }}>{n.lat}</td>
                <td>
                  <span className="badge badge-healthy" style={{ fontSize: '9px' }}>
                    <CheckCircle size={10} /> {n.tpm}
                  </span>
                </td>
                <td>
                  <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                    {n.guard}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <span>Consensus Round: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>14/25</strong> • Total Aggregated Datasets: <strong>184,200 Patient Cohorts</strong></span>
        <span>Attestation Digest: <code className="font-mono" style={{ color: '#38bdf8' }}>sha256:d8b2...9f7a</code></span>
        <span style={{ color: 'var(--status-healthy)' }}>✔ mTLS Mutual Authentication Validated</span>
      </div>
    </div>
  );
};
