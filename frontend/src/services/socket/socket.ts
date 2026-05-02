import { io, Socket } from 'socket.io-client';

let SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && (SOCKET_URL.includes('localhost') || SOCKET_URL.includes('127.0.0.1'))) {
  console.warn('Socket is pointing to local address in production environment.');
}

class SocketService {
  private socket: Socket | null = null;

  connect(userId?: string) {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: { userId },
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return this.socket;
  }

  getSocket() {
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
