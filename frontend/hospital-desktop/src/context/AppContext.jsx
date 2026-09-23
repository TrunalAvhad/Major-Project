import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { ROLES } from '../services/authService';
import datasetService from '../services/datasetService';
import resourceService from '../services/resourceService';
import trainingService from '../services/trainingService';
import communicationService from '../services/communicationService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState(authService.isAuthenticated() ? 'dashboard' : 'login');
  
  // Datasets
  const [datasets, setDatasets] = useState([]);
  const [activeDataset, setActiveDataset] = useState(null);
  const [datasetLoading, setDatasetLoading] = useState(false);

  // Hardware state
  const [hardware, setHardware] = useState(null);
  
  // Preprocessing
  const [preprocessingReport, setPreprocessingReport] = useState(null);

  // Training Recommendations & Execution
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [activeTrainingSession, setActiveTrainingSession] = useState(null);
  const [trainingResult, setTrainingResult] = useState(null);
  
  // Communications
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  // Load initial datasets and hardware on mount
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      const hw = await resourceService.evaluateHardware();
      setHardware(hw);

      const dsets = await datasetService.getLocalDatasets();
      setDatasets(dsets);
      if (dsets.length > 0) {
        setActiveDataset(dsets[0]);
      }

      const notifs = await communicationService.getNotifications();
      setNotifications(notifs);

      const msgs = await communicationService.getMessages();
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load initial hospital node data:', err);
    }
  };

  const handleLogin = async (email, password) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    setActiveTab('dashboard');
    await loadInitialData();
    return loggedUser;
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setActiveTab('login');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        hospitalId: user?.hospital_id || 'HOSP_000001',
        hospitalName: user?.hospital_name || 'St. Jude Clinical AI Node',
        isAuthenticated: !!user,
        activeTab,
        setActiveTab,
        datasets,
        setDatasets,
        activeDataset,
        setActiveDataset,
        datasetLoading,
        setDatasetLoading,
        hardware,
        setHardware,
        preprocessingReport,
        setPreprocessingReport,
        recommendationResult,
        setRecommendationResult,
        selectedRecommendation,
        setSelectedRecommendation,
        activeTrainingSession,
        setActiveTrainingSession,
        trainingResult,
        setTrainingResult,
        notifications,
        setNotifications,
        messages,
        setMessages,
        login: handleLogin,
        logout: handleLogout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
