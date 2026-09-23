import React from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/common/Sidebar';
import TopNav from './components/common/TopNav';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import DatasetView from './views/DatasetView';
import PreprocessingView from './views/PreprocessingView';
import StartTrainingView from './views/StartTrainingView';
import TrainingMonitorView from './views/TrainingMonitorView';
import TrainingResultView from './views/TrainingResultView';
import ModelsView from './views/ModelsView';
import InferenceView from './views/InferenceView';
import CommunicationView from './views/CommunicationView';
import SettingsView from './views/SettingsView';
import './App.css';

function App() {
  const { isAuthenticated, activeTab } = useApp();

  if (!isAuthenticated || activeTab === 'login') {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'datasets':
        return <DatasetView />;
      case 'preprocessing':
        return <PreprocessingView />;
      case 'start_training':
        return <StartTrainingView />;
      case 'training_monitor':
        return <TrainingMonitorView />;
      case 'training_results':
        return <TrainingResultView />;
      case 'models':
        return <ModelsView />;
      case 'inference':
        return <InferenceView />;
      case 'communication':
        return <CommunicationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
        <TopNav />
        <main style={{ flex: 1, minHeight: 0, backgroundColor: 'var(--bg-canvas)', overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
