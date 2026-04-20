import api from './api';

export const productService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    return api.get(`/products?${params.toString()}`);
  },

  getById: (id) => api.get(`/products/${id}`),

  getCategories: () => api.get('/products/categories'),
};
