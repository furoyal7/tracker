import { io, Socket } from 'socket.io-client';

let SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && (SOCKET_URL.includes('localhost') || SOCKET_URL.includes('127.0.0.1'))) {
  console.warn('Socket is pointing to local address in production environment.');
}

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  connect() {
    if (this.socket?.connected) return this.socket;
    if (this.isConnecting) return this.socket;

    this.isConnecting = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('[Socket] Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.isConnecting = false;
      console.error('[Socket] Connection error:', error.message);
    });

    return this.socket;
  }

  getSocket() {
    if (!this.socket?.connected && !this.isConnecting) {
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

  emit(event: string, data: any) {
    const s = this.getSocket();
    if (s) s.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    const s = this.getSocket();
    if (s) s.on(event, callback);
  }

  off(event: string) {
    if (this.socket) this.socket.off(event);
  }
}

export const socketService = new SocketService();
