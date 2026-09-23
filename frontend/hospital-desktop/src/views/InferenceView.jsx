import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import inferenceService from '../services/inferenceService';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { 
  Search, 
  Upload, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  FileImage, 
  Activity,
  Layers
} from 'lucide-react';

const InferenceView = () => {
  const [selectedModelId, setSelectedModelId] = useState('MOD-RESNET18-RAD');
  const [selectedScan, setSelectedScan] = useState('patient_c749_chest_xray_ap.png');
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceResult, setInferenceResult] = useState(null);
  const [error, setError] = useState(null);

  const localTestScans = [
    { name: 'patient_c749_chest_xray_ap.png', label: 'Pediatric Infiltrate Suspect (Bedside AP)' },
    { name: 'patient_a120_normal_xray.png', label: 'Healthy Pediatric Screening (Clear Lungs)' },
    { name: 'patient_v882_viral_pneumonia.png', label: 'Bilateral Interstitial Opacities (Viral Case)' }
  ];

  const handleRunInference = async () => {
    setError(null);
    setIsInferring(true);
    try {
      const res = await inferenceService.runLocalInference(selectedModelId, { name: selectedScan });
      setInferenceResult(res);
    } catch (err) {
      setError(err.message || 'Local inference execution failed.');
    } finally {
      setIsInferring(false);
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {/* Privacy Notice */}
      <PrivacyNotice />

      {/* Header */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-title">
          <Search size={18} color="var(--accent-teal)" />
          <span>Module 16: Zero-Leakage Local Inference</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Run clinical evaluation on newly acquired hospital scans using locally approved models. 
          The inference engine runs completely on the hospital workstation. 
          <strong>Zero pixel or patient data leaves the local environment.</strong>
        </p>
      </div>

      {/* Inference Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {/* Model Selector */}
        <div className="card">
          <div className="card-title-muted" style={{ marginBottom: '8px' }}>
            1. Select Approved Local Model (Module 6)
          </div>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              marginBottom: '10px'
            }}
          >
            <option value="MOD-RESNET18-RAD">ResNet-18 (v2.1.0-approved) — Pediatric Pneumonia</option>
            <option value="MOD-EFFB0-PEDIATRIC">EfficientNet-B0 (v1.4.0-approved) — Compound Scaling</option>
            <option value="MOD-MOBILENETV3-LIGHT">MobileNetV3-Large (v1.0.1-approved) — Fast Triage</option>
          </select>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Target Task: <strong>Pediatric Radiograph Tri-Class Evaluation</strong> (Normal vs Bacterial vs Viral Pneumonia).
          </div>
        </div>

        {/* Local Image Selector */}
        <div className="card">
          <div className="card-title-muted" style={{ marginBottom: '8px' }}>
            2. Select Local Hospital Scan (Local PACS / Storage)
          </div>
          <select
            value={selectedScan}
            onChange={(e) => setSelectedScan(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              marginBottom: '10px'
            }}
          >
            {localTestScans.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} — {s.label}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '11px', color: 'var(--status-healthy)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={13} />
            <span>Local file residency verified: Scan remains in workstation memory.</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Execute Private Local Inference
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Invokes local CUDA forward pass. Output is for clinical research assistance only.
            </div>
          </div>

          <button
            onClick={handleRunInference}
            disabled={isInferring}
            className="btn btn-teal"
            style={{ padding: '8px 20px', fontSize: '12px' }}
          >
            <Activity size={14} />
            {isInferring ? 'Executing Forward Pass...' : 'Run Local Inference'}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            backgroundColor: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger)',
            fontSize: '11px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Inference Result View */}
      {inferenceResult && (
        <div className="card" style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--accent-teal)" />
              <span>Module 16 Local Inference Classification Output</span>
            </span>
            <span className="badge badge-teal font-mono">
              Latency: {inferenceResult.latency_ms} ms (CUDA)
            </span>
          </div>

          {/* Top Prediction Banner */}
          <div style={{
            padding: '14px',
            backgroundColor: '#0a1628',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Top Predicted Class
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {inferenceResult.top_prediction.class_label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Scan file: <code className="font-mono text-cyan">{inferenceResult.image_source}</code>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Confidence Score
              </div>
              <div className="font-mono text-emerald" style={{ fontSize: '24px', fontWeight: 700 }}>
                {(inferenceResult.top_prediction.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Probability Distribution */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Task Class Probability Distribution
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {inferenceResult.class_breakdown?.map((item) => (
                <div key={item.class_label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>{item.class_label}</span>
                    <span className="font-mono text-primary">{item.percentage} (p = {item.probability})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${item.probability * 100}%`,
                      backgroundColor: item.class_label === 'BACTERIAL_PNEUMONIA' ? 'var(--status-warning)' : 'var(--brand-blue)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div style={{
            padding: '10px 12px',
            backgroundColor: '#0a101d',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.4
          }}>
            <strong>Clinical Notice:</strong> {inferenceResult.clinical_disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};

export default InferenceView;
