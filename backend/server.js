import http from 'http';
import app from './src/app.js';
import { config } from './src/config/env.js';
import initSocket from './src/sockets/socket.js';

const PORT = config.port;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Merchant API System Online`);
  console.log(`[${timestamp}] 🌐 Mode: ${config.nodeEnv}`);
  console.log(`[${timestamp}] 🔌 Port: ${PORT}`);
  console.log(`[${timestamp}] 🛡️  Security Headers: Helmet Active`);
  console.log(`[${timestamp}] 📦 Database: Prisma Adapter Connected`);
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