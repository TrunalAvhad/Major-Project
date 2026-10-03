import { io } from 'socket.io-client';
import { authService } from './authService';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    const token = authService.getToken();
    if (!token) {
      console.warn('Cannot connect to socket without token');
      return null;
    }

    this.socket = io(API_BASE_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10
    });

    this.socket.on('connect', () => {
      console.log(`[Socket] Connected with ID: ${this.socket.id}`);
    });

    this.socket.on('connect_error', (err) => {
      console.error(`[Socket] Connection error:`, err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRequestRoom(requestId) {
    if (this.socket?.connected) {
      this.socket.emit('join_request_room', requestId);
    }
  }

  leaveRequestRoom(requestId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_request_room', requestId);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
