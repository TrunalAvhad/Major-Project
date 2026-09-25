import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import trainingService from '../services/trainingService';
import TrainingMonitor from '../components/training/TrainingMonitor';
import TrainingResultModal from '../components/training/TrainingResultModal';
import PrivacyNotice from '../components/common/PrivacyNotice';
import { Activity, Award, CheckCircle, ArrowRight } from 'lucide-react';

const TrainingMonitorView = () => {
  const { 
    activeTrainingSession, 
    setActiveTrainingSession, 
    trainingResult, 
    setTrainingResult, 
    setActiveTab 
  } = useApp();

  const [showResultModal, setShowResultModal] = useState(false);

  const handleHalt = () => {
    trainingService.stopTraining();
    if (activeTrainingSession) {
      setActiveTrainingSession({
        ...activeTrainingSession,
        status: 'STOPPED'
      });
    }
  };

  const handleViewResults = () => {
    if (activeTrainingSession?.result) {
      setTrainingResult(activeTrainingSession.result);
      setShowResultModal(true);
    } else if (trainingResult) {
      setShowResultModal(true);
    } else {
      setActiveTab('training_results');
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      {/* Privacy Notice */}
      <PrivacyNotice />

      {/* Header */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--accent-teal)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Module 7: Local Training Execution Monitor
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time telemetry from the local PyTorch training process. 
              Tracks loss, accuracy, gradient updates, memory allocation, and adaptation events.
            </p>
          </div>

          {activeTrainingSession?.status === 'COMPLETED' && (
            <button onClick={handleViewResults} className="btn btn-teal">
              <Award size={14} /> View Final TrainingResult
            </button>
          )}
        </div>
      </div>

      {/* Live Monitor Component */}
      <TrainingMonitor
        session={activeTrainingSession}
        onHalt={handleHalt}
        onViewResults={handleViewResults}
      />

      {/* Training Result Modal */}
      <TrainingResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={trainingResult || activeTrainingSession?.result}
      />
    </div>
  );
};

export default TrainingMonitorView;
