import React from 'react';

export const RadarChart = ({ size = 200 }) => {
  const center = size / 2;
  const radius = size * 0.38;

  // 5 axes: Footprint, Convergence, DP Efficiency, Sensitivity, Specificity
  const axes = [
    { label: 'Footprint (M)', angle: -Math.PI / 2 },
    { label: 'Sync Speed', angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { label: 'DP Strictness', angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { label: 'Clinical Recall', angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { label: 'Specificity', angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
  ];

  // EfficientNet scores (0.0 to 1.0)
  const effScores = [0.95, 0.88, 0.82, 0.94, 0.93];
  // ResNet-50 scores
  const resScores = [0.45, 0.65, 0.70, 0.91, 0.90];

  const getPoints = (scores) => {
    return scores
      .map((s, i) => {
        const x = center + radius * s * Math.cos(axes[i].angle);
        const y = center + radius * s * Math.sin(axes[i].angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Radar web grid rings */}
        {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
          <polygon
            key={i}
            points={axes
              .map((a) => {
                const x = center + radius * level * Math.cos(a.angle);
                const y = center + radius * level * Math.sin(a.angle);
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
        ))}

        {/* Axis spokes */}
        {axes.map((a, i) => {
          const x = center + radius * Math.cos(a.angle);
          const y = center + radius * Math.sin(a.angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
          );
        })}

        {/* ResNet-50 Polygon */}
        <polygon
          points={getPoints(resScores)}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="1.5"
        />

        {/* EfficientNet-B0 Polygon */}
        <polygon
          points={getPoints(effScores)}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#10b981"
          strokeWidth="2"
        />
      </svg>

      <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} />
          <span>EfficientNet-B0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '2px' }} />
          <span>ResNet-50</span>
        </div>
      </div>
    </div>
  );
};
