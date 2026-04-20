import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ text = 'Загрузка...', fullPage = false, size = 'md' }) => {
  return (
    <div className={`${styles.overlay} ${fullPage ? styles.fullPage : ''}`}>
      <div className={`${styles.spinner} ${size === 'sm' ? styles.spinnerSm : ''}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loader;
