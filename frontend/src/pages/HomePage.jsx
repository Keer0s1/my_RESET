import React from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import styles from './HomePage.module.css';

const HomePage = () => {
  const {
    products,
    loading,
    error,
    filters,
    setSearch,
    setCategory,
    setSort,
    resetFilters,
  } = useProducts();

  return (
    <>
      {/* Premium Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <p className={styles.heroSubtitle}>Новое поколение звука</p>
            <h1 className={styles.heroTitle}>
              Магия, которую <br />
              <span className={styles.heroTitleAccent}>вы не слышали</span>
            </h1>
            <p className={styles.heroDescription}>
              Абсолютно новый уровень погружения. Активное шумоподавление и кристально чистый звук в стильном корпусе.
            </p>
            <a href="#catalog" className={styles.heroBtn}>
              Смотреть каталог ↓
            </a>
          </div>
          <div className={styles.hero3DContainer}>
            <img 
              src="/src/assets/images/earbuds.png" 
              alt="Earbuds" 
              className={styles.earbudsImg}
            />
            <img 
              src="/src/assets/images/case.png" 
              alt="Charging Case" 
              className={styles.caseImg}
            />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className={styles.catalog} id="catalog">
        <div className="container">
          <h2 className={styles.sectionTitle}>Каталог</h2>
          <p className={styles.sectionSubtitle}>Найдите идеальное устройство для себя</p>

          <ProductFilters
            filters={filters}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onSortChange={setSort}
            onReset={resetFilters}
            totalCount={products.length}
          />

          {loading && <Loader text="Загрузка каталога..." />}
          {error && <ErrorMessage message={error} />}

          {!loading && !error && (
            <div className={styles.grid}>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              ) : (
                <div className={styles.empty}>
                  Ничего не найдено. Попробуйте изменить фильтры.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;