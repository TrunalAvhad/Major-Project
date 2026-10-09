import React from 'react';
import { useAuthStore, selectHospitalId, selectHospitalName } from '../stores/authStore';
import { useMLStore } from '../stores/mlStore';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { ChangePasswordForm } from '../components/common/Account';
import { Settings, Server, HardDrive, RefreshCw } from 'lucide-react';

const mb = (v) => (typeof v === 'number' ? `${(v / 1024).toFixed(1)} GB` : '-');

/** Hospital workstation: account identity, the hardware Module 8 measured, and password change. */
const SettingsView = () => {
  const user = useAuthStore((s) => s.user);
  const hospitalId = useAuthStore(selectHospitalId);
  const hospitalName = useAuthStore(selectHospitalName);
  const { hardware, hardwareError, refreshHardware, serviceStatus } = useMLStore();
  const gpu = hardware?.gpu;

  const rows = hardware ? [
    ['GPU', gpu?.cuda_available ? `${gpu.gpu_name} (CUDA ${gpu.cuda_capability})` : `None usable: ${gpu?.fallback_reason || 'no CUDA device'}`],
    ['VRAM free / total', gpu?.cuda_available ? `${mb(gpu.free_vram_mb)} / ${mb(gpu.total_vram_mb)}` : '-'],
    ['CPU', `${hardware.cpu?.processor || '-'} · ${hardware.cpu?.physical_cores ?? '-'} cores / ${hardware.cpu?.logical_cores ?? '-'} threads`],
    ['RAM available / total', `${mb(hardware.ram?.available_mb)} / ${mb(hardware.ram?.total_mb)}`],
    ['Disk free / total', hardware.storage ? `${mb(hardware.storage.free_mb)} / ${mb(hardware.storage.total_mb)}` : '-'],
  ] : [];

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      <PrivacyNotice />

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-title">
          <Settings size={18} color="var(--accent-teal)" />
          <span>Hospital Workstation</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Account details and the hardware Module 8 measured on this machine. Training settings are chosen per run on the Start Training page.
        </p>
      </div>

      <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card">
          <div className="card-title">
            <Server size={15} color="var(--brand-blue)" />
            <span>Hospital &amp; operator</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
            <div><span className="text-muted">Hospital ID:</span><div className="font-mono text-cyan" style={{ fontWeight: 600 }}>{hospitalId}</div></div>
            <div><span className="text-muted">Hospital name:</span><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hospitalName}</div></div>
            <div><span className="text-muted">Operator:</span><div style={{ color: 'var(--text-primary)' }}>{user?.name} ({user?.email})</div></div>
            <div><span className="text-muted">Account status:</span><div><span className="badge badge-healthy">{user?.status}</span></div></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <HardDrive size={15} color="var(--accent-teal)" />
              <span>Measured hardware (Module 8)</span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={refreshHardware} disabled={serviceStatus !== 'online'}>
              <RefreshCw size={12} /> <span>Re-measure</span>
            </button>
          </div>
          {hardware ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', fontSize: '12px' }}>
              {rows.map(([k, v]) => (
                <React.Fragment key={k}>
                  <span className="text-muted">{k}</span>
                  <span className="font-mono">{v}</span>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {hardwareError || (serviceStatus === 'online' ? 'Measuring...' : 'The local ML service is not reachable, so the hardware has not been measured.')}
            </div>
          )}
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Module 8 sizes batch size and memory use from these measurements for every run; there is no manual VRAM limit to set.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default SettingsView;
