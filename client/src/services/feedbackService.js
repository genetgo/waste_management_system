import API from './api';

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const response = await API.post('/feedback', feedbackData);
    return response.data;
  },

  getAllFeedbacks: async () => {
    const response = await API.get('/feedback');
    return response.data;
  },

  updateFeedbackStatus: async (id, status) => {
    const response = await API.patch(`/feedback/${id}`, { status });
    return response.data;
  },
};