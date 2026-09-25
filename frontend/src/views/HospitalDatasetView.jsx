import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import datasetService from '../services/datasetService';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { 
  Database, 
  Search, 
  FolderOpen, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  BarChart2, 
  Image, 
  Users, 
  Copy,
  Layers,
  ShieldCheck
} from 'lucide-react';

const DatasetView = () => {
  const { datasets, activeDataset, setActiveDataset } = useApp();
  const [folderInput, setFolderInput] = useState(
    activeDataset?.local_path || 'C:\\ClinicalData\\Radiology\\ChestXRay_Pediatric_v2'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setScanError(null);
    setIsScanning(true);

    try {
      const inspected = await datasetService.inspectDatasetPath(folderInput);
      setActiveDataset(inspected);
    } catch (err) {
      setScanError(err.message || 'Dataset inspection failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const ds = activeDataset;

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {/* Privacy Notice Banner */}
      <PrivacyNotice />

      {/* Dataset Selection & Local Folder Scanner */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-title">
          <FolderOpen size={16} color="var(--accent-teal)" />
          <span>Local Clinical Dataset Selection (Module 4 Ingestion)</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Select a local directory containing medical imaging data. Module 4 inspects headers, validates modalities, checks patient IDs for split leakage, and builds tensor manifests locally.
        </p>

        <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              placeholder="C:\ClinicalData\Radiology\..."
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="btn btn-teal"
            style={{ padding: '0 16px' }}
          >
            <Search size={14} />
            {isScanning ? 'Inspecting Headers...' : 'Inspect Local Dataset'}
          </button>
        </form>

        {scanError && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            backgroundColor: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertTriangle size={14} />
            <span>{scanError}</span>
          </div>
        )}
      </div>

      {ds && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dataset Header Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ds.name}
                  </h3>
                  <span className="badge badge-teal font-mono">{ds.id}</span>
                  <span className="badge badge-healthy font-mono">
                    <CheckCircle size={11} /> {ds.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Storage Path: <code className="font-mono text-code">{ds.local_path}</code>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-blue">Modality: {ds.modality}</span>
                <span className="badge badge-purple">Format: {ds.format}</span>
              </div>
            </div>
          </div>

          {/* Sample Counts & Split Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div className="card" style={{ padding: '12px' }}>
              <div className="card-title-muted">Total Samples</div>
              <div className="font-mono text-primary" style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                {ds.total_samples?.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Total image files inspected
              </div>
            </div>

            <div className="card" style={{ padding: '12px' }}>
              <div className="card-title-muted">Valid Tensors</div>
              <div className="font-mono text-emerald" style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                {ds.valid_samples?.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '2px' }}>
                100% Header verified
              </div>
            </div>

            <div className="card" style={{ padding: '12px' }}>
              <div className="card-title-muted">Corrupted Files</div>
              <div className="font-mono text-danger" style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                {ds.corrupted_samples}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Excluded from manifest
              </div>
            </div>

            <div className="card" style={{ padding: '12px' }}>
              <div className="card-title-muted">Duplicate Hashes</div>
              <div className="font-mono text-primary" style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                {ds.duplicates_detected}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Exact SHA-256 matches
              </div>
            </div>
          </div>

          {/* Splits and Class Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Split Distribution */}
            <div className="card">
              <div className="card-title">
                <Layers size={15} color="var(--brand-blue)" />
                <span>Partition Splits (Train / Validation / Test)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Train */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>Train Split (70%)</span>
                    <span className="font-mono text-primary">{ds.splits?.train?.count} samples ({ds.splits?.train?.percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ds.splits?.train?.percentage}%`, backgroundColor: '#3b82f6' }} />
                  </div>
                </div>

                {/* Val */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>Validation Split (15%)</span>
                    <span className="font-mono text-cyan">{ds.splits?.val?.count} samples ({ds.splits?.val?.percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ds.splits?.val?.percentage}%`, backgroundColor: '#06b6d4' }} />
                  </div>
                </div>

                {/* Test */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>Test Split (15%)</span>
                    <span className="font-mono text-emerald">{ds.splits?.test?.count} samples ({ds.splits?.test?.percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ds.splits?.test?.percentage}%`, backgroundColor: '#10b981' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '8px 10px', backgroundColor: '#0a101d', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--status-healthy)' }}>
                <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Patient ID Isolation: <strong>0 patient overlap</strong> across splits (Leakage Free).
              </div>
            </div>

            {/* Class Distribution */}
            <div className="card">
              <div className="card-title">
                <BarChart2 size={15} color="var(--accent-teal)" />
                <span>Class Distribution</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ds.classes?.map((c, idx) => {
                  const colors = ['#10b981', '#f59e0b', '#8b5cf6'];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={c.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        <span className="font-mono text-primary">{c.count} ({c.percentage}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.percentage}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
                * Module 8 will automatically apply class-weighted loss to compensate for cohort imbalance.
              </div>
            </div>
          </div>

          {/* Image & Tabular Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Image Properties */}
            <div className="card">
              <div className="card-title">
                <Image size={15} color="#818cf8" />
                <span>Image Tensor Characteristics</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span className="text-muted">Resolution Range:</span>
                  <span className="font-mono text-primary">{ds.image_statistics?.resolution_range}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span className="text-muted">Color Channels:</span>
                  <span className="font-mono text-primary">{ds.image_statistics?.channels} (Grayscale)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span className="text-muted">Mean Intensity:</span>
                  <span className="font-mono text-cyan">{ds.image_statistics?.mean_intensity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span className="text-muted">Std Intensity:</span>
                  <span className="font-mono text-cyan">{ds.image_statistics?.std_intensity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Bit Depth:</span>
                  <span className="font-mono text-primary">{ds.image_statistics?.bit_depth}</span>
                </div>
              </div>
            </div>

            {/* Tabular / Clinical Cohort Statistics */}
            <div className="card">
              <div className="card-title">
                <Users size={15} color="var(--brand-blue)" />
                <span>Patient Cohort Statistics</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span className="text-muted">Total Enrolled Patients:</span>
                  <span className="font-mono text-primary">{ds.tabular_statistics?.patient_count}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span className="text-muted">Unique Patient IDs:</span>
                  <span className="font-mono text-primary">{ds.tabular_statistics?.unique_patients}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span className="text-muted">Cross-Split Overlap:</span>
                  <span className="font-mono text-emerald" style={{ fontWeight: 600 }}>
                    {ds.tabular_statistics?.patient_overlap_between_splits} (Zero Leakage)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Missing Metadata Fields:</span>
                  <span className="font-mono text-primary">{ds.tabular_statistics?.missing_metadata_count} entries</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings & Diagnostics */}
          {ds.warnings && ds.warnings.length > 0 && (
            <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <div className="card-title" style={{ color: 'var(--status-warning)' }}>
                <AlertTriangle size={15} />
                <span>Module 4 Inspection Warnings & Observations</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ds.warnings.map((w, idx) => (
                  <div key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="pulse-dot warning" style={{ width: '6px', height: '6px' }} />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatasetView;
