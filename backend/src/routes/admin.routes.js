const express = require('express');
const {
  getReports,
  getReportById,
  updateReportStatus,
  getNeedsReview,
  mergeReport,
  keepSeparate,
  getDashboardSummary,
} = require('../controllers/admin.controller');
const { jwtAuthMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateStatusSchema, mergeReportSchema } = require('../validators/admin.validator');

const router = express.Router();

// Apply JWT Authentication to all /admin/* report routes
router.use(jwtAuthMiddleware);

// GET /api/v1/admin/dashboard-summary
router.get('/dashboard-summary', getDashboardSummary);

// GET /api/v1/admin/reports/needs-review
router.get('/reports/needs-review', getNeedsReview);

// GET /api/v1/admin/reports
router.get('/reports', getReports);

// GET /api/v1/admin/reports/:id
router.get('/reports/:id', getReportById);

// PATCH /api/v1/admin/reports/:id/status
router.patch('/reports/:id/status', validate(updateStatusSchema), updateReportStatus);

// POST /api/v1/admin/reports/:id/merge
router.post('/reports/:id/merge', validate(mergeReportSchema), mergeReport);

// POST /api/v1/admin/reports/:id/keep-separate
router.post('/reports/:id/keep-separate', keepSeparate);

module.exports = router;
