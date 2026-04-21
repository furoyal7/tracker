import http from 'http';
import app from './src/app.js';
import { config } from './src/config/env.js';
import initSocket from './src/sockets/socket.js';

const PORT = config.port;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running in ${config.nodeEnv} mode on port ${PORT}`);
});
