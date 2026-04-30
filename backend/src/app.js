import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import 'express-async-errors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images from other domains if needed
}));
app.use(compression());
app.use(cors({
  origin: config.nodeEnv === 'development' ? true : (
    config.frontendUrl === '*' 
      ? true 
      : config.frontendUrl.split(',').map(url => url.trim())
  ),
  credentials: true
}));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Business Money Manager API is running' });
});

// Error handling
app.use(errorHandler);

export default app;
