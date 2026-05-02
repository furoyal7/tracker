import { io, Socket } from 'socket.io-client';

let SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && (SOCKET_URL.includes('localhost') || SOCKET_URL.includes('127.0.0.1'))) {
  console.warn('Socket is pointing to local address in production environment.');
}

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    return this.socket;
  }

  getSocket() {
    if (!this.socket?.connected) {
      return this.connect();
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
