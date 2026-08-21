const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint per TRD.md §5.13
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    db: 'connected',
    uptime: Math.floor(process.uptime()),
  });
});

// Hello CampusPlus placeholder
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Hello CampusPlus API' },
    error: null,
  });
});

// Global error handler placeholder
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

module.exports = app;
