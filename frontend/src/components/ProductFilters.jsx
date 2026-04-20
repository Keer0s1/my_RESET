import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Search, X } from 'lucide-react';
import styles from './ProductFilters.module.css';

import CustomSelect from './CustomSelect';

const CATEGORY_LABELS = {
  smartphones: 'Смартфоны',
  laptops: 'Ноутбуки',
  accessories: 'Аксессуары',
  tablets: 'Планшеты',
  gaming: 'Игры',
  other: 'Прочее',
};

const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'name_asc', label: 'Название: А–Я' },
  { value: 'name_desc', label: 'Название: Я–А' },
  { value: 'newest', label: 'Новинки' },
];

const ProductFilters = ({ filters, onSearchChange, onCategoryChange, onSortChange, onReset, totalCount }) => {
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    productService.getCategories()
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const categoryOptions = [
    { value: 'all', label: 'Все категории' },
    ...categories.map(cat => ({
      value: cat,
      label: CATEGORY_LABELS[cat] || cat
    }))
  ];

  return (
    <div className={styles.filters}>
      <div className={styles.filtersInner}>
        <div className={styles.searchGroup}>
          <Search className={styles.searchIcon} size={18} strokeWidth={2} />
          <input
            id="search-input"
            type="text"
            className={styles.searchInput}
            placeholder="Поиск..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className={styles.selectGroup}>
          <CustomSelect
            value={filters.category || 'all'}
            onChange={(value) => onCategoryChange(value)}
            options={categoryOptions}
          />
        </div>

        <div className={styles.selectGroup}>
          <CustomSelect
            value={filters.sort || ''}
            onChange={(value) => onSortChange(value)}
            options={SORT_OPTIONS}
          />
        </div>

        <button className={styles.resetBtn} onClick={onReset}>
          <X size={16} strokeWidth={2} /> Сбросить
        </button>
      </div>

      {totalCount !== undefined && (
        <div className={styles.count}>
          {totalCount} {totalCount === 1 ? 'товар' : 'товаров'}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
