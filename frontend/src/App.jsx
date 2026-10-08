import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MLProvider } from './context/MLContext';

// Navigation Components
import { Sidebar } from './components/common/Sidebar';
import { AdminSidebar } from './components/common/AdminSidebar';
import { TopNav } from './components/common/TopNav';
import { HospitalSidebar } from './components/common/HospitalSidebar';
import { HospitalTopNav } from './components/common/HospitalTopNav';

// Modals
import { HaltTrainingModal } from './components/modals/HaltTrainingModal';
import { QuarantineModal } from './components/modals/QuarantineModal';
import { ExportWeightsModal } from './components/modals/ExportWeightsModal';

// Auth & Homepage Views
import { HomeView } from './views/HomeView';
import { LoginView } from './views/LoginView';
import { AdminLoginView } from './views/AdminLoginView';
import { RequestAccessView } from './views/RequestAccessView';
import { HospitalLoginView } from './views/HospitalLoginView';
import { HospitalRegisterView } from './views/HospitalRegisterView';

// Researcher / Admin Views
import { DashboardView } from './views/DashboardView';
import { HospitalsView } from './views/HospitalsView';
import { FederatedTrainingView } from './views/FederatedTrainingView';
import { ResearcherTrainingView } from './views/ResearcherTrainingView';
import { ModelsView } from './views/ModelsView';
import { ExperimentsView } from './views/ExperimentsView';
import { MonitoringView } from './views/MonitoringView';
import { SecurityView } from './views/SecurityView';
import { AuditLogsView } from './views/AuditLogsView';
import { NotificationsView } from './views/NotificationsView';
import { MessagesView } from './views/MessagesView';
import { UserManagementView } from './views/UserManagementView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';
import { StatesDemoView } from './views/StatesDemoView';
import { AdminApprovalView } from './views/AdminApprovalView';
import { AdminDiseaseModelsView } from './views/AdminDiseaseModelsView';
import { AdminFederationModelsView } from './views/AdminFederationModelsView';

// Hospital Operator Views
import HospitalDashboardView from './views/HospitalDashboardView';
import HospitalDatasetView from './views/HospitalDatasetView';
import HospitalPreprocessingView from './views/HospitalPreprocessingView';
import HospitalStartTrainingView from './views/HospitalStartTrainingView';
import HospitalTrainingMonitorView from './views/HospitalTrainingMonitorView';
import HospitalTrainingResultView from './views/HospitalTrainingResultView';
import HospitalModelsView from './views/HospitalModelsView';
import HospitalInferenceView from './views/HospitalInferenceView';
import HospitalCommunicationView from './views/HospitalCommunicationView';
import HospitalSettingsView from './views/HospitalSettingsView';
import HospitalFederationView from './views/HospitalFederationView';

const MainLayout = () => {
  const { activeScreen, authStatus, userRole } = useApp();

  if (authStatus === 'bootstrapping') {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
        <div style={{ color: '#fff', fontSize: '1.2rem' }}>Loading authentication state...</div>
      </div>
    );
  }

  // 1. Unauthenticated state or explicitly requested Auth / Landing screens
  if (authStatus === 'unauthenticated') {
    if (activeScreen === 'request-access') {
      return <RequestAccessView />;
    }
    if (activeScreen === 'hospital-register') {
      return <HospitalRegisterView />;
    }
    if (activeScreen === 'admin-login') {
      return <AdminLoginView />;
    }
    if (activeScreen === 'hospital-login') {
      return <HospitalLoginView />;
    }
    if (activeScreen === 'login') {
      return <LoginView />;
    }
    // Default entry point is HomeView
    return <HomeView />;
  }

  // If logged-in user explicitly visits home view
  if (activeScreen === 'home') {
    return <HomeView />;
  }

  // 2. Hospital Operator Layout & Views
  if (userRole === 'hospital_operator') {
    const renderHospitalScreen = () => {
      switch (activeScreen) {
        case 'dashboard':
          return <HospitalDashboardView />;
        case 'datasets':
          return <HospitalDatasetView />;
        case 'preprocessing':
          return <HospitalPreprocessingView />;
        case 'start_training':
          return <HospitalStartTrainingView />;
        case 'training_monitor':
          return <HospitalTrainingMonitorView />;
        case 'training_results':
          return <HospitalTrainingResultView />;
        case 'federation_status':
          return <HospitalFederationView />;
        case 'models':
          return <HospitalModelsView />;
        case 'inference':
          return <HospitalInferenceView />;
        case 'communication':
          return <HospitalCommunicationView />;
        case 'settings':
          return <HospitalSettingsView />;
        default:
          return <HospitalDashboardView />;
      }
    };

    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <HospitalSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <HospitalTopNav />
          <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {renderHospitalScreen()}
          </main>
        </div>
      </div>
    );
  }

  // 3. Admin Layout & Views
  if (userRole === 'admin') {
    const renderAdminScreen = () => {
      switch (activeScreen) {
        case 'dashboard': return <DashboardView />;
        case 'approvals': return <AdminApprovalView />;
        case 'disease-models': return <AdminDiseaseModelsView />;
        case 'hospitals': return <HospitalsView />;
        case 'training': return <FederatedTrainingView />;
        case 'federation-models': return <AdminFederationModelsView />;
        case 'models': return <ModelsView />;
        case 'audit': return <AuditLogsView />;
        case 'users': return <UserManagementView />;
        case 'security': return <SecurityView />;
        case 'settings': return <SettingsView />;
        case 'profile': return <ProfileView />;
        case 'states': return <StatesDemoView />;
        default: return <DashboardView />;
      }
    };

    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <AdminSidebar /> 
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <TopNav />
          <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {renderAdminScreen()}
          </main>
        </div>
        <HaltTrainingModal />
        <QuarantineModal />
        <ExportWeightsModal />
      </div>
    );
  }

  // 4. Researcher Layout & Views
  const renderResearcherScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <DashboardView />;
      case 'hospitals': return <HospitalsView />;
      case 'training': return <ResearcherTrainingView />;
      case 'models': return <ModelsView />;
      case 'experiments': return <ExperimentsView />;
      case 'monitoring': return <MonitoringView />;
      case 'notifications': return <NotificationsView />;
      case 'messages': return <MessagesView />;
      case 'settings': return <SettingsView />;
      case 'profile': return <ProfileView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <TopNav />
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {renderResearcherScreen()}
        </main>
      </div>

      {/* Global Modals */}
      <HaltTrainingModal />
      <QuarantineModal />
      <ExportWeightsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MLProvider>
        <MainLayout />
      </MLProvider>
    </AppProvider>
  );
}
