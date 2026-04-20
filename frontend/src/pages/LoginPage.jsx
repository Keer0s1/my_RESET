import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import styles from './AuthPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError('Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Lock size={32} strokeWidth={1.5} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Добро пожаловать в ReSet</h1>
          <p className={styles.subtitle}>Войдите в свой аккаунт для покупок</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={styles.input}
                id="login-email"
                autoComplete="email"
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={styles.input}
                id="login-password"
                autoComplete="current-password"
              />
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <p className={styles.footer}>
            Нет аккаунта?{' '}
            <Link to="/register" className={styles.footerLink}>
              Создать сейчас
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;