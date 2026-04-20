import React from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.brandSection}>
            <div className={styles.brand}>
              Re<span className={styles.brandAccent}>Set</span>
            </div>
            <p className={styles.brandDescription}>
              Новое поколение звука и технологий. Премиальная электроника с высочайшим уровнем сервиса.
            </p>
          </div>

          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Навигация</h4>
            <div className={styles.links}>
              <Link to="/#catalog" className={styles.link}>Каталог</Link>
              <Link to="/about" className={styles.link}>О нас</Link>
              <Link to="/cart" className={styles.link}>Корзина</Link>
            </div>
          </div>

          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Клиентам</h4>
            <div className={styles.links}>
              <Link to="/login" className={styles.link}>Личный кабинет</Link>
              <Link to="/support" className={styles.link}>Доставка и возврат</Link>
              <Link to="/support" className={styles.link}>Поддержка</Link>
            </div>
          </div>

          <div className={styles.contactSection}>
            <h4 className={styles.sectionTitle}>Связь с нами</h4>
            <a 
              href="https://t.me/techshop_support_bot" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.telegramBot}
            >
              <div className={styles.tgIconWrapper}>
                <Send size={18} className={styles.tgIcon} />
              </div>
              <div className={styles.tgInfo}>
                <span className={styles.tgTitle}>Telegram Поддержка</span>
                <span className={styles.tgHandle}>@techshop_support_bot</span>
              </div>
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} ReSet. Все права защищены.
          </p>
          <div className={styles.legalLinks}>
            <span className={styles.legalLink}>Политика конфиденциальности</span>
            <span className={styles.legalLink}>Пользовательское соглашение</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
