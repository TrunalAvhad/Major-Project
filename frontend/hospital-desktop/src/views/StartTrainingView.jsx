import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import resourceService from '../services/resourceService';
import trainingService from '../services/trainingService';
import RecommendationCard from '../components/training/RecommendationCard';
import TrainingConfirmModal from '../components/training/TrainingConfirmModal';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { 
  PlayCircle, 
  Cpu, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw,
  Server,
  ArrowRight
} from 'lucide-react';

const StartTrainingView = () => {
  const { 
    activeDataset, 
    hardware, 
    recommendationResult, 
    setRecommendationResult,
    selectedRecommendation, 
    setSelectedRecommendation,
    setActiveTrainingSession,
    hospitalId,
    user,
    setActiveTab,
    setTrainingResult
  } = useApp();

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [launchError, setLaunchError] = useState(null);

  // Evaluate hardware and generate recommendations on mount or when dataset changes
  useEffect(() => {
    if (!recommendationResult && activeDataset) {
      handleEvaluate();
    }
  }, [activeDataset]);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setLaunchError(null);
    try {
      const recs = await resourceService.getTrainingRecommendations(activeDataset, hardware);
      setRecommendationResult(recs);
      // Default selection is the Balanced/Recommended option (first recommendation)
      if (recs.recommendations && recs.recommendations.length > 0) {
        setSelectedRecommendation(recs.recommendations[0]);
      }
    } catch (err) {
      setLaunchError('Failed to generate Module 8 resource recommendations.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectRecommendation = (rec) => {
    setSelectedRecommendation(rec);
  };

  const handleOpenConfirm = () => {
    if (!selectedRecommendation) {
      setLaunchError('Please select one of the three training recommendations.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmLaunch = async () => {
    setShowConfirmModal(false);
    setLaunchError(null);

    try {
      // 1. Generate Module 7 TrainingConfig from Module 8 recommendation
      const trainingConfig = resourceService.generateTrainingConfig(
        selectedRecommendation,
        activeDataset?.id || 'DS-RAD-PNEUMONIA-01',
        hospitalId,
        user?.user_id
      );

      // 2. Start training via Module 7 adapter
      const session = await trainingService.startTraining(trainingConfig);
      setActiveTrainingSession(session);

      // 3. Switch view to Training Monitor
      setActiveTab('training_monitor');

      // 4. Run background simulation of training progress
      trainingService.runTrainingSimulation(
        (updatedSession) => {
          setActiveTrainingSession({ ...updatedSession });
        },
        (finalResult) => {
          setTrainingResult(finalResult);
        }
      );
    } catch (err) {
      setLaunchError(err.message || 'Error launching local training execution.');
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {/* Privacy Notice */}
      <PrivacyNotice />

      {/* Header Card */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlayCircle size={18} color="var(--accent-teal)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Start Training: Module 8 Resource-Aware Orchestration
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Module 8 profiles local hardware (VRAM, CUDA, memory bandwidth) and dataset characteristics to generate 
              three safe, optimized training configurations. Select a configuration to generate the immutable Module 7 TrainingConfig.
            </p>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="btn btn-secondary"
            style={{ padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={isEvaluating ? 'spin' : ''} />
            {isEvaluating ? 'Re-evaluating...' : 'Re-profile Hardware (M8)'}
          </button>
        </div>
      </div>

      {/* Hardware & Dataset Context Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div className="card" style={{ padding: '12px' }}>
          <div className="card-title-muted">Hardware Profile</div>
          <div className="font-mono text-cyan" style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
            {hardware?.device_name || 'NVIDIA RTX 3080 Ti'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            VRAM: {hardware?.available_vram_mb || 10420} MB Free | CUDA 12.2
          </div>
        </div>

        <div className="card" style={{ padding: '12px' }}>
          <div className="card-title-muted">Active Dataset</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {activeDataset?.name || 'Pediatric Chest X-Ray Cohort'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--status-healthy)', marginTop: '2px' }}>
            {activeDataset?.valid_samples || 5840} Normalized Tensors Ready
          </div>
        </div>

        <div className="card" style={{ padding: '12px' }}>
          <div className="card-title-muted">EfficientNet-B0 Status (Module 8)</div>
          <div className="font-mono text-purple" style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
            Role: {recommendationResult?.efficientnet_b0_role?.assigned_role || 'HIGH_CAPACITY_CANDIDATE'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {recommendationResult?.efficientnet_b0_role?.justification?.slice(0, 50)}...
          </div>
        </div>
      </div>

      {/* Three Training Recommendations */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Module 8 Resource-Aware Training Configurations (Choose One)
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            Hardware Safety Certified
          </span>
        </div>

        {recommendationResult?.recommendations ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {recommendationResult.recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isSelected={selectedRecommendation?.id === rec.id}
                onSelect={handleSelectRecommendation}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <div className="text-muted">Evaluating hardware & dataset profiles...</div>
          </div>
        )}
      </div>

      {/* Pre-launch Summary & Launch Bar */}
      {selectedRecommendation && (
        <div className="card" style={{
          backgroundColor: '#0c1626',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-teal)', fontWeight: 600 }}>
                Ready to Generate Module 7 TrainingConfig
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                Selected: {selectedRecommendation.title} ({selectedRecommendation.model_name})
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Device: <strong className="text-primary">{selectedRecommendation.device}</strong> | Precision: <strong className="text-cyan">{selectedRecommendation.precision}</strong> | Batch Size: {selectedRecommendation.batch_size} | Epochs: {selectedRecommendation.epochs} | Est. Time: <strong className="text-emerald">{selectedRecommendation.estimated_time_range}</strong>
              </div>
            </div>

            <button
              onClick={handleOpenConfirm}
              className="btn btn-teal"
              style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600 }}
            >
              <PlayCircle size={16} /> Proceed to Confirmation & Launch
            </button>
          </div>

          {launchError && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: 'var(--status-danger-bg)',
              border: '1px solid var(--status-danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-danger)',
              fontSize: '11px'
            }}>
              {launchError}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      <TrainingConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmLaunch}
        recommendation={selectedRecommendation}
        datasetName={activeDataset?.name}
        hardwareInfo={hardware}
      />
    </div>
  );
};

export default StartTrainingView;
