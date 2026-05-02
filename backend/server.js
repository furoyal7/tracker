import http from 'http';
import app from './src/app.js';
import { config } from './src/config/env.js';
import initSocket from './src/sockets/socket.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);