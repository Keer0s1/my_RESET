import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './MyOrdersPage.module.css';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Оформлен',   icon: '📋' },
  { key: 'confirmed',  label: 'Одобрен',    icon: '✅' },
  { key: 'assembling', label: 'Собирается', icon: '📦' },
  { key: 'shipped',    label: 'В пути',     icon: '🚚' },
  { key: 'delivered',  label: 'Доставлен',  icon: '🏠' },
];

const MyOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <Package size={48} strokeWidth={1.5} />
            <h2>Мои заказы</h2>
            <p>Войдите, чтобы видеть свои заказы</p>
            <Link to="/login" className={styles.ctaBtn}>Войти</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Мои заказы</h1>
          {orders.length > 0 && (
            <span className={styles.count}>{orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'}</span>
          )}
        </div>

        {loading ? (
          <p className={styles.loading}>Загрузка...</p>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} strokeWidth={1.5} />
            <h2>Заказов пока нет</h2>
            <p>Перейдите в каталог, чтобы сделать первый заказ</p>
            <Link to="/" className={styles.ctaBtn}>В каталог</Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => {
              const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
              const isExpanded = expandedId === order.id;
              return (
                <div key={order.id} className={styles.orderCard}>
                  <button className={styles.orderHeader} onClick={() => setExpandedId(prev => prev === order.id ? null : order.id)}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>Заказ #{order.id}</span>
                      <span className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.currentStatus}>
                        {STATUS_STEPS[currentIdx]?.icon} {STATUS_STEPS[currentIdx]?.label}
                      </span>
                      <span className={styles.orderTotal}>{(order.totalAmount || 0).toLocaleString('ru-RU')} ₽</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={styles.orderDetails}>
                      {/* Таймлайн статусов */}
                      <div className={styles.timeline}>
                        {STATUS_STEPS.map((step, i) => {
                          const isDone = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={step.key} className={`${styles.timelineStep} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}>
                              <div className={styles.stepDot}>
                                {isDone ? <span className={styles.dotCheck}>✓</span> : <span className={styles.dotNum}>{i + 1}</span>}
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`${styles.stepLine} ${isDone && i < currentIdx ? styles.lineDone : ''}`} />
                              )}
                              <span className={styles.stepLabel}>{step.icon} {step.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Трек-номер */}
                      {order.trackingNumber && (
                        <div className={styles.trackBox}>
                          <span className={styles.trackLabel}>🚚 Трек-номер для отслеживания:</span>
                          <span className={styles.trackNumber}>{order.trackingNumber}</span>
                        </div>
                      )}

                      {/* Товары */}
                      <div className={styles.itemsList}>
                        <p className={styles.itemsTitle}>Состав заказа</p>
                        {order.orderItems?.map(item => (
                          <div key={item.id} className={styles.itemRow}>
                            <span className={styles.itemName}>{item.product?.name || 'Товар'}</span>
                            <span className={styles.itemMeta}>{item.quantity} шт. · {(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrdersPage;
