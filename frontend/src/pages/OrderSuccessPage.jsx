import React from 'react';
import { Link } from 'react-router-dom';
import styles from './OrderSuccessPage.module.css';

const OrderSuccessPage = () => {
  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.icon}>🎉</div>
          <h1 className={styles.title}>Заказ оформлен!</h1>
          <p className={styles.text}>Спасибо за покупку. Мы свяжемся с вами для подтверждения.</p>
          <Link to="/" className={styles.linkBtn}>
            Вернуться в каталог
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccessPage;