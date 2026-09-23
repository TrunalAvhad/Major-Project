import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Cpu,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Terminal,
  Download,
  Plus,
  Radio,
  Lock,
  Wifi,
  Sliders,
  XOctagon
} from 'lucide-react';

export const HospitalsView = () => {
  const { selectedHospitalId, setSelectedHospitalId, setActiveModal } = useApp();
  const [filterRegion, setFilterRegion] = useState('all');
  const [statusPill, setStatusPill] = useState('all');

  const hospitals = [
    {
      id: '0x9c31be',
      name: 'Johns Hopkins Hospital',
      tag: 'PRIMARY',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'North America',
      location: 'Baltimore, US',
      status: 'ACTIVE',
      dataset: '2,120 Scans',
      scanner: 'GE Revolution CT',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.138',
      lossDelta: '-0.014',
      gpu: 'NVIDIA A100',
      vram: '48% (16.2 GB)',
      cosine: '0.991',
      consensusRank: 'Consensus #1',
      latency: '14ms',
      temp: '62°C',
      bandwidth: '24.8 GB/s',
      threads: 8,
      vramRaw: 16.2,
      vramTotal: 24.0
    },
    {
      id: '0x4f8269',
      name: 'Mayo Clinic Rochester',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'North America',
      location: 'Minnesota, US',
      status: 'ACTIVE',
      dataset: '1,840 Scans',
      scanner: 'Siemens Somatom',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.142',
      lossDelta: '-0.009',
      gpu: 'NVIDIA A100',
      vram: '41% (14.0 GB)',
      cosine: '0.984',
      consensusRank: 'Aligned',
      latency: '16ms',
      temp: '59°C',
      bandwidth: '23.4 GB/s',
      threads: 8,
      vramRaw: 14.0,
      vramTotal: 24.0
    },
    {
      id: '0xd8293f',
      name: 'Charité - Universitätsmedizin Berlin',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'Europe',
      location: 'Berlin, DE',
      status: 'ACTIVE',
      dataset: '1,490 Scans',
      scanner: 'Siemens Force CT',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.155',
      lossDelta: '-0.007',
      gpu: 'RTX 6000 Ada',
      vram: '72% (17.5 GB)',
      cosine: '0.978',
      consensusRank: 'Aligned',
      latency: '21ms',
      temp: '67°C',
      bandwidth: '21.0 GB/s',
      threads: 6,
      vramRaw: 17.5,
      vramTotal: 24.0
    },
    {
      id: '0x117ca5',
      name: 'Mass General Brigham',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'North America',
      location: 'Boston, US',
      status: 'ACTIVE',
      dataset: '1,960 Scans',
      scanner: 'Philips Brilliance',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.141',
      lossDelta: '-0.011',
      gpu: 'NVIDIA A100',
      vram: '59% (18.1 GB)',
      cosine: '0.987',
      consensusRank: 'Aligned',
      latency: '15ms',
      temp: '63°C',
      bandwidth: '24.1 GB/s',
      threads: 8,
      vramRaw: 18.1,
      vramTotal: 24.0
    },
    {
      id: '0x6e5921',
      name: 'Cleveland Clinic Foundation',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'North America',
      location: 'Ohio, US',
      status: 'ACTIVE',
      dataset: '1,310 Scans',
      scanner: 'Canon Aquilion ONE',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.149',
      lossDelta: '-0.008',
      gpu: 'NVIDIA A100',
      vram: '54% (16.8 GB)',
      cosine: '0.975',
      consensusRank: 'Aligned',
      latency: '17ms',
      temp: '61°C',
      bandwidth: '22.8 GB/s',
      threads: 8,
      vramRaw: 16.8,
      vramTotal: 24.0
    },
    {
      id: '0xa22b0ca',
      name: 'Karolinska Institutet',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'Europe',
      location: 'Stockholm, SE',
      status: 'ACTIVE',
      dataset: '1,820 Scans',
      scanner: 'GE Healthcare Optima',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.146',
      lossDelta: '-0.010',
      gpu: 'NVIDIA A100',
      vram: '65% (15.6 GB)',
      cosine: '0.982',
      consensusRank: 'Aligned',
      latency: '22ms',
      temp: '64°C',
      bandwidth: '23.0 GB/s',
      threads: 8,
      vramRaw: 15.6,
      vramTotal: 24.0
    },
    {
      id: '0x6a18d3',
      name: 'UCSF Health',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'North America',
      location: 'San Francisco, US',
      status: 'ACTIVE',
      dataset: '2,400 Scans',
      scanner: 'Siemens Healthineers',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.136',
      lossDelta: '-0.016',
      gpu: 'NVIDIA H100',
      vram: '45% (18.0 GB)',
      cosine: '0.993',
      consensusRank: 'Highest Fid.',
      latency: '13ms',
      temp: '58°C',
      bandwidth: '32.4 GB/s',
      threads: 12,
      vramRaw: 18.0,
      vramTotal: 40.0
    },
    {
      id: '0x77c1aa',
      name: 'Tokyo University Hospital',
      version: 'EfficientNet-B0-FL v2.4',
      region: 'Asia-Pacific',
      location: 'Tokyo, JP',
      status: 'ACTIVE',
      dataset: '1,260 Scans',
      scanner: 'Toshiba / Canon CT',
      progress: '5/5 (100%)',
      round: 'Round 14/20',
      loss: '0.151',
      lossDelta: '-0.006',
      gpu: 'NVIDIA A100',
      vram: '50% (14.8 GB)',
      cosine: '0.971',
      consensusRank: 'Aligned',
      latency: '23ms',
      temp: '65°C',
      bandwidth: '22.0 GB/s',
      threads: 8,
      vramRaw: 14.8,
      vramTotal: 24.0
    }
  ];

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FEDERATED FLEET TOPOLOGY</span>
            <span className="badge badge-purple" style={{ fontSize: '9px' }}>HIPAA &amp; GDPR Compliant Enclaves</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
            Authorized Clinical Hospital Nodes
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            8 of 8 Federated Enclaves Active • Zero-Raw-Data Protocol Enforced • Local Hardware &amp; Differential Privacy Telemetry
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">
            <Radio size={13} color="var(--accent-teal)" />
            <span>Ping All Enclaves</span>
          </button>
          <button className="btn btn-secondary">
            <Download size={13} />
            <span>Export Compliance Report (.pdf)</span>
          </button>
          <button className="btn btn-primary">
            <Plus size={13} />
            <span>Add Hospital Node</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL ENCLAVES CONNECTED</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>● All Verified</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">8 / 8 Active</div>
          <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '4px' }}>
            ✔ 100% Federated Quorum met
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Consensus: FedAvg v3.2</span>
            <span>Synced: 12s ago</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>CUMULATIVE LOCAL COHORT SIZE</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>🛡 Zero Ingress</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">13,990 Scans</div>
          <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '4px' }}>
            🔒 0 Patient DICOM files transferred
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>8 Edge PACS Stores</span>
            <span style={{ color: '#38bdf8' }}>CT Pulmonary Protocol</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>EDGE GPU COMPUTE FLEET</span>
            <span className="badge badge-blue" style={{ fontSize: '9px' }}>8 Nodes Online</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }} className="font-mono">8x A100 / H100</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Avg VRAM: 15.2 GB / 24 GB <strong style={{ color: '#60a5fa' }}>(63% Util)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Total Fleet PFLOPS: 156.4</span>
            <span style={{ color: 'var(--status-healthy)' }}>Thermal: Nominal</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>BYZANTINE &amp; DP PRIVACY</span>
            <span className="badge badge-healthy" style={{ fontSize: '9px' }}>🛡 Multi-Krum</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--status-healthy)' }} className="font-mono">0 Flagged</div>
          <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '4px' }}>
            ✔ Clean Gradient Bounds • DP ε: 1.24
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Noise scale σ: 0.85</span>
            <span style={{ color: 'var(--accent-teal)' }}>RDP Renyi Bound OK</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <input
            type="text"
            placeholder="Filter hospital nodes by name, ID (0x...), scanner or region..."
            style={{
              width: '380px',
              height: '32px',
              background: 'var(--bg-nested)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '5px',
              padding: '0 10px',
              color: 'var(--text-primary)',
              fontSize: '11px'
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {['All (8)', 'Active (8)', 'Syncing (0)', 'Standby (0)'].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setStatusPill(p)}
                className={`btn ${statusPill === p ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '10px', padding: '4px 8px' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          style={{
            height: '32px',
            background: 'var(--bg-nested)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '5px',
            padding: '0 10px',
            color: 'var(--text-primary)',
            fontSize: '11px'
          }}
        >
          <option value="all">All Regions (US, EU, JP)</option>
          <option value="na">North America</option>
          <option value="eu">Europe</option>
          <option value="ap">Asia-Pacific</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="fl-table">
          <thead>
            <tr>
              <th>CLINICAL HOSPITAL &amp; NODE ID</th>
              <th>REGION</th>
              <th>STATUS</th>
              <th>LOCAL DATASET / HARDWARE</th>
              <th>LOCAL PROGRESS</th>
              <th>LOCAL LOSS</th>
              <th>GPU / VRAM</th>
              <th>COSINE SIM</th>
              <th>LATENCY</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((h) => {
              const isSelected = selectedHospitalId === h.id;
              return (
                <tr
                  key={h.id}
                  onClick={() => setSelectedHospitalId(h.id)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--brand-blue)' : '3px solid transparent'
                  }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="pulse-dot healthy" />
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{h.name}</span>
                          {h.tag && <span className="badge badge-blue" style={{ fontSize: '8px', padding: '0 4px' }}>{h.tag}</span>}
                        </div>
                        <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          ID: <span style={{ color: '#38bdf8' }}>{h.id}</span> • {h.version}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px' }}>{h.region}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.location}</div>
                  </td>
                  <td>
                    <span className="badge badge-healthy" style={{ fontSize: '9px' }}>● {h.status}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{h.dataset}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.scanner}</div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--status-healthy)', fontWeight: '600', fontSize: '11px' }}>{h.progress}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.round}</div>
                  </td>
                  <td>
                    <div className="font-mono" style={{ fontWeight: '600', color: '#60a5fa' }}>{h.loss}</div>
                    <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.lossDelta} ε</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px' }}>{h.gpu}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{h.vram}</div>
                  </td>
                  <td>
                    <div className="font-mono" style={{ fontWeight: '600', color: 'var(--status-healthy)' }}>{h.cosine}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.consensusRank}</div>
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{h.latency}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Inspector Drawer for Selected Hospital */}
      <div className="card" style={{ background: 'var(--bg-nested)', border: '1px solid var(--border-strong)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={18} color="var(--brand-blue)" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{selectedHospital.name}</strong>
                <span className="badge badge-healthy" style={{ fontSize: '9px' }}>● Enclave Live</span>
              </div>
              <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Node ID: <span style={{ color: '#38bdf8' }}>{selectedHospital.id}</span> • {selectedHospital.location} • {selectedHospital.dataset} ({selectedHospital.scanner})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '11px' }}>
              <Terminal size={12} />
              <span>Open Secure SSH Tunnel</span>
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '11px' }}>
              <Sliders size={12} />
              <span>Adjust Local DP Noise</span>
            </button>
            <button className="btn btn-danger" style={{ fontSize: '11px' }} onClick={() => setActiveModal('quarantine')}>
              <XOctagon size={12} />
              <span>Suspend Node</span>
            </button>
          </div>
        </div>

        {/* 2-Column Inspector: Telemetry & Security Attestation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          {/* Left: Hardware Telemetry */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>LOCAL NODE HARDWARE TELEMETRY</span>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Polling: 1,000ms</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>GPU DEVICE</div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>{selectedHospital.gpu}</div>
                <div style={{ fontSize: '9px', color: 'var(--accent-teal)' }}>Shared Compute</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>CORE TEMP</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--status-healthy)', marginTop: '2px' }}>{selectedHospital.temp}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Cooling Target: 75°C</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>PCIE BANDWIDTH</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa', marginTop: '2px' }}>{selectedHospital.bandwidth}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>PCIe Gen 4 x16</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>LOCAL WORKERS</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginTop: '2px' }}>{selectedHospital.threads} Threads</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Batch Size: 32</div>
              </div>
            </div>

            {/* VRAM Allocation */}
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>VRAM Allocation (PyTorch CUDA Memory Manager):</span>
              <span className="font-mono">{selectedHospital.vramRaw} GB / {selectedHospital.vramTotal} GB ({Math.round((selectedHospital.vramRaw / selectedHospital.vramTotal) * 100)}%)</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(selectedHospital.vramRaw / selectedHospital.vramTotal) * 100}%`, background: '#3b82f6' }} />
              <div style={{ width: '12%', background: '#64748b' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>● Model Weights &amp; Gradients: {selectedHospital.vramRaw} GB</span>
              <span>● PyTorch Reserved: 2.8 GB</span>
              <span>● Free: {(selectedHospital.vramTotal - selectedHospital.vramRaw - 2.8).toFixed(1)} GB</span>
            </div>
          </div>

          {/* Right: Security & Attestation */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>SECURITY &amp; CRYPTOGRAPHIC ATTESTATION</span>
              <span className="badge badge-healthy" style={{ fontSize: '9px' }}>HARDWARE ATTESTED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'var(--bg-card)',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={12} color="var(--status-healthy)" />
                  <span>mTLS 1.3 Handshake (DigiCert Healthcare CA)</span>
                </div>
                <span className="badge badge-healthy" style={{ fontSize: '9px' }}>VALID</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'var(--bg-card)',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={12} color="var(--brand-blue)" />
                  <span>TPM 2.0 Hardware Root of Trust (PCR-07)</span>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '9px' }}>SIGNED</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'var(--bg-card)',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={12} color="var(--accent-teal)" />
                  <span>Differential Privacy (RDP Gaussian σ=0.85, C=1.0)</span>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '9px' }}>ENFORCED</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'var(--bg-card)',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={12} color="var(--status-healthy)" />
                  <span>Zero-Raw-Egress Firewall Rule (Strict eBPF packet inspection)</span>
                </div>
                <span className="badge badge-healthy" style={{ fontSize: '9px' }}>ACTIVE</span>
              </div>
            </div>

            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid var(--status-healthy-border)',
              borderRadius: '4px',
              fontSize: '10px',
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--status-healthy)' }}>Zero-Raw-Data Strict Enforcement Guarantee:</strong> Only encrypted parameter weight updates (ΔW) leave the hospital firewall. Raw DICOM files and patient records stay entirely inside local hospital PACS under zero-knowledge validation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
