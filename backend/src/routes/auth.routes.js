const express = require('express');
const { login, logout, changePassword } = require('../controllers/auth.controller');
const { jwtAuthMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { loginSchema, changePasswordSchema } = require('../validators/admin.validator');

const router = express.Router();

// POST /api/v1/admin/login (Public)
router.post('/login', validate(loginSchema), login);

// POST /api/v1/admin/logout (Protected)
router.post('/logout', jwtAuthMiddleware, logout);

// PATCH /api/v1/admin/profile/password (Protected)
router.patch('/profile/password', jwtAuthMiddleware, validate(changePasswordSchema), changePassword);

module.exports = router;
