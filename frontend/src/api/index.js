import apiClient from './client';

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  register: (data) => apiClient.post('/auth/register/', data),
  getProfile: () => apiClient.get('/auth/profile/'),
  updateProfile: (data) => apiClient.patch('/auth/profile/', data),
  changePassword: (data) => apiClient.post('/auth/change-password/', data),
  
  // Admin
  getAdminUsers: (params) => apiClient.get('/auth/admin/users/', { params }),
  createAdminUser: (data) => apiClient.post('/auth/admin/users/create/', data),
  getAdminUserDetail: (id) => apiClient.get(`/auth/admin/users/${id}/`),
  updateAdminUser: (id, data) => apiClient.patch(`/auth/admin/users/${id}/`, data),
  toggleUserStatus: (id) => apiClient.post(`/auth/admin/users/${id}/toggle-status/`),
};

export const coursesAPI = {
  getCertifications: (params) => apiClient.get('/courses/certifications/', { params }),
  getCertificationDetail: (slug) => apiClient.get(`/courses/certifications/${slug}/`),
  getVideoPlayback: (videoId) => apiClient.get(`/courses/videos/${videoId}/playback/`),
  
  // Admin
  getAdminCertifications: () => apiClient.get('/courses/admin/certifications/'),
  createCertification: (data) => apiClient.post('/courses/admin/certifications/', data),
  updateCertification: (id, data) => apiClient.put(`/courses/admin/certifications/${id}/`, data),
  deleteCertification: (id) => apiClient.delete(`/courses/admin/certifications/${id}/`),

  getAdminModules: (params) => apiClient.get('/courses/admin/modules/', { params }),
  createModule: (data) => apiClient.post('/courses/admin/modules/', data),
  updateModule: (id, data) => apiClient.put(`/courses/admin/modules/${id}/`, data),
  deleteModule: (id) => apiClient.delete(`/courses/admin/modules/${id}/`),

  getAdminChapters: (params) => apiClient.get('/courses/admin/chapters/', { params }),
  createChapter: (data) => apiClient.post('/courses/admin/chapters/', data),
  updateChapter: (id, data) => apiClient.put(`/courses/admin/chapters/${id}/`, data),
  deleteChapter: (id) => apiClient.delete(`/courses/admin/chapters/${id}/`),

  getAdminVideos: (params) => apiClient.get('/courses/admin/videos/', { params }),
  createVideo: (data) => apiClient.post('/courses/admin/videos/', data),
  updateVideo: (id, data) => apiClient.put(`/courses/admin/videos/${id}/`, data),
  deleteVideo: (id) => apiClient.delete(`/courses/admin/videos/${id}/`),
};

export const paymentsAPI = {
  getOrangeMoneyConfig: () => apiClient.get('/payments/orange-money/config/'),
  submitProof: (formData) => apiClient.post('/payments/proofs/submit/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyProofs: () => apiClient.get('/payments/proofs/my-proofs/'),
  getMyEnrollments: () => apiClient.get('/payments/my-enrollments/'),

  // Admin
  getAdminProofs: (params) => apiClient.get('/payments/admin/proofs/', { params }),
  reviewProof: (id, data) => apiClient.post(`/payments/admin/proofs/${id}/review/`, data),
  getAdminStats: () => apiClient.get('/payments/admin/stats/'),
};

export const learningAPI = {
  updateProgress: (data) => apiClient.post('/learning/progress/update/', data),
  getResumePoint: (certId) => apiClient.get(`/learning/progress/resume/${certId}/`),
  markChapterComplete: (chapterId) => apiClient.post(`/learning/chapters/${chapterId}/complete/`),

  getQuizDetail: (quizId) => apiClient.get(`/learning/quizzes/${quizId}/`),
  submitQuiz: (quizId, data) => apiClient.post(`/learning/quizzes/${quizId}/submit/`, data),

  // Admin
  getAdminQuizzes: () => apiClient.get('/learning/admin/quizzes/'),
  createAdminQuiz: (data) => apiClient.post('/learning/admin/quizzes/', data),
  updateAdminQuiz: (id, data) => apiClient.put(`/learning/admin/quizzes/${id}/`, data),
  deleteAdminQuiz: (id) => apiClient.delete(`/learning/admin/quizzes/${id}/`),

  getAdminQuestions: (params) => apiClient.get('/learning/admin/questions/', { params }),
  createAdminQuestion: (data) => apiClient.post('/learning/admin/questions/', data),
  updateAdminQuestion: (id, data) => apiClient.put(`/learning/admin/questions/${id}/`, data),
  deleteAdminQuestion: (id) => apiClient.delete(`/learning/admin/questions/${id}/`),

  createAdminChoice: (data) => apiClient.post('/learning/admin/choices/', data),
  updateAdminChoice: (id, data) => apiClient.put(`/learning/admin/choices/${id}/`, data),
  deleteAdminChoice: (id) => apiClient.delete(`/learning/admin/choices/${id}/`),
};

export const certificatesAPI = {
  getMyCertificates: () => apiClient.get('/certificates/my-certificates/'),
  verifyPublic: (code) => apiClient.get(`/certificates/verify/${code}/`),

  // Admin
  getAdminCertificates: (params) => apiClient.get('/certificates/admin/certificates/', { params }),
  takeCertificateAction: (id, data) => apiClient.post(`/certificates/admin/certificates/${id}/action/`, data),
};

export const interactionsAPI = {
  getVideoComments: (videoId) => apiClient.get(`/interactions/videos/${videoId}/comments/`),
  postVideoComment: (videoId, data) => apiClient.post(`/interactions/videos/${videoId}/comments/`, data),

  getNotifications: () => apiClient.get('/interactions/notifications/'),
  markAllNotificationsRead: () => apiClient.post('/interactions/notifications/mark-all-read/'),
  markNotificationRead: (id) => apiClient.post(`/interactions/notifications/${id}/mark-read/`),

  // Admin
  getAdminAuditLogs: (params) => apiClient.get('/interactions/admin/audit-logs/', { params }),
};
