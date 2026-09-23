import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [userRole, setUserRole] = useState('researcher'); // 'researcher' or 'admin'
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'haltTraining' | 'quarantine' | 'exportWeights' | 'switchRole'
  const [activeMockState, setActiveMockState] = useState('normal'); // 'normal' | 'loading' | 'empty' | 'error'

  const [sessionStatus, setSessionStatus] = useState('running'); // 'running' | 'paused' | 'stopped'
  const [selectedHospitalId, setSelectedHospitalId] = useState('0x9c31be');
  const [selectedExperimentId, setSelectedExperimentId] = useState('EXP-2025-084');
  const [selectedModelId, setSelectedModelId] = useState('effnet-b0');
  
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [messagesCount, setMessagesCount] = useState(2);

  const currentUser = {
    name: 'Dr. Elena Rostova, M.D., Ph.D.',
    shortName: 'Dr. Elena Rostova',
    title: 'Lead FL Investigator & Associate Professor of Biomedical Informatics',
    roleTag: userRole === 'admin' ? 'Consortium Admin Tier-1' : 'Lead FL Investigator',
    affiliation: 'Stanford Medicine AI Lab & Center for Cancer Systems Biology',
    orcid: '0000-0002-8149-9231',
    npi: 'CA-G88421 / NPI #1982736450',
    keyId: '0x9b2d8e41f0c2a88d710e39bc02bfa4e877ca0d1a49f7b11d9a24ec08f237bc90',
    fipsToken: 'YubiKey 5C FIPS (#8839-4029-A) Level 3',
    sessionDuration: '07:42:19',
    enclaveAttestation: 'Intel SGX2 FIPS Validated'
  };

  const privacyMetrics = {
    epsilon: 1.24,
    maxEpsilon: 1.50,
    delta: '1e-5',
    noiseMultiplier: 0.85,
    clipNorm: 1.0,
    percentage: 82.6
  };

  const quorumStatus = {
    connected: 8,
    total: 8,
    statusText: '100% Federated Quorum met',
    fedAvgVersion: 'v3.2',
    lastSync: '12s ago'
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        userRole,
        setUserRole,
        isLoggedIn,
        setIsLoggedIn,
        activeModal,
        setActiveModal,
        activeMockState,
        setActiveMockState,
        sessionStatus,
        setSessionStatus,
        selectedHospitalId,
        setSelectedHospitalId,
        selectedExperimentId,
        setSelectedExperimentId,
        selectedModelId,
        setSelectedModelId,
        notificationsCount,
        setNotificationsCount,
        messagesCount,
        setMessagesCount,
        currentUser,
        privacyMetrics,
        quorumStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
