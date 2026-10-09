import { create } from 'zustand';
import * as consortium from '../mocks/consortium';

/**
 * MOCK state for the researcher/admin demonstration screens (no backend API yet).
 * Everything here is fake and labelled as such; real data lives in the other stores.
 * To make a screen real, replace its entry with a loader backed by an API.
 */
export const useMockStore = create((set) => ({
  ...consortium,

  // Demo FL session control used by the mock Halt Training modal (StatesDemoView).
  sessionStatus: 'running',   // running | paused | stopped
  selectedExperimentId: 'EXP-2025-084',
  notificationsCount: 3,
  messagesCount: 2,

  setSessionStatus: (sessionStatus) => set({ sessionStatus }),
  setSelectedExperimentId: (selectedExperimentId) => set({ selectedExperimentId }),
}));
