import API from './api';

export const reportService = {
  getCollectionReports: async (params) => {
    const response = await API.get('/reports/collection', { params });
    return response.data;
  },

  getPerformanceReports: async () => {
    const response = await API.get('/reports/performance');
    return response.data;
  },

  exportReportPDF: async (reportId) => {
    const response = await API.get(`/reports/export/${reportId}`, { responseType: 'blob' });
    return response.data;
  },
};