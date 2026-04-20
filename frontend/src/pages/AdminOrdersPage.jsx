import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Package, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './AdminOrdersPage.module.css';

const AdminOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/all');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      fetchOrders();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <section className={styles.page}>
        <div className="container">
          <p className={styles.denied}>Доступ запрещён</p>
        </div>
      </section>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Заказы</h1>
            <p className={styles.subtitle}>
              {orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'} • Выручка: {totalRevenue.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {loading ? (
          <p className={styles.loading}>Загрузка...</p>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} strokeWidth={1.5} />
            <p>Заказов пока нет</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <button className={styles.orderHeader} onClick={() => toggleExpand(order.id)}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>#{order.id}</span>
                    <div className={styles.orderMeta}>
                      <span className={styles.metaItem}>
                        <User size={14} />
                        {order.user?.username || 'N/A'}
                      </span>
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.orderTotal}>
                      {(order.totalAmount || 0).toLocaleString('ru-RU')} ₽
                    </span>
                    {expandedId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>
                {expandedId === order.id && (
                  <div className={styles.orderDetails}>
                    <div className={styles.detailsHeader}>
                      <span>Товар</span>
                      <span>Кол-во</span>
                      <span>Цена</span>
                    </div>
                    {order.orderItems?.map(item => (
                      <div key={item.id} className={styles.detailRow}>
                        <span className={styles.itemName}>{item.product?.name || 'Товар'}</span>
                        <span className={styles.itemQty}>{item.quantity}</span>
                        <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                      </div>
                    ))}
                    <div className={styles.detailsFooter}>
                      <span>Email: {order.user?.email || '—'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminOrdersPage;
