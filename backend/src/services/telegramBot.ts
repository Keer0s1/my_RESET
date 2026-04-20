import TelegramBot from 'node-telegram-bot-api';
import { HttpsProxyAgent } from 'hpagent';
import prisma from '../db';
import { Server as SocketServer } from 'socket.io';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const PROXY_URL = process.env.TELEGRAM_PROXY || '';

let bot: TelegramBot | null = null;
let io: SocketServer | null = null;

// Трекер: последний пользователь, написавший в поддержку
let lastUserId: number | null = null;

// Маппинг telegramMessageId -> userId для ответов через reply
const messageUserMap = new Map<number, number>();

export function initTelegramBot(socketIo: SocketServer) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.log('⚠️ Telegram bot: токен или chat ID не указаны, бот не запущен');
    return;
  }

  io = socketIo;

  // Настройки бота
  const botOptions: any = {
    polling: true,
  };

  // Прокси через agent
  if (PROXY_URL) {
    const agent = new HttpsProxyAgent({ proxy: PROXY_URL, rejectUnauthorized: false });
    botOptions.request = {
      agent: agent,
    };
    console.log('🔗 Telegram бот: используется прокси', PROXY_URL.replace(/:[^:]+@/, ':***@'));
  }

  try {
    bot = new TelegramBot(BOT_TOKEN, botOptions);
    console.log('🤖 Telegram бот запущен');
  } catch (err) {
    console.error('❌ Ошибка запуска Telegram бота:', err);
    return;
  }

  // /start
  bot.onText(/\/start/, (msg) => {
    bot!.sendMessage(msg.chat.id,
      '👋 *TechShop Support Bot*\n\n' +
      'Сюда приходят сообщения от пользователей магазина.\n\n' +
      '📩 Чтобы ответить — просто напишите текст (ответ уйдёт последнему пользователю)\n' +
      '↩️ Или используйте *Reply* на конкретное сообщение\n\n' +
      '📋 Команды:\n' +
      '/users — список активных чатов\n' +
      '/reply ID текст — ответить конкретному пользователю',
      { parse_mode: 'Markdown' }
    );
  });

  // /users — список пользователей с обращениями
  bot.onText(/\/users/, async (msg) => {
    try {
      const users = await prisma.user.findMany({
        where: { supportMessages: { some: {} } },
        select: {
          id: true,
          username: true,
          supportMessages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, createdAt: true, isAdmin: true },
          },
        },
      });

      if (users.length === 0) {
        bot!.sendMessage(msg.chat.id, '📭 Нет активных обращений');
        return;
      }

      let text = '📋 *Активные обращения:*\n\n';
      for (const u of users) {
        const lastMsg = u.supportMessages[0];
        const prefix = lastMsg?.isAdmin ? '👨‍💻 Вы' : '👤 Пользователь';
        const time = lastMsg ? new Date(lastMsg.createdAt).toLocaleString('ru-RU') : '';
        text += `*${u.username}* (ID: \`${u.id}\`)\n`;
        text += `└ ${prefix}: ${lastMsg?.content?.substring(0, 50) || '—'}${lastMsg?.content && lastMsg.content.length > 50 ? '...' : ''}\n`;
        text += `  ${time}\n\n`;
      }
      text += '↩️ Ответить: `/reply ID текст`';

      bot!.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
    } catch (err) {
      bot!.sendMessage(msg.chat.id, '❌ Ошибка загрузки пользователей');
    }
  });

  // /reply ID текст — ответ конкретному пользователю
  bot.onText(/\/reply\s+(\d+)\s+(.+)/s, async (msg, match) => {
    if (!match) return;
    const userId = parseInt(match[1], 10);
    const content = match[2].trim();
    await sendAdminReply(msg.chat.id, userId, content);
  });

  // Обычное текстовое сообщение (не команда)
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    if (String(msg.chat.id) !== ADMIN_CHAT_ID) return;

    // Если это reply на сообщение пользователя
    if (msg.reply_to_message && msg.reply_to_message.message_id) {
      const userId = messageUserMap.get(msg.reply_to_message.message_id);
      if (userId) {
        await sendAdminReply(msg.chat.id, userId, msg.text);
        return;
      }
    }

    // Иначе отвечаем последнему пользователю
    if (lastUserId) {
      await sendAdminReply(msg.chat.id, lastUserId, msg.text);
    } else {
      bot!.sendMessage(msg.chat.id, '⚠️ Нет активных обращений. Дождитесь сообщения от пользователя.');
    }
  });

  // Обработка ошибок polling
  bot.on('polling_error', (error: any) => {
    if (error.code === 'EFATAL') {
      console.error('❌ Telegram polling: нет доступа к API. Проверьте прокси/VPN.');
    } else {
      console.error('Telegram polling error:', error.code);
    }
  });
}

// Отправить ответ админа пользователю
async function sendAdminReply(chatId: number, userId: number, content: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      bot?.sendMessage(chatId, `❌ Пользователь ID:${userId} не найден`);
      return;
    }

    // Сохраняем в БД
    const message = await prisma.supportMessage.create({
      data: {
        content,
        userId,
        isAdmin: true,
      },
    });

    // Отправляем через Socket.io
    if (io) {
      io.to(`support_user_${userId}`).emit('support:message', message);
      io.to('support_admin').emit('support:message', { ...message, userId });
    }

    bot?.sendMessage(chatId, `✅ Ответ отправлен *${user.username}*`, { parse_mode: 'Markdown' });
  } catch (err) {
    bot?.sendMessage(chatId, '❌ Ошибка отправки ответа');
    console.error('Telegram reply error:', err);
  }
}

// Уведомить админа в Telegram о новом сообщении от пользователя
export async function notifyAdminNewMessage(userId: number, username: string, content: string) {
  if (!bot || !ADMIN_CHAT_ID) return;

  lastUserId = userId;

  try {
    const sent = await bot.sendMessage(
      ADMIN_CHAT_ID,
      `📩 *${username}* (ID: \`${userId}\`):\n\n${content}`,
      { parse_mode: 'Markdown' }
    );

    // Сохраняем маппинг для reply
    messageUserMap.set(sent.message_id, userId);

    // Чистим старые записи (оставляем последние 500)
    if (messageUserMap.size > 500) {
      const keys = Array.from(messageUserMap.keys());
      for (let i = 0; i < keys.length - 500; i++) {
        messageUserMap.delete(keys[i]);
      }
    }
  } catch (err) {
    console.error('Telegram notify error:', err);
  }
}

export function getBot() {
  return bot;
}

// Уведомить админа о новом заказе
export async function notifyAdminNewOrder(
  orderId: number,
  username: string,
  totalAmount: number,
  items: { name: string; quantity: number; price: number }[]
) {
  if (!bot || !ADMIN_CHAT_ID) return;

  try {
    let itemsText = items
      .map(i => `  • ${i.name} × ${i.quantity} — ${i.price.toLocaleString('ru-RU')} ₽`)
      .join('\n');

    const text =
      `🛒 *Новый заказ #${orderId}*\n\n` +
      `👤 Покупатель: *${username}*\n` +
      `📦 Товары:\n${itemsText}\n\n` +
      `💰 Итого: *${totalAmount.toLocaleString('ru-RU')} ₽*`;

    await bot.sendMessage(ADMIN_CHAT_ID, text, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Telegram order notify error:', err);
  }
}
