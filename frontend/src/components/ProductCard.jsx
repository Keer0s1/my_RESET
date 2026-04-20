import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { Heart } from 'lucide-react';
import styles from './ProductCard.module.css';

import phoneImg from '../assets/images/smartphone.jpg';
import laptopImg from '../assets/images/laptop.jpg';
import headphonesImg from '../assets/images/headphones.jpg';
import smartwatchImg from '../assets/images/smartwatch.jpg';
import tabletImg from '../assets/images/tablet.jpg';
import consoleImg from '../assets/images/console.jpg';
import airpodsProImg from '../assets/images/airpods_pro.png';
import steamdeckImg from '../assets/images/steamdeck.png';

const localImages = {
  '/smartphone.jpg': phoneImg,
  '/laptop.jpg': laptopImg,
  '/headphones.jpg': headphonesImg,
  '/smartwatch.jpg': smartwatchImg,
  '/tablet.jpg': tabletImg,
  '/console.jpg': consoleImg,
  '/airpods_pro.png': airpodsProImg,
  '/steamdeck.png': steamdeckImg,
};

const CATEGORY_LABELS = {
  smartphones: 'Смартфоны',
  laptops: 'Ноутбуки',
  accessories: 'Аксессуары',
  tablets: 'Планшеты',
  gaming: 'Игры',
  other: 'Прочее',
};

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const imageSrc = localImages[product.image] || product.image || '';
  const liked = isFavorite(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    addToCart(product);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setAnimating(true);
    toggleFavorite(product.id);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <article className={styles.card} style={{ animationDelay: `${index * 0.05}s` }}>
      <Link to={`/product/${product.id}`} className={styles.imageWrapper}>
        <img
          src={imageSrc}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        {product.category && (
          <span className={styles.categoryBadge}>
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
        )}
        <button
          className={`${styles.heartBtn} ${liked ? styles.heartActive : ''} ${animating ? styles.heartPop : ''}`}
          onClick={handleFavorite}
          aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
      </Link>
      <div className={styles.body}>
        <Link to={`/product/${product.id}`} className={styles.nameLink}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>{product.price?.toLocaleString('ru-RU')} ₽</span>
          <button className={styles.addBtn} onClick={handleAdd}>
            В корзину
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

