import React from 'react';

export const LatencyStackBar = () => {
  const rounds = [
    { round: 'Round 14 (Active)', compute: 41.7, mtls: 1.8, fedavg: 3.5, total: 47.1 },
    { round: 'Round 13', compute: 41.2, mtls: 2.1, fedavg: 3.5, total: 46.8 },
    { round: 'Round 12', compute: 42.4, mtls: 2.3, fedavg: 3.5, total: 48.2 },
    { round: 'Round 11', compute: 40.8, mtls: 1.7, fedavg: 3.4, total: 45.9 },
    { round: 'Round 10', compute: 42.1, mtls: 1.9, fedavg: 3.4, total: 47.4 }
  ];

  const maxTotal = 60; // 60s scale

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', background: '#818cf8', borderRadius: '2px' }} />
          <span>Local Compute (41.7s)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px' }} />
          <span>mTLS Network (1.8s)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} />
          <span>FedAvg Sync (3.5s)</span>
        </div>
      </div>

      {rounds.map((r, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
            <span style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === 0 ? '600' : '400' }}>
              {r.round}
            </span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
              Total: {r.total}s
            </span>
          </div>
          <div style={{
            height: '14px',
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '3px',
            display: 'flex',
            overflow: 'hidden'
          }}>
            <div style={{ width: `${(r.compute / maxTotal) * 100}%`, background: '#818cf8' }} title={`Compute: ${r.compute}s`} />
            <div style={{ width: `${(r.mtls / maxTotal) * 100}%`, background: '#f59e0b' }} title={`mTLS: ${r.mtls}s`} />
            <div style={{ width: `${(r.fedavg / maxTotal) * 100}%`, background: '#10b981' }} title={`FedAvg: ${r.fedavg}s`} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
        <span>Sync Efficiency: <strong style={{ color: 'var(--status-healthy)' }}>98.4%</strong> without straggler penalty</span>
        <span>Max round timeout: 120s</span>
      </div>
    </div>
  );
};

export const GpuSplineChart = ({ height = 140 }) => {
  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height={height} viewBox="0 0 500 140" style={{ overflow: 'visible' }}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((p, idx) => (
          <line
            key={idx}
            x1="0"
            y1={p * 120}
            x2="500"
            y2={p * 120}
            stroke="var(--border-subtle)"
            strokeDasharray="2 2"
          />
        ))}

        {/* Splines for different nodes */}
        {/* Johns Hopkins (cyan) */}
        <path
          d="M0,80 Q100,30 200,60 T400,25 T500,35"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
        />
        {/* Mayo Clinic (blue) */}
        <path
          d="M0,60 Q120,70 240,40 T420,50 T500,45"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.8"
        />
        {/* Charité Berlin (purple) */}
        <path
          d="M0,90 Q150,55 250,75 T450,40 T500,60"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="1.8"
        />
        {/* MGH (emerald) */}
        <path
          d="M0,70 Q90,90 220,50 T390,30 T500,40"
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
        />
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '10px', marginTop: '6px', color: 'var(--text-secondary)' }}>
        <span style={{ color: '#06b6d4' }}>● Hopkins: 82%</span>
        <span style={{ color: '#3b82f6' }}>● Mayo: 79%</span>
        <span style={{ color: '#8b5cf6' }}>● Charité: 71%</span>
        <span style={{ color: '#10b981' }}>● MGH: 76%</span>
        <span style={{ color: '#94a3b8' }}>● Cleveland: 68%</span>
        <span style={{ color: '#f59e0b' }}>● UCSF: 75%</span>
      </div>
    </div>
  );
};
