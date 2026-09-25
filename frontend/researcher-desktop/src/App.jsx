import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { TopNav } from './components/common/TopNav';

// Modals
import { HaltTrainingModal } from './components/modals/HaltTrainingModal';
import { QuarantineModal } from './components/modals/QuarantineModal';
import { ExportWeightsModal } from './components/modals/ExportWeightsModal';
import { SwitchRoleModal } from './components/modals/SwitchRoleModal';

// Views
import { LoginView } from './views/LoginView';
import { RequestAccessView } from './views/RequestAccessView';
import { DashboardView } from './views/DashboardView';
import { HospitalsView } from './views/HospitalsView';
import { FederatedTrainingView } from './views/FederatedTrainingView';
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
import { HomeView } from './views/HomeView';

const MainLayout = () => {
  const { activeScreen, isLoggedIn } = useApp();

  // If logged out or in dedicated auth view
  if (!isLoggedIn) {
    if (activeScreen === 'request-access') {
      return <RequestAccessView />;
    }
    return <LoginView />;
  }

  // Active screen renderer
  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardView />;
      case 'hospitals':
        return <HospitalsView />;
      case 'training':
        return <FederatedTrainingView />;
      case 'models':
        return <ModelsView />;
      case 'experiments':
        return <ExperimentsView />;
      case 'monitoring':
        return <MonitoringView />;
      case 'security':
        return <SecurityView />;
      case 'audit':
        return <AuditLogsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'messages':
        return <MessagesView />;
      case 'users':
        return <UserManagementView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      case 'states':
        return <StatesDemoView />;
      case 'request-access':
        return <RequestAccessView />;
      case 'approvals':
        return <AdminApprovalView />;
      case 'disease-models':
        return <AdminDiseaseModelsView />;
      case 'home':
        return <HomeView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <TopNav />
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {renderScreen()}
        </main>
      </div>

      {/* Global Modals */}
      <HaltTrainingModal />
      <QuarantineModal />
      <ExportWeightsModal />
      <SwitchRoleModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
