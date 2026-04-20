import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './api/auth';
import productsRouter from './api/products';
import ordersRouter from './api/orders';
import supportRouter, { setSupportIO } from './api/support';
import favoritesRouter from './api/favorites';
import { registerChatHandlers } from './chat/chatSocket';
import { registerSupportHandlers } from './services/supportSocket';
import { initTelegramBot } from './services/telegramBot';

const app = express();

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/support', supportRouter);
app.use('/api/favorites', favoritesRouter);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

// Передаём io в support API для emit
setSupportIO(io);

// Socket.io обработчики
registerChatHandlers(io);
registerSupportHandlers(io);

// Telegram бот
initTelegramBot(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});