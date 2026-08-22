const { processReportSubmission } = require('../services/duplicateMatching.service');
const { saveFile, validateFile } = require('../services/upload.service');
const { AppError } = require('../middleware/error.middleware');
const prisma = require('../config/db');

/**
 * Controller: Submit Report (Public)
 * POST /api/v1/reports
 */
async function submitReport(req, res, next) {
  try {
    if (req.fileValidationError) {
      throw new AppError(req.fileValidationError, 400, 'INVALID_FILE_TYPE');
    }

    if (!req.file) {
      throw new AppError('Device photo is mandatory for fault reporting.', 400, 'VALIDATION_ERROR');
    }

    let buildingName = (req.body.buildingName || req.body.building || '').trim();
    let roomName = (req.body.roomName || req.body.room || '').trim();
    let buildingId = req.body.buildingId || null;
    let roomId = req.body.roomId || null;

    if (roomId && buildingId) {
      const room = await prisma.room.findFirst({
        where: {
          id: roomId,
          buildingId,
        },
        include: { building: true },
      });

      if (!room) {
        throw new AppError('Selected room does not exist in the selected building.', 400, 'VALIDATION_ERROR');
      }

      if (!roomName) roomName = room.name;
      if (!buildingName) buildingName = room.building.name;
    }

    if (!buildingName) buildingName = 'Campus Building';
    if (!roomName) roomName = 'Room';

    // Validate photo
    validateFile(req.file);

    // Save photo file
    const uploadResult = await saveFile(req.file);
    const photoUrl = uploadResult.url;

    // Process duplicate matching & submission
    const result = await processReportSubmission({
      studentCode: req.body.studentCode,
      department: req.body.department,
      stream: req.body.stream,
      labType: req.body.labType || null,
      yearSemester: req.body.yearSemester || null,
      buildingName,
      roomName,
      buildingId,
      roomId,
      deviceType: req.body.deviceType,
      deviceNumber: req.body.deviceNumber || null,
      deviceNumberVisible: req.body.deviceNumberVisible,
      photoUrl,
      additionalNotes: req.body.additionalNotes || null,
    });

    res.status(201).json({
      success: true,
      data: {
        reportId: result.reportId,
        isNewReport: result.isNewReport,
        isPossibleDuplicate: result.isPossibleDuplicate,
        reportCount: result.reportCount,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Standalone Photo Upload
 * POST /api/v1/uploads
 */
async function uploadPhoto(req, res, next) {
  try {
    if (req.fileValidationError) {
      throw new AppError(req.fileValidationError, 400, 'INVALID_FILE_TYPE');
    }

    if (!req.file) {
      throw new AppError('No photo file uploaded.', 400, 'VALIDATION_ERROR');
    }

    validateFile(req.file);
    const uploadResult = await saveFile(req.file);

    res.status(201).json({
      success: true,
      data: {
        photoUrl: uploadResult.url,
        filename: uploadResult.filename,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitReport,
  uploadPhoto,
};
