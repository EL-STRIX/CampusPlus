const express = require('express');
const { submitReport, uploadPhoto, trackReport } = require('../controllers/reports.controller');
const { upload } = require('../middleware/upload.middleware');
const { reportSubmissionLimiter, generalLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createReportSchema } = require('../validators/reports.validator');

const router = express.Router();

// GET /api/v1/reports/track/:id - Public tracking endpoint
router.get('/track/:id', generalLimiter, trackReport);

// GET /api/v1/reports/:id - Public tracking fallback endpoint
router.get('/:id', generalLimiter, trackReport);

// POST /api/v1/reports
router.post(
  '/',
  reportSubmissionLimiter,
  upload.single('photo'),
  validate(createReportSchema),
  submitReport
);

// POST /api/v1/uploads
router.post('/uploads', upload.single('photo'), uploadPhoto);

module.exports = router;
