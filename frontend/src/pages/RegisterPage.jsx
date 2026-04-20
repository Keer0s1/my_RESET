import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import styles from './AuthPage.module.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/login');
    } catch (err) {
      setError('Ошибка регистрации. Возможно, пользователь уже существует.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <UserPlus size={32} strokeWidth={1.5} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Создать аккаунт</h1>
          <p className={styles.subtitle}>Присоединяйтесь к ReSet</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="username"
                placeholder="Имя пользователя"
                value={formData.username}
                onChange={handleChange}
                required
                className={styles.input}
                id="register-username"
                autoComplete="username"
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                id="register-email"
                autoComplete="email"
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
                id="register-password"
                autoComplete="new-password"
              />
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <p className={styles.footer}>
            Уже есть аккаунт?{' '}
            <Link to="/login" className={styles.footerLink}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;