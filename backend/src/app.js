import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/error.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 for dashboard usage
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

if (config.nodeEnv === 'production') {
  app.use('/api', limiter);
}

app.use(compression());

// Robust CORS configuration
const rawFrontendUrl = process.env.FRONTEND_URL || '';
const frontendUrl = rawFrontendUrl.endsWith('/') ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

const allowedOrigins = [
  frontendUrl,
  'https://tracker-kohl-seven.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow everything in non-production OR if origin is in allowed list OR if FRONTEND_URL is *
    if (config.nodeEnv !== 'production' || !origin || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(null, true); // Allow it but log it for now to prevent blocking production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Language']
}));

// Explicitly handle preflight requests
app.options('*', cors());

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
