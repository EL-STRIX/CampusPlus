const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

/**
 * Controller: Get Reports List with Filtering, Searching, Sorting, and Pagination
 * GET /api/v1/admin/reports
 */
async function getReports(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      buildingId,
      department,
      labType,
      deviceType,
      dateFrom,
      dateTo,
      sortBy = 'reportCount',
      sortOrder = 'desc',
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {
      mergedInto: null, // Exclude soft-deleted/merged reports by default
    };

    if (status && status.trim()) {
      where.status = status.trim();
    }

    if (buildingId && buildingId.trim()) {
      where.OR = [
        { buildingId: buildingId.trim() },
        { buildingName: { contains: buildingId.trim(), mode: 'insensitive' } },
      ];
    }

    if (deviceType && deviceType.trim()) {
      where.deviceType = {
        contains: deviceType.trim(),
        mode: 'insensitive',
      };
    }

    if (labType && labType.trim()) {
      where.labType = {
        contains: labType.trim(),
        mode: 'insensitive',
      };
    }

    // Filter by department (matches any reporter with that department)
    if (department && department.trim()) {
      where.reporters = {
        some: {
          department: {
            contains: department.trim(),
            mode: 'insensitive',
          },
        },
      };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Search across device tag, device name, room, building, lab type, and student code
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        {
          deviceNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          deviceType: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          buildingName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          roomName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          labType: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          reporters: {
            some: {
              studentCode: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    // Determine sorting
    const validSortFields = ['reportCount', 'createdAt', 'status', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'reportCount';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [totalReports, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: direction },
        include: {
          building: { select: { id: true, name: true } },
          room: { select: { id: true, name: true } },
        },
      }),
    ]);

    const formattedReports = reports.map((r) => ({
      id: r.id,
      deviceType: r.deviceType,
      deviceNumber: r.deviceNumber,
      deviceNumberVisible: r.deviceNumberVisible,
      labType: r.labType,
      photoUrl: r.photoUrl,
      buildingId: r.buildingId,
      buildingName: r.buildingName || (r.building ? r.building.name : 'Unknown Building'),
      roomId: r.roomId,
      roomName: r.roomName || (r.room ? r.room.name : 'Unknown Room'),
      reportCount: r.reportCount,
      status: r.status,
      possibleDuplicate: r.possibleDuplicate,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      resolvedAt: r.resolvedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        reports: formattedReports,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalReports / limitNum) || 1,
          totalReports,
        },
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Get Single Report Detail
 * GET /api/v1/admin/reports/:id
 */
async function getReportById(req, res, next) {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        building: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        reporters: {
          orderBy: { reportedAt: 'desc' },
          select: {
            id: true,
            studentCode: true,
            department: true,
            stream: true,
            labType: true,
            yearSemester: true,
            notes: true,
            reportedAt: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: {
            admin: { select: { username: true } },
          },
        },
      },
    });

    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    const formatted = {
      id: report.id,
      deviceType: report.deviceType,
      deviceNumber: report.deviceNumber,
      deviceNumberVisible: report.deviceNumberVisible,
      labType: report.labType,
      photoUrl: report.photoUrl,
      buildingId: report.buildingId,
      buildingName: report.buildingName || (report.building ? report.building.name : 'Unknown Building'),
      roomId: report.roomId,
      roomName: report.roomName || (report.room ? report.room.name : 'Unknown Room'),
      reportCount: report.reportCount,
      status: report.status,
      possibleDuplicate: report.possibleDuplicate,
      suggestedMatchIds: report.suggestedMatchIds,
      mergedInto: report.mergedInto,
      rejectionReason: report.rejectionReason,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      resolvedAt: report.resolvedAt,
      reporters: report.reporters,
      statusHistory: report.statusHistory.map((h) => ({
        id: h.id,
        status: h.status,
        changedAt: h.changedAt,
        changedBy: h.admin.username,
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

/**
 * Controller: Update Report Status (Workflow)
 * PATCH /api/v1/admin/reports/:id/status
 */
async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const existingReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    const updateData = {
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : null,
      resolvedAt: status === 'resolved' ? new Date() : null,
    };

    // Run status update + history insertion atomically in a transaction
    const [updatedReport] = await prisma.$transaction([
      prisma.report.update({
        where: { id },
        data: updateData,
      }),
      prisma.reportStatusHistory.create({
        data: {
          reportId: id,
          status,
          changedBy: req.admin.id,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        id: updatedReport.id,
        status: updatedReport.status,
        rejectionReason: updatedReport.rejectionReason,
        resolvedAt: updatedReport.resolvedAt,
        updatedAt: updatedReport.updatedAt,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Get Needs Review Reports with Suggested Matches
 * GET /api/v1/admin/reports/needs-review
 */
async function getNeedsReview(req, res, next) {
  try {
    const flaggedReports = await prisma.report.findMany({
      where: {
        possibleDuplicate: true,
        mergedInto: null,
        status: { in: ['open', 'in_progress'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        building: { select: { name: true } },
        room: { select: { name: true } },
        reporters: true,
      },
    });

    // Fetch suggested matches details for each flagged report
    const reportsWithMatches = await Promise.all(
      flaggedReports.map(async (r) => {
        let suggestedMatches = [];
        if (r.suggestedMatchIds && r.suggestedMatchIds.length > 0) {
          suggestedMatches = await prisma.report.findMany({
            where: {
              id: { in: r.suggestedMatchIds },
              mergedInto: null,
            },
            include: {
              building: { select: { name: true } },
              room: { select: { name: true } },
            },
          });
        }

        return {
          id: r.id,
          deviceType: r.deviceType,
          deviceNumber: r.deviceNumber,
          deviceNumberVisible: r.deviceNumberVisible,
          labType: r.labType,
          photoUrl: r.photoUrl,
          buildingName: r.building.name,
          roomName: r.room.name,
          reportCount: r.reportCount,
          status: r.status,
          createdAt: r.createdAt,
          reporters: r.reporters,
          suggestedMatches: suggestedMatches.map((m) => ({
            id: m.id,
            deviceType: m.deviceType,
            deviceNumber: m.deviceNumber,
            labType: m.labType,
            photoUrl: m.photoUrl,
            buildingName: m.building.name,
            roomName: m.room.name,
            reportCount: m.reportCount,
            status: m.status,
            createdAt: m.createdAt,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: reportsWithMatches,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Merge Flagged Report into Target Report
 * POST /api/v1/admin/reports/:id/merge
 */
async function mergeReport(req, res, next) {
  try {
    const { id: sourceReportId } = req.params;
    const { targetReportId } = req.body;

    if (sourceReportId === targetReportId) {
      throw new AppError('Cannot merge a report into itself.', 400, 'VALIDATION_ERROR');
    }

    const [sourceReport, targetReport] = await Promise.all([
      prisma.report.findUnique({
        where: { id: sourceReportId },
        include: { reporters: true },
      }),
      prisma.report.findUnique({
        where: { id: targetReportId },
      }),
    ]);

    if (!sourceReport) {
      throw new AppError('Source report not found', 404, 'NOT_FOUND');
    }
    if (!targetReport) {
      throw new AppError('Target report not found', 404, 'NOT_FOUND');
    }

    const reportersCountToMove = sourceReport.reporters.length || sourceReport.reportCount || 1;

    // Run merge in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Move all reporter records from source to target
      await tx.reportReporter.updateMany({
        where: { reportId: sourceReportId },
        data: { reportId: targetReportId },
      });

      // 2. Increment target reportCount
      const updatedTarget = await tx.report.update({
        where: { id: targetReportId },
        data: {
          reportCount: {
            increment: reportersCountToMove,
          },
        },
      });

      // 3. Mark source report as merged
      await tx.report.update({
        where: { id: sourceReportId },
        data: {
          mergedInto: targetReportId,
          possibleDuplicate: false,
        },
      });

      return updatedTarget;
    });

    res.status(200).json({
      success: true,
      data: {
        mergedInto: targetReportId,
        newReportCount: result.reportCount,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Keep Flagged Report Separate
 * POST /api/v1/admin/reports/:id/keep-separate
 */
async function keepSeparate(req, res, next) {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        possibleDuplicate: false,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        possibleDuplicate: false,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Admin Dashboard Summary Counts
 * GET /api/v1/admin/dashboard-summary
 */
async function getDashboardSummary(_req, res, next) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [openCount, inProgressCount, resolvedCount, rejectedCount, needsReviewCount, todayCount] =
      await Promise.all([
        prisma.report.count({ where: { status: 'open', mergedInto: null } }),
        prisma.report.count({ where: { status: 'in_progress', mergedInto: null } }),
        prisma.report.count({ where: { status: 'resolved', mergedInto: null } }),
        prisma.report.count({ where: { status: 'rejected', mergedInto: null } }),
        prisma.report.count({
          where: {
            possibleDuplicate: true,
            mergedInto: null,
            status: { in: ['open', 'in_progress'] },
          },
        }),
        prisma.report.count({
          where: {
            createdAt: { gte: startOfToday },
            mergedInto: null,
          },
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
        needsReview: needsReviewCount,
        totalToday: todayCount,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReports,
  getReportById,
  updateReportStatus,
  getNeedsReview,
  mergeReport,
  keepSeparate,
  getDashboardSummary,
};
