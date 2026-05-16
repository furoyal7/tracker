import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000', {
  auth: { token: 'invalid-token-test' },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected!');
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.log('Connection error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 5000);
