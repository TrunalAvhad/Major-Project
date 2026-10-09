import { create } from 'zustand';
import communicationService from '../services/communicationService';
import socketService from '../services/socketService';

/**
 * Module 18: this hospital's notifications (real, from the backend and pushed live) and
 * operator messages (MOCK demo content until a messaging API exists).
 */
const initial = { notifications: [], messages: [], loaded: false, error: null };

export const useCommunicationStore = create((set, get) => ({
  ...initial,
  session: 0,
  reset: () => set((s) => ({ ...initial, session: s.session + 1 })),

  load: async () => {
    const session = get().session;
    const [notifications, messages] = await Promise.all([
      communicationService.getNotifications().catch((e) => { set({ error: e.message }); return []; }),
      communicationService.getMessages(),
    ]);
    if (get().session !== session) return;
    set({ notifications, messages, loaded: true });
    // New notifications arrive on the hospital's Socket.io room while the app is open.
    const socket = socketService.getSocket();
    socket?.off('notification');
    socket?.on('notification', (n) => {
      if (get().session === session) set((s) => ({ notifications: [n, ...s.notifications] }));
    });
  },

  markAllRead: async () => {
    if (!get().notifications.some((n) => !n.read)) return;
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    await communicationService.markNotificationsRead().catch(() => {});
  },

  sendMessage: async (text) => {
    const msg = await communicationService.sendMessage(text);
    set((s) => ({ messages: [...s.messages, msg] }));
    return msg;
  },
}));

export const selectUnreadCount = (s) => s.notifications.filter((n) => !n.read).length;
