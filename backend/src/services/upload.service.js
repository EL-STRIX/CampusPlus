const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const env = require('../config/env');
const { AppError } = require('../middleware/error.middleware');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Resolves the absolute directory path for uploads and ensures it exists.
 * @returns {string}
 */
function getUploadDir() {
  const uploadPath = path.isAbsolute(env.UPLOAD_DIR)
    ? env.UPLOAD_DIR
    : path.join(__dirname, '../../', env.UPLOAD_DIR);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
}

/**
 * Validates file buffer / metadata before writing to disk.
 * @param {Object} file
 */
function validateFile(file) {
  if (!file) {
    throw new AppError('Photo upload is required.', 400, 'VALIDATION_ERROR');
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError(
      'Invalid file type. Only JPG, PNG, and WebP images are allowed.',
      400,
      'INVALID_FILE_TYPE'
    );
  }

  // Validate size
  const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new AppError(
      `File size exceeds the ${env.MAX_UPLOAD_SIZE_MB}MB limit.`,
      400,
      'FILE_TOO_LARGE'
    );
  }

  // Validate extension
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError('Invalid file extension.', 400, 'INVALID_FILE_TYPE');
  }
}

/**
 * Generates a collision-resistant UUID filename.
 * @param {string} originalName
 * @returns {string}
 */
function generateFilename(originalName) {
  const ext = path.extname(originalName || '').toLowerCase() || '.jpg';
  const cleanExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.jpg';
  return `${randomUUID()}${cleanExt}`;
}

/**
 * Saves a file buffer or moves a temporary file to the uploads directory with a UUID filename.
 * @param {Object} file Express/Multer file object
 * @returns {Promise<{ filename: string, url: string, size: number }>}
 */
async function saveFile(file) {
  validateFile(file);

  const uploadDir = getUploadDir();
  const filename = generateFilename(file.originalname);
  const targetPath = path.join(uploadDir, filename);

  if (file.buffer) {
    await fs.promises.writeFile(targetPath, file.buffer);
  } else if (file.path) {
    // If multer already saved to disk, rename to UUID filename
    await fs.promises.rename(file.path, targetPath);
  } else {
    throw new AppError('No file data provided to save.', 400, 'FILE_UPLOAD_ERROR');
  }

  const url = `/uploads/${filename}`;

  return {
    filename,
    url,
    size: file.size,
  };
}

/**
 * Deletes a file from the uploads directory.
 * @param {string} filename
 * @returns {Promise<boolean>}
 */
async function deleteFile(filename) {
  if (!filename) return false;

  // Prevent path traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(getUploadDir(), safeFilename);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Generates the full or relative URL for a filename.
 * @param {string} filename
 * @returns {string}
 */
function getFileUrl(filename) {
  if (!filename) return '';
  const safeFilename = path.basename(filename);
  return `/uploads/${safeFilename}`;
}

module.exports = {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  validateFile,
  generateFilename,
  saveFile,
  deleteFile,
  getFileUrl,
  getUploadDir,
};
