import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { Settings, ShieldCheck, Server, HardDrive, CheckCircle } from 'lucide-react';

const SettingsView = () => {
  const { hospitalId, hospitalName, user, hardware } = useApp();
  const [cudaDevice, setCudaDevice] = useState('cuda:0 (NVIDIA RTX 3080 Ti)');
  const [maxVramAlloc, setMaxVramAlloc] = useState('10240');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {/* Privacy Notice */}
      <PrivacyNotice />

      {/* Header */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-title">
          <Settings size={18} color="var(--accent-teal)" />
          <span>Hospital Workstation Node Configuration</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Manage local compute allocation, CUDA stream parameters, and facility compliance locks.
        </p>
      </div>

      <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Hospital Identity Profile */}
        <div className="card">
          <div className="card-title">
            <Server size={15} color="var(--brand-blue)" />
            <span>Facility Node Identity</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
            <div>
              <span className="text-muted">Node Identifier:</span>
              <div className="font-mono text-cyan" style={{ fontWeight: 600 }}>{hospitalId}</div>
            </div>
            <div>
              <span className="text-muted">Hospital Name:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hospitalName}</div>
            </div>
            <div>
              <span className="text-muted">Operator Account:</span>
              <div style={{ color: 'var(--text-primary)' }}>{user?.name} ({user?.email})</div>
            </div>
            <div>
              <span className="text-muted">Consortium Status:</span>
              <div><span className="badge badge-healthy">ACTIVE NODE</span></div>
            </div>
          </div>
        </div>

        {/* Compute & CUDA Parameters */}
        <form onSubmit={handleSave} className="card">
          <div className="card-title">
            <HardDrive size={15} color="var(--accent-teal)" />
            <span>Local Compute & Memory Allocation</span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Target CUDA Device
            </label>
            <select
              value={cudaDevice}
              onChange={(e) => setCudaDevice(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="cuda:0 (NVIDIA RTX 3080 Ti)">cuda:0 (NVIDIA GeForce RTX 3080 Ti 12GB)</option>
              <option value="cpu">CPU Fallback (AMD Ryzen 9 5950X - Non-accelerated)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Maximum VRAM Allocation Limit (MB)
            </label>
            <input
              type="number"
              value={maxVramAlloc}
              onChange={(e) => setMaxVramAlloc(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Reserved for Module 7 PyTorch process. 2 GB is preserved for display buffer and host OS.
            </div>
          </div>

          {/* Hard-locked Privacy Policy */}
          <div style={{
            padding: '12px',
            backgroundColor: '#0a1422',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={18} color="var(--status-healthy)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--status-healthy)' }}>
                Zero Raw Data Egress Hard-Lock (Immutable)
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Hardware firewall lock prevents outgoing raw image sockets. Controlled by HIPAA compliance daemon.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {saved ? (
              <span className="badge badge-healthy">
                <CheckCircle size={11} /> Preferences Saved Locally
              </span>
            ) : <span />}

            <button type="submit" className="btn btn-teal">
              Save Workstation Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
