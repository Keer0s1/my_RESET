import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({
  message = 'Произошла ошибка',
  title = 'Ошибка',
  onRetry,
  fullPage = false,
}) => {
  return (
    <div className={`${styles.container} ${fullPage ? styles.fullPage : ''}`}>
      <span className={styles.icon}>⚠️</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Попробовать снова
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
