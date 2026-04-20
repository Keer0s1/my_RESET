import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),

  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),

  getMe: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
};
