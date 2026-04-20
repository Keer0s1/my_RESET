import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import styles from './FavoritesPage.module.css';

const FavoritesPage = () => {
  const { user } = useAuth();
  const { favorites, loading, fetchFavorites, favoritesCount } = useFavorites();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  if (!user) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Heart size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.emptyTitle}>Избранное</h2>
            <p className={styles.emptyText}>Войдите в аккаунт, чтобы сохранять понравившиеся товары</p>
            <Link to="/login" className={styles.ctaBtn}>Войти</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Избранное</h1>
          {favoritesCount > 0 && (
            <span className={styles.count}>{favoritesCount} {favoritesCount === 1 ? 'товар' : favoritesCount < 5 ? 'товара' : 'товаров'}</span>
          )}
        </div>

        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Heart size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.emptyTitle}>Пока пусто</h2>
            <p className={styles.emptyText}>Нажмите ♥ на любом товаре, чтобы добавить его сюда</p>
            <Link to="/#catalog" className={styles.ctaBtn}>Перейти в каталог</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FavoritesPage;
