const express = require('express');
const { submitReport, uploadPhoto } = require('../controllers/reports.controller');
const { upload } = require('../middleware/upload.middleware');
const { reportSubmissionLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createReportSchema } = require('../validators/reports.validator');

const router = express.Router();

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
