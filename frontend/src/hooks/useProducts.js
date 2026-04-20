import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getAll(filters);
      setProducts(response.data);
    } catch (err) {
      setError('Не удалось загрузить товары. Попробуйте позже.');
      console.error('Ошибка загрузки товаров:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const setSearch = (search) => setFilters(prev => ({ ...prev, search }));
  const setCategory = (category) => setFilters(prev => ({ ...prev, category }));
  const setSort = (sort) => setFilters(prev => ({ ...prev, sort }));

  const resetFilters = () => {
    setFilters({});
  };

  return {
    products,
    loading,
    error,
    filters,
    setSearch,
    setCategory,
    setSort,
    resetFilters,
    refetch: fetchProducts,
  };
};

export default useProducts;
