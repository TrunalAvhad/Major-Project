/**
 * Module 18: Consortium Communication & Notifications Service Adapter
 * 
 * Manages hospital-side participation alerts, federated round notifications,
 * and encrypted telemetry/dispatch notices with the Researcher platform.
 */

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    title: 'Federated Round #4 Invitation',
    sender: 'Lead Researcher (Consortium Central)',
    type: 'ROUND_INVITE',
    timestamp: '15 minutes ago',
    read: false,
    content: 'Round #4 aggregation protocol initialized. Target architecture: ResNet-18. Local minimum epoch requirement: 5. Please execute local training when hardware is idle.'
  },
  {
    id: 'NOTIF-002',
    title: 'Global Aggregated Model v2.1 Released',
    sender: 'Central FL Server (Module 9)',
    type: 'MODEL_RELEASE',
    timestamp: '2 hours ago',
    read: true,
    content: 'Federated round #3 global model checkpoints successfully verified by Merkle proof and Byzantine consensus. Now available in Local Models for clinical evaluation.'
  },
  {
    id: 'NOTIF-003',
    title: 'Security Health & Audit Ping',
    sender: 'System Sentinel (Module 11/13)',
    type: 'SECURITY_PING',
    timestamp: '1 day ago',
    read: true,
    content: 'Zero-raw-data boundary audit verified: 0 external raw image leaks detected over 30-day operating window.'
  }
];

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
  async getNotifications() {
    return [...INITIAL_NOTIFICATIONS];
  }

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
