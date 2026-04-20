import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // Загрузить ID избранных товаров
  const fetchFavoriteIds = useCallback(async () => {
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const res = await api.get('/favorites/ids');
      setFavoriteIds(new Set(res.data));
    } catch {
      setFavoriteIds(new Set());
    }
  }, [token]);

  // Загрузить полный список избранных (для страницы)
  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavoriteIds();
  }, [fetchFavoriteIds]);

  const isFavorite = (productId) => favoriteIds.has(productId);

  const toggleFavorite = async (productId) => {
    if (!token) return false;

    const wasFav = favoriteIds.has(productId);

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (wasFav) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      if (wasFav) {
        await api.delete(`/favorites/${productId}`);
      } else {
        await api.post(`/favorites/${productId}`);
      }
      return true;
    } catch {
      // Rollback
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (wasFav) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      return false;
    }
  };

  // Сбросить при логауте
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setFavorites([]);
    }
  }, [user]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        fetchFavorites,
        favoritesCount: favoriteIds.size,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
