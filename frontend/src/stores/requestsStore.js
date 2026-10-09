import { useEffect } from 'react';
import { create } from 'zustand';
import apiService from '../services/apiService';
import socketService from '../services/socketService';
import { emptyResource, loadResource } from './resource';

/** Consortium training requests (backend /training-requests). */
const initial = {
  requests: emptyResource([]),     // every request (any signed-in role may list them)
  myRequests: emptyResource([]),   // the signed-in researcher's own requests
};

export const useRequestsStore = create((set, get) => ({
  ...initial,
  session: 0,
  reset: () => set((s) => ({ ...initial, session: s.session + 1 })),

  loadRequests: () => loadResource(set, get, 'requests', () => apiService.getAllTrainingRequests()),
  loadMyRequests: () => loadResource(set, get, 'myRequests', () => apiService.getMyTrainingRequests()),

  /** Researcher publishes a new request; it is added to the top of their list. */
  createRequest: async (fields) => {
    const created = await apiService.createTrainingRequest(fields);
    set((s) => ({ myRequests: { ...s.myRequests, data: [created, ...s.myRequests.data] } }));
    return created;
  },

  /** The signed-in hospital joins a request; the updated request replaces the cached one. */
  participate: async (requestId) => {
    const { training_request: updated } = await apiService.participateInTrainingRequest(requestId);
    set((s) => ({
      requests: { ...s.requests, data: s.requests.data.map((r) => (r.request_id === updated.request_id ? updated : r)) },
    }));
    return updated;
  },
}));

// Backend Socket.io events emitted to the room `request_<id>` (trainingRequestController).
const REQUEST_EVENTS = ['hospital_participated', 'hospital_withdrawn', 'training_progress_update'];

/**
 * Joins the Socket.io rooms of the given requests and calls onUpdate whenever a hospital
 * joins, withdraws or reports progress. Rooms are re-joined after a reconnect.
 */
export function useRequestRoomUpdates(requestIds, onUpdate) {
  const key = requestIds.join(',');
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !key) return undefined;
    const ids = key.split(',');
    const join = () => ids.forEach((id) => socket.emit('join_request_room', id));
    join();
    socket.on('connect', join);
    REQUEST_EVENTS.forEach((e) => socket.on(e, onUpdate));
    return () => {
      socket.off('connect', join);
      REQUEST_EVENTS.forEach((e) => socket.off(e, onUpdate));
      if (socket.connected) ids.forEach((id) => socket.emit('leave_request_room', id));
    };
  }, [key, onUpdate]);
}
