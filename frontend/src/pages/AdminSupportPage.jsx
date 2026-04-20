import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io as socketIo } from 'socket.io-client';
import api from '../services/api';
import styles from './AdminSupportPage.module.css';

const AdminSupportPage = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);

  // Синхронизация ref с state для socket callback
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await api.get('/support/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    }
  };

  const fetchMessages = async (userId) => {
    if (!token) return;
    try {
      const res = await api.get(`/support/messages/user/${userId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      setError('Ошибка загрузки сообщений');
    }
  };

  // Socket.io подключение
  useEffect(() => {
    if (!user || user.role !== 'admin' || !token) return;

    fetchUsers();

    const socket = socketIo('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('support:join', { token });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Новое сообщение в реальном времени
    socket.on('support:message', (message) => {
      // Обновляем сообщения если открыт чат с этим пользователем
      const currentUser = selectedUserRef.current;
      if (currentUser && message.userId === currentUser.id) {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // Обновляем список пользователей
      fetchUsers();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectUser = (u) => {
    setSelectedUser(u);
    fetchMessages(u.id);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser) return;
    setLoading(true);
    try {
      await api.post('/support/admin/reply', {
        userId: selectedUser.id,
        content: replyText.trim(),
      });
      setReplyText('');
      // Сообщение придёт через socket
    } catch (err) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Удалить всю переписку с ${selectedUser.username}?`)) return;
    try {
      await api.delete(`/support/admin/messages/${selectedUser.id}`);
      setMessages([]);
      await fetchUsers();
    } catch (err) {
      setError('Не удалось удалить чат');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <section className={styles.page}>
        <div className="container">
          <p className={styles.denied}>Доступ запрещён</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.wrapper}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 className={styles.title} style={{ marginBottom: 0 }}>📋 Панель поддержки</h1>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: connected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: connected ? 'var(--color-success)' : 'var(--color-error)',
              fontWeight: 600,
            }}>
              {connected ? '● Live' : '● Offline'}
            </span>
          </div>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.layout}>
            {/* Users list */}
            <div className={styles.userList}>
              <div className={styles.userListHeader}>Обращения ({users.length})</div>
              <div className={styles.userItems}>
                {users.length === 0 && (
                  <div className={styles.emptyUsers}>Нет обращений</div>
                )}
                {users.map(u => (
                  <div
                    key={u.id}
                    className={`${styles.userItem} ${selectedUser?.id === u.id ? styles.userItemActive : ''}`}
                    onClick={() => selectUser(u)}
                  >
                    <div className={styles.userName}>{u.username}</div>
                    <div className={styles.userLastMsg}>
                      {u.supportMessages?.[u.supportMessages.length - 1]?.content || 'Нет сообщений'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat panel */}
            <div className={styles.chatPanel}>
              {selectedUser ? (
                <>
                  <div className={styles.chatHeader}>
                    <span className={styles.chatHeaderName}>Чат с {selectedUser.username}</span>
                    <button onClick={clearChat} className={styles.deleteBtn} title="Удалить чат">
                      🗑️
                    </button>
                  </div>
                  <div className={styles.messagesArea}>
                    {messages.length === 0 && (
                      <div className={styles.emptyChat}>Нет сообщений</div>
                    )}
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`${styles.messageRow} ${msg.isAdmin ? styles.messageRowAdmin : styles.messageRowUser}`}
                      >
                        <div className={`${styles.bubble} ${msg.isAdmin ? styles.bubbleAdmin : styles.bubbleUser}`}>
                          {msg.content}
                          <div className={styles.msgTime}>
                            {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={sendReply} className={styles.replyForm}>
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Ответ..."
                      className={styles.replyInput}
                      disabled={loading}
                      id="admin-reply-input"
                    />
                    <button
                      type="submit"
                      disabled={loading || !replyText.trim()}
                      className={styles.replyBtn}
                    >
                      {loading ? '...' : 'Отправить'}
                    </button>
                  </form>
                  <div className={styles.updateNote}>⚡ Мгновенная доставка через WebSocket</div>
                </>
              ) : (
                <div className={styles.selectPrompt}>Выберите пользователя</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminSupportPage;