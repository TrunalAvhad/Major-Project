import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyGauge = ({ value = 1.24, max = 1.50, delta = '1.0e-5' }) => {
  const percentage = (value / max) * 100;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  // 240 degree arc gauge
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
      position: 'relative'
    }}>
      <div style={{ position: 'relative', width: '160px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="160" height="140" viewBox="0 0 160 140">
          <defs>
            <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="80"
            cy="75"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="10"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(135 80 75)"
          />

          {/* Value arc */}
          <circle
            cx="80"
            cy="75"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(135 80 75)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        {/* Center label */}
        <div style={{
          position: 'absolute',
          top: '42px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', lineHeight: 1 }} className="font-mono">
            {value.toFixed(2)}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--accent-teal)', marginTop: '2px', fontWeight: '500' }}>
            ε EXPENDED
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {percentage.toFixed(1)}% of Max
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <div>MAX CEILING: <strong style={{ color: 'var(--text-primary)' }}>{max.toFixed(3)}</strong></div>
        <div>DELTA: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{delta}</strong></div>
      </div>

      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--status-healthy)' }}>
        <ShieldCheck size={13} />
        <span>Trajectory: SAFE (Round 14/20)</span>
      </div>
    </div>
  );
};
