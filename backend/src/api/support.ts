import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../db';
import { notifyAdminNewMessage } from '../services/telegramBot';

const router = express.Router();

// Хранилище io — будет установлено из server.ts
let io: any = null;
export function setSupportIO(socketIo: any) {
  io = socketIo;
}

// Получить свои сообщения (пользователь)
router.get('/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отправить сообщение (пользователь)
router.post('/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    const message = await prisma.supportMessage.create({
      data: {
        content: content.trim(),
        userId,
        isAdmin: false,
      },
    });

    // Получаем имя пользователя
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Socket.io — мгновенная доставка
    if (io) {
      io.to('support_admin').emit('support:message', { ...message, userId });
      io.to(`support_user_${userId}`).emit('support:message', message);
    }

    // Telegram — уведомление админу
    if (user) {
      notifyAdminNewMessage(userId, user.username, content.trim());
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ADMIN ==========

// Список пользователей с обращениями
router.get('/admin/users', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const usersWithMessages = await prisma.user.findMany({
      where: { supportMessages: { some: {} } },
      select: {
        id: true,
        username: true,
        supportMessages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });
    res.json(usersWithMessages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Ответ админа
router.post('/admin/reply', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  try {
    const { userId, content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    const message = await prisma.supportMessage.create({
      data: {
        content: content.trim(),
        userId,
        isAdmin: true,
      },
    });

    // Socket.io — мгновенная доставка пользователю
    if (io) {
      io.to(`support_user_${userId}`).emit('support:message', message);
      io.to('support_admin').emit('support:message', { ...message, userId });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Сообщения конкретного пользователя (для админа)
router.get('/messages/user/:userId', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const userId = parseInt(String(req.params.userId), 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Некорректный ID пользователя' });
  }
  try {
    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить переписку (админ)
router.delete('/admin/messages/:userId', authenticate, async (req: AuthRequest, res) => {
  const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const userId = parseInt(String(req.params.userId), 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Некорректный ID пользователя' });
  }
  try {
    await prisma.supportMessage.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;