const authService = require('../services/auth.service');

/**
 * Controller: Admin Login (Public)
 * POST /api/v1/admin/login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller: Admin Logout (Protected)
 * POST /api/v1/admin/logout
 */
async function logout(_req, res) {
  // Stateless JWT: logout is confirmed client-side per PRD §11 & TRD §5.4
  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully',
    },
    error: null,
  });
}

/**
 * Controller: Change Admin Password (Protected)
 * PATCH /api/v1/admin/profile/password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.admin.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  logout,
  changePassword,
};
