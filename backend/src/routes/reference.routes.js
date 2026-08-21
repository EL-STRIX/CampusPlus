const express = require('express');
const { getDepartments, getBuildings } = require('../controllers/reference.controller');
const { generalLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

router.use(generalLimiter);

router.get('/departments', getDepartments);
router.get('/buildings', getBuildings);

module.exports = router;
