/**
 * Module 18: notifications are real (backend /notifications, pushed live over Socket.io);
 * operator messages are still MOCK demo content.
 */
import authService from './authService';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api/v1';
const authHeaders = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const INITIAL_MESSAGES = [
  {
    id: 'MSG-101',
    sender: 'Dr. Aris Thorne (Chief Investigator, Consortium)',
    sender_role: 'researcher',
    timestamp: 'Today at 14:15',
    text: 'Dr. Vance, we observed excellent convergence from St. Jude in Round #3. For Round #4, please ensure preprocessing uses CLAHE clip limit 2.0.'
  },
  {
    id: 'MSG-102',
    sender: 'Dr. Marcus Vance (You)',
    sender_role: 'hospital_operator',
    timestamp: 'Today at 14:32',
    text: 'Understood Dr. Thorne. Module 5 preprocessing pipeline has been verified with 0 patient ID leakage across our 5,840 pediatric cases.'
  }
];

class CommunicationService {
  /** Real (backend): this hospital's notifications, newest first. */
  async getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || data?.error || 'Failed to load notifications');
    return data.notifications;
  }

  async markNotificationsRead() {
    await fetch(`${API_BASE_URL}/notifications/read`, { method: 'POST', headers: authHeaders() });
  }

  /** MOCK: messages below are built-in demo content until a messaging API exists. */

  async getMessages() {
    return [...INITIAL_MESSAGES];
  }

  async sendMessage(text) {
    if (!text || text.trim() === '') {
      throw new Error('Message cannot be empty');
    }
    const newMsg = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      sender: 'Dr. Marcus Vance (You)',
      sender_role: 'hospital_operator',
      timestamp: 'Just now',
      text: text.trim()
    };
    INITIAL_MESSAGES.push(newMsg);
    return newMsg;
  }
}

export const communicationService = new CommunicationService();
export default communicationService;
