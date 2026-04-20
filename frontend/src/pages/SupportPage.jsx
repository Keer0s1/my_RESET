import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io as socketIo } from 'socket.io-client';
import api from '../services/api';
import { ArrowUp, Headset } from 'lucide-react';
import styles from './SupportPage.module.css';

const SupportPage = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const socketRef = useRef(null);

  // Загрузка истории сообщений
  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await api.get('/support/messages');
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Socket.io подключение
  useEffect(() => {
    if (!user || !token) return;

    fetchMessages();

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

    // Получение нового сообщения в реальном времени
    socket.on('support:message', (message) => {
      setMessages(prev => {
        // Не дублируем
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  // Автоскролл — только внутри контейнера чата, не двигаем всю страницу
  useEffect(() => {
    const area = messagesAreaRef.current;
    if (area) {
      area.scrollTop = area.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/support/messages', { content: input.trim() });
      setInput('');
      // Сообщение придёт через Socket.io, но на всякий случай перезагрузим
    } catch (err) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className={styles.page}>
        <div className="container">
          <p className={styles.loginMsg}>Войдите в аккаунт для доступа к поддержке</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.card}>
            {/* Apple style header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>
                  <Headset size={20} />
                </div>
                <div className={styles.headerText}>
                  <span className={styles.title}>Поддержка ReSet</span>
                  <span className={styles.status}>
                    <span 
                      className={styles.statusDot} 
                      style={{ background: connected ? 'var(--color-success)' : 'var(--color-error)' }} 
                    />
                    {connected ? 'В сети' : 'Не в сети'}
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className={styles.messagesArea} ref={messagesAreaRef}>
              {messages.length === 0 && (
                <div className={styles.emptyMessages}>Напишите нам, мы ответим в течение нескольких минут.</div>
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

            {/* Input Form */}
            <form onSubmit={sendMessage} className={styles.sendForm}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Сообщение..."
                  className={styles.sendInput}
                  disabled={loading}
                  id="support-message-input"
                  autoComplete="off"
                />
              </div>
              <button type="submit" disabled={loading || !input.trim()} className={styles.sendBtn} title="Отправить">
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportPage;