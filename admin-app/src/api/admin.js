import apiClient from './client';

export async function loginAdmin(username, password) {
  const res = await apiClient.post('/admin/login', { username, password });
  return res.data;
}

export async function logoutAdmin() {
  try {
    await apiClient.post('/admin/logout');
  } catch (err) {
    // Suppress error if token already expired
  }
}

export async function getDashboardSummary() {
  const res = await apiClient.get('/admin/dashboard-summary');
  return res.data;
}

export async function getReports(params = {}) {
  const res = await apiClient.get('/admin/reports', { params });
  return res.data;
}

export async function getReportById(id) {
  const res = await apiClient.get(`/admin/reports/${id}`);
  return res.data;
}

export async function updateReportStatus(id, data) {
  const res = await apiClient.patch(`/admin/reports/${id}/status`, data);
  return res.data;
}

export async function getNeedsReviewReports() {
  const res = await apiClient.get('/admin/reports/needs-review');
  return res.data;
}

export async function mergeReport(id, targetReportId) {
  const res = await apiClient.post(`/admin/reports/${id}/merge`, { targetReportId });
  return res.data;
}

export async function keepReportSeparate(id) {
  const res = await apiClient.post(`/admin/reports/${id}/keep-separate`);
  return res.data;
}

export async function changeAdminPassword(currentPassword, newPassword) {
  const res = await apiClient.patch('/admin/profile/password', {
    currentPassword,
    newPassword,
  });
  return res.data;
}

export async function getBuildings() {
  const res = await apiClient.get('/buildings');
  return res.data;
}

export async function getDepartments() {
  const res = await apiClient.get('/departments');
  return res.data;
}
