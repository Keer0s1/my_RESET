import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import useTheme from '../hooks/useTheme';
import { Search, ShoppingBag, Sun, Moon, User, LogOut, MessageCircle, Heart, Package } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems, clearCart } = useCart();
  const { favoritesCount } = useFavorites();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    clearCart();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          Re<span className={styles.logoAccent}>Set</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Global">
          <Link to="/" className={styles.navLink} onClick={closeMenu}>
            <Search className={styles.navIcon} strokeWidth={1.5} />
            <span className={styles.navText}>Каталог</span>
          </Link>

          <Link to="/cart" className={styles.navLink} onClick={closeMenu}>
            <ShoppingBag className={styles.navIcon} strokeWidth={1.5} />
            <span className={styles.navText}>Корзина</span>
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </Link>

          <Link to="/favorites" className={styles.navLink} onClick={closeMenu}>
            <Heart className={styles.navIcon} strokeWidth={1.5} />
            <span className={styles.navText}>Избранное</span>
            {favoritesCount > 0 && <span className={styles.favBadge}>{favoritesCount}</span>}
          </Link>

          {user && (
            <Link
              to={user.role === 'admin' ? '/admin/support' : '/support'}
              className={styles.navLink}
              onClick={closeMenu}
            >
              <MessageCircle className={styles.navIcon} strokeWidth={1.5} />
              <span className={styles.navText}>Поддержка</span>
            </Link>
          )}

          {user?.role !== 'admin' && user && (
            <Link to="/orders/my" className={styles.navLink} onClick={closeMenu}>
              <Package className={styles.navIcon} strokeWidth={1.5} />
              <span className={styles.navText}>Мои заказы</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin/orders" className={styles.navLink} onClick={closeMenu}>
              <Package className={styles.navIcon} strokeWidth={1.5} />
              <span className={styles.navText}>Заказы</span>
            </Link>
          )}

          <div className={styles.divider} />

          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label="Theme"
          >
            {theme === 'light' ? <Moon className={styles.navIcon} strokeWidth={1.5} /> : <Sun className={styles.navIcon} strokeWidth={1.5} />}
          </button>

          {user ? (
            <>
              <span className={styles.username}>{user.username}</span>
              <button onClick={handleLogout} className={styles.iconBtn} title="Выйти">
                <LogOut className={styles.navIcon} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink} onClick={closeMenu}>
                <User className={styles.navIcon} strokeWidth={1.5} />
                Вход
              </Link>
            </>
          )}
        </nav>

        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
        </button>
      </div>
    </header>
  );
};

export default Header;