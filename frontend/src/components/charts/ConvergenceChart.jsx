import React, { useState } from 'react';

export const ConvergenceChart = ({ height = 180, showTarget = true }) => {
  const [hoveredRound, setHoveredRound] = useState(null);

  // Rounds 1 to 14 data matching screenshots
  const data = [
    { round: 1, acc: 62.4, loss: 0.845, dp: 0.12 },
    { round: 2, acc: 71.2, loss: 0.612, dp: 0.24 },
    { round: 3, acc: 78.5, loss: 0.482, dp: 0.35 },
    { round: 4, acc: 82.9, loss: 0.395, dp: 0.46 },
    { round: 5, acc: 85.6, loss: 0.332, dp: 0.58 },
    { round: 6, acc: 87.8, loss: 0.285, dp: 0.69 },
    { round: 7, acc: 89.2, loss: 0.246, dp: 0.79 },
    { round: 8, acc: 90.4, loss: 0.218, dp: 0.89 },
    { round: 9, acc: 91.3, loss: 0.194, dp: 0.98 },
    { round: 10, acc: 92.1, loss: 0.176, dp: 1.06 },
    { round: 11, acc: 92.7, loss: 0.162, dp: 1.13 },
    { round: 12, acc: 93.1, loss: 0.152, dp: 1.18 },
    { round: 13, acc: 93.5, loss: 0.145, dp: 1.21 },
    { round: 14, acc: 93.84, loss: 0.142, dp: 1.24 },
  ];

  const svgWidth = 540;
  const svgHeight = height;
  const padding = { top: 25, right: 30, bottom: 30, left: 40 };

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // Scale functions
  const getX = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const getYAcc = (acc) => padding.top + chartH - ((acc - 55) / 45) * chartH;
  const getYLoss = (loss) => padding.top + chartH - ((1.0 - loss) / 1.0) * chartH;

  // Generate SVG path strings
  const accPoints = data.map((d, i) => `${getX(i)},${getYAcc(d.acc)}`).join(' ');
  const lossPoints = data.map((d, i) => `${getX(i)},${getYLoss(d.loss)}`).join(' ');

  const targetY = getYAcc(90.0);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', marginBottom: '6px', fontSize: '11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Val Accuracy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Loss (FedAvg)</span>
        </div>
        {showTarget && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '1px', borderTop: '2px dashed #10b981' }} />
            <span style={{ color: '#10b981' }}>Target 90%</span>
          </div>
        )}
      </div>

      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
          const y = padding.top + p * chartH;
          return (
            <line
              key={idx}
              x1={padding.left}
              y1={y}
              x2={svgWidth - padding.right}
              y2={y}
              stroke="var(--border-subtle)"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Target Line (90%) */}
        {showTarget && (
          <>
            <line
              x1={padding.left}
              y1={targetY}
              x2={svgWidth - padding.right}
              y2={targetY}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
            <text x={padding.left + 5} y={targetY - 5} fill="#10b981" fontSize="10" fontFamily="var(--font-mono)">
              Target Threshold 90.0%
            </text>
          </>
        )}

        {/* Curves */}
        <polyline
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          points={lossPoints}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          points={accPoints}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHoveredRound(d)} onMouseLeave={() => setHoveredRound(null)}>
            <circle
              cx={getX(i)}
              cy={getYAcc(d.acc)}
              r={i === data.length - 1 ? 4.5 : 3}
              fill={i === data.length - 1 ? '#06b6d4' : '#0B0F17'}
              stroke="#06b6d4"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
            />
            <circle
              cx={getX(i)}
              cy={getYLoss(d.loss)}
              r={3}
              fill="#0B0F17"
              stroke="#60a5fa"
              strokeWidth="1.5"
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}

        {/* X-axis labels */}
        <text x={padding.left} y={svgHeight - 10} fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
          R-01
        </text>
        <text x={getX(3)} y={svgHeight - 10} fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
          R-04
        </text>
        <text x={getX(7)} y={svgHeight - 10} fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
          R-08
        </text>
        <text x={getX(10)} y={svgHeight - 10} fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
          R-11
        </text>
        <text x={getX(13) - 30} y={svgHeight - 10} fill="#06b6d4" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
          Round 14 (Latest: 93.84%)
        </text>
      </svg>

      {/* Hover Tooltip */}
      {hoveredRound && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50px',
          background: 'var(--bg-nested)',
          border: '1px solid var(--border-strong)',
          borderRadius: '4px',
          padding: '6px 10px',
          fontSize: '11px',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <div><strong>Round {hoveredRound.round}</strong></div>
          <div style={{ color: '#06b6d4' }}>Accuracy: {hoveredRound.acc}%</div>
          <div style={{ color: '#60a5fa' }}>Loss: {hoveredRound.loss}</div>
          <div style={{ color: 'var(--accent-teal)' }}>DP Spent: ε = {hoveredRound.dp}</div>
        </div>
      )}
    </div>
  );
};
