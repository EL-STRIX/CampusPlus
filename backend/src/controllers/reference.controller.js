const prisma = require('../config/db');

/**
 * Controller: Get Departments and nested streams (Public)
 * GET /api/v1/departments
 */
async function getDepartments(_req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        streams: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: departments,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Get Buildings and nested rooms (Public)
 * GET /api/v1/buildings
 */
async function getBuildings(_req, res, next) {
  try {
    const buildings = await prisma.building.findMany({
      orderBy: { name: 'asc' },
      include: {
        rooms: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: buildings,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDepartments,
  getBuildings,
};
