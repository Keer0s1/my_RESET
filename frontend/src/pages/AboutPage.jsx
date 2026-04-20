import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Headphones, Zap } from 'lucide-react';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.heroSection}>
        <div className="container">
          <h1 className={styles.title}>
            Re<span className={styles.accent}>Set</span>
          </h1>
          <p className={styles.subtitle}>
            Мы не просто продаем гаджеты. Мы стираем границы между вами и технологиями будущего.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.contentSection}>
          <div className={styles.textBlock}>
            <h2 className={styles.heading}>Наша философия</h2>
            <p className={styles.paragraph}>
              В эпоху, когда технологии развиваются с невероятной скоростью, важно иметь надежного проводника в мире инноваций. 
              Мы создали <strong>ReSet</strong> с одной целью — предложить премиальный опыт покупки электроники, где каждая деталь, 
              от выбора устройства на сайте до распаковки дома, приносит удовольствие.
            </p>
            <p className={styles.paragraph}>
              Для нас нет компромиссов в качестве. В нашем каталоге представлены только лучшие устройства от ведущих мировых брендов: 
              от мощных флагманских смартфонов до ультимативных игровых консолей.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <ShieldCheck size={28} />
              </div>
              <h3 className={styles.featureTitle}>Гарантия оригинала</h3>
              <p className={styles.featureText}>Только сертифицированная техника с официальной гарантией.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Zap size={28} />
              </div>
              <h3 className={styles.featureTitle}>Новинки первыми</h3>
              <p className={styles.featureText}>Мы привозим самые ожидаемые устройства сразу после мирового релиза.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Truck size={28} />
              </div>
              <h3 className={styles.featureTitle}>Премиум-доставка</h3>
              <p className={styles.featureText}>Бережная и быстрая доставка до вашей двери.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Headphones size={28} />
              </div>
              <h3 className={styles.featureTitle}>Поддержка 24/7</h3>
              <p className={styles.featureText}>Наши эксперты всегда готовы помочь с выбором и настройкой.</p>
            </div>
          </div>

          <div className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>Готовы к обновлению?</h2>
            <Link to="/#catalog" className={styles.ctaBtn}>
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
