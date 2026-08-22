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

/**
 * Controller: Track / Get Report by ID (Public)
 * GET /api/v1/reports/track/:id
 */
async function trackReport(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new AppError('Ticket / Report ID is required.', 400, 'VALIDATION_ERROR');
    }

    const cleanId = id.trim();

    const report = await prisma.report.findUnique({
      where: { id: cleanId },
      include: {
        building: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          include: {
            admin: { select: { username: true } },
          },
        },
      },
    });

    if (!report) {
      throw new AppError(`Report ticket "${cleanId}" was not found. Please check your Ticket ID and try again.`, 404, 'NOT_FOUND');
    }

    // If report was merged into another ticket, fetch basic target ticket info
    let mergedIntoReport = null;
    if (report.mergedInto) {
      mergedIntoReport = await prisma.report.findUnique({
        where: { id: report.mergedInto },
        select: {
          id: true,
          status: true,
          deviceType: true,
          roomName: true,
          buildingName: true,
        },
      });
    }

    const formatted = {
      id: report.id,
      deviceType: report.deviceType,
      deviceNumber: report.deviceNumber,
      deviceNumberVisible: report.deviceNumberVisible,
      labType: report.labType,
      photoUrl: report.photoUrl,
      buildingId: report.buildingId,
      buildingName: report.buildingName || (report.building ? report.building.name : 'Campus Building'),
      roomId: report.roomId,
      roomName: report.roomName || (report.room ? report.room.name : 'Campus Room'),
      reportCount: report.reportCount,
      status: report.status,
      rejectionReason: report.rejectionReason,
      mergedInto: report.mergedInto,
      mergedIntoReport,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      resolvedAt: report.resolvedAt,
      statusHistory: report.statusHistory.map((h) => ({
        id: h.id,
        status: h.status,
        changedAt: h.changedAt,
        changedBy: 'Facilities Maintenance Staff',
      })),
    };

    res.status(200).json({
      success: true,
      data: formatted,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitReport,
  uploadPhoto,
  trackReport,
};
