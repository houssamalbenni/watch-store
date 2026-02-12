import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoose from 'mongoose';

import config from './config/index.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/users.js';
import eventsRoutes from './routes/events.js';
import linkClicksRoutes from './routes/linkClicks.js';
import analyticsRoutes from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security & Parsing ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS - accept multiple origins (comma-separated in env)
const allowedOrigins = config.clientUrl.split(',').map(url => url.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many login attempts, try again later' },
});
app.use('/api/auth/login', loginLimiter);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use('/api', globalLimiter);

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/link-clicks', linkClicksRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Serve uploaded images ──
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health — also warms DB connection
app.get('/api/health', async (_req, res) => {
  try {
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const state = dbState[mongoose.connection.readyState] || 'unknown';
    res.json({ status: 'ok', db: state, uptime: process.uptime() });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

// ── Error handler ──
app.use(errorHandler);

// ── Start ──
const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });
};

start();

export default app;
