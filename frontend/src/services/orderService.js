import api from './api';

export const orderService = {
  create: (items) => api.post('/orders', { items }),

  getMy: () => api.get('/orders/my'),

  getById: (id) => api.get(`/orders/${id}`),
};
