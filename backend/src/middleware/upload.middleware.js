const multer = require('multer');
const env = require('../config/env');
const { getUploadDir, ALLOWED_MIME_TYPES, generateFilename } = require('../services/upload.service');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (_req, file, cb) => {
    cb(null, generateFilename(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError = 'Invalid file type. Only JPG, PNG, and WebP images are allowed.';
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024, // 5MB limit per TRD.md §7
    files: 1, // Only 1 photo per report in v1 per PRD.md §1.4
  },
});

module.exports = {
  upload,
};
