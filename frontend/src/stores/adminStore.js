import { create } from 'zustand';
import apiService from '../services/apiService';
import { emptyResource, loadResource } from './resource';

/** Consortium admin data (Module 1 backend): users, approvals, telemetry, audit log, model reports. */
const initial = {
  pendingResearchers: emptyResource([]),
  researchers: emptyResource([]),
  users: emptyResource([]),          // every account (admin list endpoint)
  auditLogs: emptyResource([]),
  telemetry: emptyResource(null),    // { active_requests_count, hospital_nodes: [...] }
  storedModels: emptyResource([]),
  diseases: emptyResource([]),
  reports: {},  // disease -> resource
};

export const useAdminStore = create((set, get) => ({
  ...initial,
  session: 0,
  reset: () => set((s) => ({ ...initial, session: s.session + 1 })),

  loadResearchers: () => Promise.all([
    loadResource(set, get, 'pendingResearchers', () => apiService.getPendingResearchers()),
    loadResource(set, get, 'researchers', () => apiService.getAllResearchers()),
  ]),
  approveResearcher: async (userId) => { await apiService.approveResearcher(userId); await get().loadResearchers(); },
  rejectResearcher: async (userId) => { await apiService.rejectResearcher(userId); await get().loadResearchers(); },

  loadUsers: () => loadResource(set, get, 'users', () => apiService.getUsers()),
  /** Approve / reject / suspend any account, then refresh both user lists. */
  setUserStatus: async (userId, action) => {
    await apiService.setUserStatus(userId, action);
    await Promise.all([get().loadUsers(), get().loadResearchers()]);
  },
  loadAuditLogs: (filters) => loadResource(set, get, 'auditLogs', () => apiService.getAuditLogs(filters)),
  loadTelemetry: () => loadResource(set, get, 'telemetry', () => apiService.getTelemetry()),
  loadStoredModels: () => loadResource(set, get, 'storedModels', () => apiService.getStoredModels()),

  loadDiseases: () => loadResource(set, get, 'diseases', () => apiService.getDiseases()),

  loadReport: async (disease) => {
    const session = get().session;
    const prev = get().reports[disease] || emptyResource(null);
    set((s) => ({ reports: { ...s.reports, [disease]: { ...prev, status: 'loading', error: null } } }));
    try {
      const data = await apiService.getModelReport(disease);
      if (get().session === session) set((s) => ({ reports: { ...s.reports, [disease]: { data, status: 'ready', error: null } } }));
    } catch (e) {
      if (get().session === session) {
        set((s) => ({ reports: { ...s.reports, [disease]: { ...prev, status: 'error', error: e.message } } }));
      }
    }
  },
}));
