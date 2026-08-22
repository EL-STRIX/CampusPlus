const defaultPrisma = require('../config/db');

/**
 * Duplicate-Matching Service
 * Core business logic for CampusPlus report submissions per PRD.md §6 & TRD.md §6.1-6.3.
 *
 * This service runs within a single database transaction to prevent race conditions
 * during concurrent submissions.
 *
 * @param {Object} payload Submission payload
 * @param {string} payload.studentCode Student roll number/code
 * @param {string} payload.department Student department
 * @param {string} payload.stream Student stream/branch
 * @param {string} [payload.yearSemester] Student year/semester
 * @param {string} payload.buildingId UUID of building
 * @param {string} payload.roomId UUID of room
 * @param {string} payload.deviceType Device type enum string
 * @param {string} [payload.deviceNumber] Device asset tag / number (if visible)
 * @param {boolean} payload.deviceNumberVisible Whether device number is visible
 * @param {string} payload.photoUrl URL / path to uploaded evidence photo
 * @param {string} [payload.additionalNotes] Free-text notes from the reporting student
 * @param {Object} [prismaClient] Optional Prisma client instance (defaults to singleton)
 * @returns {Promise<{ reportId: string, isNewReport: boolean, isPossibleDuplicate: boolean, reportCount: number, report: Object }>}
 */
async function processReportSubmission(payload, prismaClient = defaultPrisma) {
  const {
    studentCode,
    department,
    stream,
    labType,
    yearSemester,
    buildingId,
    roomId,
    deviceType,
    deviceNumber,
    deviceNumberVisible,
    photoUrl,
    additionalNotes,
  } = payload;

  const isVisible = Boolean(deviceNumberVisible);
  const cleanDeviceNumber = isVisible && deviceNumber ? deviceNumber.trim() : null;

  return await prismaClient.$transaction(async (tx) => {
    // -------------------------------------------------------------
    // Scenario 1: Device number IS visible -> Attempt Exact Matching
    // -------------------------------------------------------------
    if (isVisible && cleanDeviceNumber) {
      // Find active (open or in_progress) matching report
      const existingReport = await tx.report.findFirst({
        where: {
          roomId,
          deviceNumber: cleanDeviceNumber,
          status: {
            in: ['open', 'in_progress'],
          },
        },
      });

      if (existingReport) {
        // Increment report count on existing report
        const updatedReport = await tx.report.update({
          where: { id: existingReport.id },
          data: {
            reportCount: {
              increment: 1,
            },
          },
        });

        // Add reporter row linked to existing report
        await tx.reportReporter.create({
          data: {
            reportId: existingReport.id,
            studentCode,
            department,
            stream,
            labType: labType || null,
            yearSemester: yearSemester || null,
            notes: additionalNotes || null,
          },
        });

        return {
          reportId: updatedReport.id,
          isNewReport: false,
          isPossibleDuplicate: false,
          reportCount: updatedReport.reportCount,
          report: updatedReport,
        };
      }

      // No match found -> Create brand new report
      const newReport = await tx.report.create({
        data: {
          deviceType,
          deviceNumber: cleanDeviceNumber,
          deviceNumberVisible: true,
          labType: labType || null,
          buildingId,
          roomId,
          photoUrl,
          reportCount: 1,
          possibleDuplicate: false,
          suggestedMatchIds: [],
          status: 'open',
        },
      });

      // Insert reporter row
      await tx.reportReporter.create({
        data: {
          reportId: newReport.id,
          studentCode,
          department,
          stream,
          labType: labType || null,
          yearSemester: yearSemester || null,
          notes: additionalNotes || null,
        },
      });

      return {
        reportId: newReport.id,
        isNewReport: true,
        isPossibleDuplicate: false,
        reportCount: 1,
        report: newReport,
      };
    }

    // -------------------------------------------------------------
    // Scenario 2: Device number is NOT visible -> Flag for Manual Review
    // NEVER auto-merge on room + deviceType alone (prevents false positives)
    // -------------------------------------------------------------
    const candidateMatches = await tx.report.findMany({
      where: {
        roomId,
        deviceType,
        status: {
          in: ['open', 'in_progress'],
        },
      },
      select: {
        id: true,
      },
    });

    const suggestedMatchIds = candidateMatches.map((c) => c.id);

    const flaggedReport = await tx.report.create({
      data: {
        deviceType,
        deviceNumber: null,
        deviceNumberVisible: false,
        labType: labType || null,
        buildingId,
        roomId,
        photoUrl,
        reportCount: 1,
        possibleDuplicate: true,
        suggestedMatchIds,
        status: 'open',
      },
    });

    await tx.reportReporter.create({
      data: {
        reportId: flaggedReport.id,
        studentCode,
        department,
        stream,
        labType: labType || null,
        yearSemester: yearSemester || null,
        notes: additionalNotes || null,
      },
    });

    return {
      reportId: flaggedReport.id,
      isNewReport: true,
      isPossibleDuplicate: true,
      reportCount: 1,
      suggestedMatchIds,
      report: flaggedReport,
    };
  });
}

module.exports = {
  processReportSubmission,
};
