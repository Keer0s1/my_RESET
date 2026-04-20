import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import styles from './CheckoutPage.module.css';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      await orderService.create(items);
      clearCart();
      navigate('/orders/success');
    } catch (err) {
      setError('Ошибка при оформлении заказа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.emptyCard}>
            <h2 className={styles.emptyTitle}>Корзина пуста</h2>
            <Link to="/" className={styles.linkBtn}>Перейти в каталог</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.emptyCard}>
            <h2 className={styles.emptyTitle}>Требуется авторизация</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Для оформления заказа войдите в аккаунт.
            </p>
            <Link to="/login?redirect=/checkout" className={styles.linkBtn}>Войти</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <h1 className="page-title">Оформление заказа</h1>
        <div className={styles.wrapper}>
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>Ваш заказ</h3>
            <div className={styles.itemsList}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.item}>
                  <span className={styles.itemName}>{item.name} × {item.quantity}</span>
                  <span className={styles.itemPrice}>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.total}>
              <span>Итого:</span>
              <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Оформление...' : '✓ Подтвердить заказ'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;