const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const prisma = require('./config/db');
const { httpLogger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Route imports
const reportsRoutes = require('./routes/reports.routes');
const referenceRoutes = require('./routes/reference.routes');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (e.g. Render/Vercel)
app.set('trust proxy', 1);

// 1. Helmet — security headers (TRD.md §10 Step 1)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS — origin allow-list check (TRD.md §10 Step 2)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const isAllowed = env.CORS_ALLOWED_ORIGINS.includes(origin);
    const isDev = (process.env.NODE_ENV || env.NODE_ENV) === 'development';
    if (isAllowed || isDev) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. Pino HTTP Logger — structured request logging (TRD.md §10 Step 3)
app.use(httpLogger);

// 4. Body & File parsing (TRD.md §10 Step 4)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static file serving for uploaded device photos (TRD.md §8.1)
const uploadAbsolutePath = path.isAbsolute(env.UPLOAD_DIR)
  ? env.UPLOAD_DIR
  : path.join(__dirname, '..', env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadAbsolutePath));

// Health check endpoint per TRD.md §5.13
app.get('/health', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      db: 'connected',
      uptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    next(err);
  }
});

// API Root / Welcome
app.get('/api/v1', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'CampusPlus API v1 running',
      version: '1.0.0',
    },
    error: null,
  });
});

// Mount Public API Routes
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1', referenceRoutes);

// 404 Handler for unmatched routes
app.use(notFoundHandler);

// 10. Centralized Error Handler (TRD.md §10 Step 10)
app.use(errorHandler);

module.exports = app;
