import React, { useState, useRef, useEffect } from 'react';
import { useChatSocket } from '../chat/useChatSocket';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const messagesEndRef = useRef(null);

  const backendUrl = 'http://localhost:3000';
  const room = 'support';

  const { status, error, messages, connect, disconnect, sendMessage } = useChatSocket(backendUrl);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen && status === 'connected') {
      disconnect();
    }
  }, [isOpen, status, disconnect]);

  useEffect(() => {
    if (isOpen && !userNickname) {
      setShowNamePrompt(true);
    } else if (isOpen && userNickname && !showNamePrompt && status === 'disconnected') {
      
    }
  }, [isOpen, userNickname, status, showNamePrompt]);

  const handleJoin = (e) => {
    e.preventDefault();
    const trimmed = userNickname.trim();
    if (!trimmed) return;
    console.log('Подключаемся с ником:', trimmed);
    connect({ room, nickname: trimmed });
    setShowNamePrompt(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || status !== 'connected') return;
    sendMessage(input.trim());
    setInput('');
  };

  const isConnected = status === 'connected';

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition z-50 text-lg border border-gray-700"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-5 w-72 bg-white rounded-lg shadow-lg border border-gray-400 z-50 flex flex-col">
          <div className="bg-blue-600 text-white p-2 rounded-t-lg flex justify-between items-center text-sm border-b border-gray-300">
            <span>Техподдержка</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">✕</button>
          </div>

          {showNamePrompt ? (
            <form onSubmit={handleJoin} className="p-3">
              <p className="text-sm mb-2">Введите ваше имя:</p>
              <input
                type="text"
                value={userNickname}
                onChange={e => setUserNickname(e.target.value)}
                className="w-full border border-gray-400 rounded-full px-3 py-1 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button type="submit" className="bg-blue-600 text-white text-sm rounded-full px-3 py-1 w-full">
                Начать чат
              </button>
            </form>
          ) : (
            <>
              <div className="h-80 overflow-y-auto p-2 flex flex-col space-y-1.5 text-sm">
                {messages.length === 0 && (
                  <div className="text-gray-400 text-center text-xs mt-4">Нет сообщений. Напишите что-нибудь.</div>
                )}
                {messages.map((msg) => {
                  const isSystem = msg.kind === 'system';
                  const isMine = !isSystem && msg.author === userNickname;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-2 py-1 rounded-lg ${
                          isMine
                            ? 'bg-blue-600 text-white'
                            : isSystem
                            ? 'bg-gray-200 text-gray-600 italic'
                            : 'bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {!isSystem && !isMine && (
                          <div className="text-xs font-bold mb-1">{msg.author}</div>
                        )}
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {status === 'connecting' && <div className="text-gray-400 text-xs">Подключение...</div>}
                {error && <div className="text-red-500 text-xs text-center">Ошибка: {error}</div>}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="border-t border-gray-300 p-2 flex gap-1 items-center bg-white">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Напишите..."
                  disabled={!isConnected}
                  className="flex-1 border border-gray-400 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !input.trim()}
                  className="bg-blue-600 text-white text-sm rounded-full px-3 py-1 hover:bg-blue-700 transition disabled:opacity-50 border border-gray-700"
                >
                  Отпр.
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;