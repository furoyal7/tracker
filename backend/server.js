import http from 'http';
import app from './src/app.js';
import { config } from './src/config/env.js';
import initSocket from './src/sockets/socket.js';
import prisma from './src/lib/prisma.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

console.log("------------------------------------------------");
console.log("🚀 SERVER BOOTING - VERSION 3.0");
console.log("📅 TIME:", new Date().toISOString());
console.log("------------------------------------------------");

// Initialize Socket.IO
initSocket(server);

// Verify DB Connection String (Sanitized)
const dbUrl = process.env.DATABASE_URL || '';
const maskedDb = dbUrl.replace(/:([^:@]+)@/, ':****@').split('@').pop();
console.log(`🗄️  DATABASE HOST: ${maskedDb}`);

server.listen(PORT, '0.0.0.0', () => {
  console.log('------------------------------------------------');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Network access via http://127.0.0.1:${PORT}`);
  console.log(`📦 API VERSION: v3.0-PROD-RESET`);
  console.log(`🔥 STATUS: SERVER STARTED - VERSION 3.0`);
  console.log('------------------------------------------------');
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  
  try {
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
  } catch (err) {
    console.error('Error during Prisma disconnect:', err);
  }

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);