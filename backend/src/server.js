const env = require('./config/env');
const app = require('./app');
const prisma = require('./config/db');
const { logger } = require('./utils/logger');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`CampusPlus Backend API server running on port ${PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown handlers
async function shutdown(signal) {
  logger.info(`Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful close hangs
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
