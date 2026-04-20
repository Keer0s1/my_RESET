import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../db';

export function registerSupportHandlers(io: SocketServer) {
  io.on('connection', (socket: Socket) => {
    // Пользователь подключается к своей комнате поддержки
    socket.on('support:join', async (data: { token: string }) => {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET!) as { id: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        
        if (!user) return;

        if (user.role === 'admin') {
          socket.join('support_admin');
          console.log(`🔧 Admin ${user.username} joined support_admin`);
        } else {
          socket.join(`support_user_${user.id}`);
          console.log(`👤 User ${user.username} joined support_user_${user.id}`);
        }
      } catch (err) {
        console.error('Support join error:', err);
      }
    });

    // Подсчёт непрочитанных сообщений
    socket.on('support:unread', async (data: { token: string }) => {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET!) as { id: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user || user.role !== 'admin') return;

        const count = await prisma.supportMessage.count({
          where: { isAdmin: false },
        });
        socket.emit('support:unreadCount', count);
      } catch (err) {
        // ignore
      }
    });
  });
}
