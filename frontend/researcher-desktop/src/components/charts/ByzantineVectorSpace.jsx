import React from 'react';

export const ByzantineVectorSpace = ({ width = 360, height = 240 }) => {
  // Hospital nodes clustered tightly in safe zone
  const nodes = [
    { id: 'JHU', name: 'Johns Hopkins', x: 175, y: 115, cos: 0.991 },
    { id: 'MAY', name: 'Mayo Clinic', x: 185, y: 122, cos: 0.984 },
    { id: 'CHA', name: 'Charité Berlin', x: 168, y: 130, cos: 0.978 },
    { id: 'MGH', name: 'Mass General', x: 182, y: 108, cos: 0.987 },
    { id: 'CLE', name: 'Cleveland Clinic', x: 192, y: 118, cos: 0.975 },
    { id: 'KAR', name: 'Karolinska', x: 172, y: 125, cos: 0.982 },
    { id: 'UCS', name: 'UCSF Health', x: 180, y: 120, cos: 0.993 },
    { id: 'TOK', name: 'Tokyo Univ', x: 190, y: 128, cos: 0.971 }
  ];

  const centerX = 180;
  const centerY = 120;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px' }}>
        <span className="badge badge-cyan">2D t-SNE / PCA PROJECTION</span>
        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>Dim: 34.2M Weights</span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'var(--bg-nested)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        {/* Coordinate Grid axes */}
        <line x1={centerX} y1={10} x2={centerX} y2={height - 10} stroke="rgba(255,255,255,0.05)" />
        <line x1={10} y1={centerY} x2={width - 10} y2={centerY} stroke="rgba(255,255,255,0.05)" />

        {/* Outer Red Krum Exclusion Boundary Ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={95}
          fill="none"
          stroke="rgba(239, 68, 68, 0.4)"
          strokeDasharray="4 4"
          strokeWidth="1.2"
        />
        <text x={centerX - 80} y={centerY + 85} fill="var(--status-danger)" fontSize="9" fontFamily="var(--font-mono)">
          ▲ Krum Exclusion Zone (&lt; 0.780) [EMPTY]
        </text>

        {/* Inner Green Consensus Safe Zone */}
        <circle
          cx={centerX}
          cy={centerY}
          r={45}
          fill="rgba(16, 185, 129, 0.05)"
          stroke="rgba(16, 185, 129, 0.6)"
          strokeDasharray="3 3"
          strokeWidth="1.5"
        />
        <text x={centerX - 60} y={centerY - 52} fill="var(--status-healthy)" fontSize="9" fontFamily="var(--font-mono)">
          🛡 Consensus Safe Zone (Cosine Sim &gt; 0.950)
        </text>

        {/* Center FedAvg Barycenter */}
        <circle cx={centerX} cy={centerY} r={5} fill="#3b82f6" />
        <circle cx={centerX} cy={centerY} r={9} fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />

        {/* Nodes */}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={3.5} fill="#10b981" stroke="#0B0F17" strokeWidth="1" />
          </g>
        ))}
      </svg>

      {/* Footer Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span className="pulse-dot healthy" />
          <span>No label-flipping or gradient inversion detected</span>
        </div>
        <div>
          <span>Barycenter Dispersion: <strong style={{ color: 'var(--text-primary)' }}>0.038</strong></span>
        </div>
      </div>
    </div>
  );
};
