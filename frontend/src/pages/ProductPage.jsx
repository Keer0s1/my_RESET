import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import styles from './ProductPage.module.css';

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

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getById(id);
        setProduct(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Товар не найден');
        } else {
          setError('Ошибка загрузки товара');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = () => {
    if (!user) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <Loader fullPage text="Загрузка товара..." />;
  if (error) return <ErrorMessage message={error} fullPage />;
  if (!product) return null;

  const imageSrc = localImages[product.image] || product.image || '';
  const isContain = product.image === '/smartphone.jpg' || product.image === '/tablet.jpg';

  return (
    <section className={styles.page}>
      <div className="container">
        <Link to="/" className={styles.backLink}>← Назад в каталог</Link>

        <div className={styles.content}>
          <div className={styles.imageSection}>
            <img
              src={imageSrc}
              alt={product.name}
              className={`${styles.image} ${isContain ? styles.imageContain : ''}`}
            />
          </div>

          <div className={styles.info}>
            {product.category && (
              <span className={styles.category}>
                {CATEGORY_LABELS[product.category] || product.category}
              </span>
            )}

            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>

            <div className={styles.priceRow}>
              <span className={styles.price}>
                {product.price?.toLocaleString('ru-RU')} ₽
              </span>
              {product.stock !== undefined && (
                <span
                  className={`${styles.stock} ${
                    product.stock > 0 ? styles.inStock : styles.outOfStock
                  }`}
                >
                  {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                </span>
              )}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={product.stock === 0}
              >
                {added ? '✓ Добавлено!' : '🛒 В корзину'}
              </button>
            </div>

            <div className={styles.details}>
              <h3 className={styles.detailsTitle}>Характеристики</h3>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Категория</span>
                  <span className={styles.detailValue}>
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Наличие</span>
                  <span className={styles.detailValue}>{product.stock} шт.</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Артикул</span>
                  <span className={styles.detailValue}>TS-{String(product.id).padStart(5, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPage;
