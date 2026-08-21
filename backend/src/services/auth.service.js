const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const defaultPrisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

const BCRYPT_COST_FACTOR = 12;

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} plainPassword
 * @returns {Promise<string>}
 */
async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, BCRYPT_COST_FACTOR);
}

/**
 * Compares a plain-text password against a bcrypt hash.
 * @param {string} plainPassword
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainPassword, passwordHash) {
  return await bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Signs a JWT for an authenticated admin.
 * @param {Object} admin Admin entity { id, username }
 * @param {string} [expiry] Optional custom expiry
 * @returns {string} Signed JWT
 */
function generateToken(admin, expiry = env.JWT_EXPIRY) {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
    },
    env.JWT_SECRET,
    {
      expiresIn: expiry,
    }
  );
}

/**
 * Verifies and decodes a JWT.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN');
  }
}

/**
 * Authenticates admin credentials and issues a JWT session.
 * Generic error returned on failure to prevent username enumeration (PRD US-C1 AC2).
 *
 * @param {string} username
 * @param {string} password
 * @param {Object} [prismaClient]
 * @returns {Promise<{ token: string, expiresIn: string, admin: { id: string, username: string } }>}
 */
async function login(username, password, prismaClient = defaultPrisma) {
  if (!username || !password) {
    throw new AppError('Username and password are required', 400, 'VALIDATION_ERROR');
  }

  const admin = await prismaClient.admin.findUnique({
    where: { username: username.trim() },
  });

  // Generic 401 error message to avoid username enumeration
  if (!admin) {
    throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await comparePassword(password, admin.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(admin);

  return {
    token,
    expiresIn: env.JWT_EXPIRY,
    admin: {
      id: admin.id,
      username: admin.username,
    },
  };
}

/**
 * Updates an admin password after validating current password.
 * @param {string} adminId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {Object} [prismaClient]
 */
async function changePassword(adminId, currentPassword, newPassword, prismaClient = defaultPrisma) {
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400, 'VALIDATION_ERROR');
  }

  if (newPassword.length < 8 || !/\d/.test(newPassword)) {
    throw new AppError(
      'New password must be at least 8 characters long and contain at least 1 number',
      400,
      'VALIDATION_ERROR'
    );
  }

  const admin = await prismaClient.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    throw new AppError('Admin account not found', 404, 'NOT_FOUND');
  }

  const isMatch = await comparePassword(currentPassword, admin.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CREDENTIALS');
  }

  const newHash = await hashPassword(newPassword);

  await prismaClient.admin.update({
    where: { id: adminId },
    data: { passwordHash: newHash },
  });

  return { message: 'Password updated successfully' };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  login,
  changePassword,
};
