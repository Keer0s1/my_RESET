import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Package, User, Calendar, ChevronDown, ChevronUp, Check } from 'lucide-react';
import styles from './AdminOrdersPage.module.css';

const STATUS_LABELS = {
  pending:    { label: 'Ожидает',    color: '#f59e0b' },
  confirmed:  { label: 'Одобрен',   color: '#3b82f6' },
  assembling: { label: 'Собирается', color: '#8b5cf6' },
  shipped:    { label: 'Отправлен', color: '#06b6d4' },
  delivered:  { label: 'Доставлен', color: '#22c55e' },
};

const STATUS_ORDER = ['pending', 'confirmed', 'assembling', 'shipped', 'delivered'];

const AdminOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [trackInputs, setTrackInputs] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') fetchOrders();
  }, [user]);

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

  if (!user || user.role !== 'admin') {
    return <section className={styles.page}><div className="container"><p className={styles.denied}>Доступ запрещён</p></div></section>;
  }

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const handleStatusChange = async (orderId, newStatus) => {
    setSaving(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleTrackSave = async (orderId) => {
    const trackingNumber = trackInputs[orderId] ?? '';
    setSaving(prev => ({ ...prev, [`track_${orderId}`]: true }));
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { trackingNumber });
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(prev => ({ ...prev, [`track_${orderId}`]: false }));
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Заказы</h1>
            <p className={styles.subtitle}>
              {orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'} · Выручка: {totalRevenue.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {loading ? (
          <p className={styles.loading}>Загрузка...</p>
        ) : orders.length === 0 ? (
          <div className={styles.empty}><Package size={48} strokeWidth={1.5} /><p>Заказов пока нет</p></div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => {
              const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
              return (
                <div key={order.id} className={styles.orderCard}>
                  <button className={styles.orderHeader} onClick={() => toggleExpand(order.id)}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>#{order.id}</span>
                      <span className={styles.statusBadge} style={{ background: st.color + '22', color: st.color, border: `1px solid ${st.color}44` }}>
                        {st.label}
                      </span>
                      <div className={styles.orderMeta}>
                        <span className={styles.metaItem}><User size={14} />{order.user?.username || 'N/A'}</span>
                        <span className={styles.metaItem}><Calendar size={14} />{new Date(order.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.orderTotal}>{(order.totalAmount || 0).toLocaleString('ru-RU')} ₽</span>
                      {expandedId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {expandedId === order.id && (
                    <div className={styles.orderDetails}>
                      {/* Товары */}
                      <div className={styles.detailsHeader}>
                        <span>Товар</span><span>Кол-во</span><span>Цена</span>
                      </div>
                      {order.orderItems?.map(item => (
                        <div key={item.id} className={styles.detailRow}>
                          <span className={styles.itemName}>{item.product?.name || 'Товар'}</span>
                          <span className={styles.itemQty}>{item.quantity}</span>
                          <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                        </div>
                      ))}

                      {/* Статус-управление */}
                      <div className={styles.adminControls}>
                        <div className={styles.controlSection}>
                          <p className={styles.controlLabel}>Статус заказа</p>
                          <div className={styles.statusSteps}>
                            {STATUS_ORDER.map((s, i) => {
                              const currentIdx = STATUS_ORDER.indexOf(order.status);
                              const isDone = i <= currentIdx;
                              const isCurrent = i === currentIdx;
                              return (
                                <button
                                  key={s}
                                  className={`${styles.stepBtn} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}
                                  onClick={() => handleStatusChange(order.id, s)}
                                  disabled={saving[order.id]}
                                  style={isCurrent ? { borderColor: STATUS_LABELS[s].color, color: STATUS_LABELS[s].color } : {}}
                                >
                                  {isDone && <Check size={12} />}
                                  {STATUS_LABELS[s].label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Трек-номер */}
                        <div className={styles.controlSection}>
                          <p className={styles.controlLabel}>Трек-номер</p>
                          <div className={styles.trackRow}>
                            <input
                              type="text"
                              className={styles.trackInput}
                              placeholder={order.trackingNumber || 'Например: RU123456789'}
                              value={trackInputs[order.id] ?? order.trackingNumber ?? ''}
                              onChange={e => setTrackInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                            />
                            <button
                              className={styles.trackSaveBtn}
                              onClick={() => handleTrackSave(order.id)}
                              disabled={saving[`track_${order.id}`]}
                            >
                              {saving[`track_${order.id}`] ? '...' : 'Сохранить'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={styles.detailsFooter}>
                        <span>Email: {order.user?.email || '—'}</span>
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

export default AdminOrdersPage;
