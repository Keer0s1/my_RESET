import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, Lock, Trash2, Plus, Minus } from 'lucide-react';
import styles from './CartPage.module.css';

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

const getImageSrc = (item) => {
  return localImages[item.image] || item.image || '';
};

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.emptyCard}>
            <div className={styles.iconWrapper}>
              <Lock size={64} strokeWidth={1.5} className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Требуется авторизация.</h2>
            <p className={styles.emptyText}>
              Пожалуйста, войдите в свой аккаунт, чтобы просматривать корзину и оформлять заказы.
            </p>
            <div className={styles.authBtns}>
              <Link to="/login" className={styles.primaryBtn}>Войти</Link>
              <Link to="/register" className={styles.secondaryBtn}>Регистрация</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.emptyCard}>
            <div className={styles.iconWrapper}>
              <ShoppingBag size={80} strokeWidth={1} className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Ваша корзина пуста.</h2>
            <p className={styles.emptyText}>Самое время добавить в неё что-нибудь особенное.</p>
            <Link to="/#catalog" className={styles.primaryBtn}>Продолжить покупки</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={`container ${styles.cartContainer}`}>
        <h1 className={styles.pageTitle}>Корзина</h1>

        <div className={styles.cartContent}>
          <div className={styles.cartList}>
            {cartItems.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.imageWrapper}>
                  <img src={getImageSrc(item)} alt={item.name} className={styles.cartImage} />
                </div>
                
                <div className={styles.cartInfo}>
                  <h3 className={styles.cartName}>{item.name}</h3>
                  <p className={styles.cartPrice}>{item.price?.toLocaleString('ru-RU')} ₽</p>
                </div>
                
                <div className={styles.qtyControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Уменьшить количество"
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Увеличить количество"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className={styles.itemActions}>
                  <span className={styles.cartSubtotal}>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Удалить товар"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summarySidebar}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Сумма заказа</h2>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Товары ({cartItems.length})</span>
                <span className={styles.summaryValue}>{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Доставка</span>
                <span className={styles.summaryValueHighlight}>Бесплатно</span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={styles.summaryTotal}>
                <span>Итого</span>
                <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              <Link to="/checkout" className={styles.checkoutBtn}>
                Оформить заказ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;