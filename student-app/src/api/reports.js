import apiClient from './client';

/**
 * Fetches list of departments with nested streams.
 */
export async function getDepartments() {
  const res = await apiClient.get('/departments');
  return res.data;
}

/**
 * Fetches list of buildings with nested rooms.
 */
export async function getBuildings() {
  const res = await apiClient.get('/buildings');
  return res.data;
}

/**
 * Submits a new fault report with multipart photo upload.
 * @param {FormData} formData
 */
export async function submitFaultReport(formData) {
  const res = await apiClient.post('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}
