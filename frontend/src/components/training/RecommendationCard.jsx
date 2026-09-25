import React from 'react';
import { 
  CheckCircle, 
  Cpu, 
  Clock, 
  Zap, 
  ShieldAlert, 
  Layers, 
  HardDrive, 
  BarChart3,
  Server
} from 'lucide-react';

const RecommendationCard = ({ recommendation, isSelected, onSelect }) => {
  const {
    id,
    type,
    title,
    badge,
    badgeColor,
    model_name,
    architecture,
    device,
    precision,
    batch_size,
    epochs,
    workers,
    optimizer,
    estimated_time_range,
    confidence_interval,
    estimation_method,
    resource_expectations,
    safety_status,
    reason,
    trade_offs,
    efficientnet_role
  } = recommendation;

  const isHighlighted = type === 'BALANCED';

  return (
    <div 
      className="card"
      style={{
        border: isSelected 
          ? '2px solid var(--accent-teal)' 
          : isHighlighted 
            ? '1px solid rgba(6, 182, 212, 0.4)' 
            : '1px solid var(--border-subtle)',
        backgroundColor: isSelected ? 'rgba(8, 145, 178, 0.08)' : 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className={`badge ${badgeColor}`} style={{ fontSize: '10px' }}>
            {badge}
          </span>
          <span className="font-mono text-muted" style={{ fontSize: '10px' }}>
            {id}
          </span>
        </div>

        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-teal)', marginBottom: '12px' }}>
          {model_name} <span className="text-muted">({architecture})</span>
        </div>

        {/* Dynamic EfficientNet-B0 Role Banner (if applicable) */}
        {efficientnet_role && (
          <div style={{
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            marginBottom: '12px',
            fontSize: '11px',
            color: '#c084fc'
          }}>
            <strong>Module 8 Role Evaluation:</strong> {efficientnet_role}
          </div>
        )}

        {/* Parameters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          padding: '10px',
          backgroundColor: '#090d16',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          marginBottom: '12px'
        }}>
          <div>
            <span className="text-muted">Device:</span>
            <div className="font-mono text-primary" style={{ fontWeight: 600 }}>{device}</div>
          </div>
          <div>
            <span className="text-muted">Precision:</span>
            <div className="font-mono text-cyan" style={{ fontWeight: 600 }}>{precision}</div>
          </div>
          <div>
            <span className="text-muted">Batch Size:</span>
            <div className="font-mono text-primary" style={{ fontWeight: 600 }}>{batch_size}</div>
          </div>
          <div>
            <span className="text-muted">Epochs:</span>
            <div className="font-mono text-primary" style={{ fontWeight: 600 }}>{epochs}</div>
          </div>
          <div>
            <span className="text-muted">DataLoader Workers:</span>
            <div className="font-mono text-primary">{workers}</div>
          </div>
          <div>
            <span className="text-muted">Optimizer:</span>
            <div className="font-mono text-primary">{optimizer?.split(' ')[0] || 'AdamW'}</div>
          </div>
        </div>

        {/* Estimated Duration & Confidence */}
        <div style={{
          padding: '8px 10px',
          backgroundColor: '#0f172a',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <Clock size={13} color="var(--accent-teal)" /> Estimated Duration:
            </span>
            <span className="font-mono text-emerald" style={{ fontWeight: 700, fontSize: '12px' }}>
              {estimated_time_range}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {confidence_interval}
          </div>
        </div>

        {/* Resource Expectations */}
        <div style={{ fontSize: '11px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            Hardware Footprint Expectations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Peak VRAM:</span>
              <span className="font-mono text-primary">{resource_expectations?.peak_vram_mb} MB</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GPU Utilization:</span>
              <span className="font-mono text-primary">{resource_expectations?.gpu_utilization_pct}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Safety Headroom:</span>
              <span className="font-mono text-emerald">{resource_expectations?.memory_safety_margin_pct}</span>
            </div>
          </div>
        </div>

        {/* Reason & Trade-offs */}
        <div style={{ fontSize: '11px', marginBottom: '14px' }}>
          <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
            <strong>Rationale:</strong> <span style={{ color: 'var(--text-secondary)' }}>{reason}</span>
          </div>
          <div style={{ color: 'var(--text-primary)' }}>
            <strong>Trade-offs:</strong> <span style={{ color: 'var(--text-secondary)' }}>{trade_offs}</span>
          </div>
        </div>
      </div>

      {/* Select Button */}
      <button
        onClick={() => onSelect(recommendation)}
        className={isSelected ? 'btn btn-teal' : 'btn btn-secondary'}
        style={{ width: '100%', marginTop: '8px' }}
      >
        {isSelected ? (
          <>
            <CheckCircle size={14} /> Selected Configuration
          </>
        ) : (
          'Select Configuration'
        )}
      </button>
    </div>
  );
};

export default RecommendationCard;
