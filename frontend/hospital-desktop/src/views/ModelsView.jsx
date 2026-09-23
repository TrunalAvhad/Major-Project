import React, { useState, useEffect } from 'react';
import modelService from '../services/modelService';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { 
  Box, 
  CheckCircle, 
  ShieldCheck, 
  Cpu, 
  FileCode, 
  Tag, 
  HardDrive,
  Info
} from 'lucide-react';

const ModelsView = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const list = await modelService.getApprovedModels();
      setModels(list);
      if (list.length > 0) {
        setSelectedModel(list[0]);
      }
    } catch (err) {
      console.error('Failed to load local approved models:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {/* Privacy Notice */}
      <PrivacyNotice />

      {/* Header */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-title">
          <Box size={18} color="var(--accent-teal)" />
          <span>Module 6: Approved Local Model Registry</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Review deep learning architectures approved by consortium governance and loaded into local node storage. 
          Models are verified against SHA-256 cryptographic hashes before being permitted for local training or local inference.
        </p>
      </div>

      {/* Models Grid & Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
        {/* Model Cards List (5 cols) */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            Locally Available Approved Models ({models.length})
          </div>

          {models.map((m) => {
            const isSelected = selectedModel?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m)}
                className="card"
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(8, 145, 178, 0.1)' : 'var(--bg-card)',
                  padding: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.name}
                  </span>
                  <span className="badge badge-healthy font-mono" style={{ fontSize: '9px' }}>
                    <CheckCircle size={10} /> APPROVED
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Architecture: <strong className="text-primary">{m.architecture}</strong> | Version: <span className="font-mono text-cyan">{m.version}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <span>Params: {m.parameter_count}</span>
                  <span>•</span>
                  <span>Size: {m.model_size_mb} MB</span>
                  <span>•</span>
                  <span>Task: {m.target_task}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Model Deep Inspector (7 cols) */}
        <div style={{ gridColumn: 'span 7' }}>
          {selectedModel ? (
            <div className="card" style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedModel.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--accent-teal)', marginTop: '2px' }}>
                    {selectedModel.architecture} — {selectedModel.framework}
                  </div>
                </div>
                <span className="badge badge-teal font-mono">{selectedModel.id}</span>
              </div>

              {/* Specification Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                padding: '12px',
                backgroundColor: '#090d16',
                borderRadius: 'var(--radius-md)',
                marginBottom: '14px',
                fontSize: '11px'
              }}>
                <div>
                  <span className="text-muted">Target Tensor Shape:</span>
                  <div className="font-mono text-primary" style={{ fontWeight: 600 }}>{selectedModel.input_shape}</div>
                </div>
                <div>
                  <span className="text-muted">Output Classes:</span>
                  <div className="font-mono text-primary" style={{ fontWeight: 600 }}>{selectedModel.num_classes} Classes</div>
                </div>
                <div>
                  <span className="text-muted">Parameter Footprint:</span>
                  <div className="font-mono text-cyan" style={{ fontWeight: 600 }}>{selectedModel.parameter_count} ({selectedModel.model_size_mb} MB)</div>
                </div>
                <div>
                  <span className="text-muted">Approval Date:</span>
                  <div className="font-mono text-primary">{selectedModel.approval_date}</div>
                </div>
              </div>

              {/* Class Mapping Table */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Target Task Class Index Mapping
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {Object.entries(selectedModel.class_mapping).map(([idx, label]) => (
                    <div key={idx} style={{
                      padding: '6px 10px',
                      backgroundColor: '#0c1322',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px'
                    }}>
                      <span className="font-mono text-muted" style={{ marginRight: '6px' }}>Index {idx}:</span>
                      <strong className="text-primary">{label}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkpoint Integrity & Security Seal */}
              <div style={{
                padding: '12px',
                backgroundColor: '#070b14',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-healthy)', fontWeight: 600, marginBottom: '6px' }}>
                  <ShieldCheck size={14} /> Local Cryptographic Hash Verification
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  SHA-256 Digest:
                </div>
                <div className="font-mono text-code" style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                  {selectedModel.sha256_checksum}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
                color: 'var(--status-healthy)'
              }}>
                <CheckCircle size={14} />
                <span>Compatible with Module 7 local training and Module 16 private inference.</span>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <Info size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <div className="text-muted">Select an approved model from the registry to inspect parameters.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelsView;
