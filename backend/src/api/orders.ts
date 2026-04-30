import express, { Request, Response } from 'express';
import * as orderService from '../services/orders';
import { authenticate, AuthRequest } from '../middleware/auth';
import { notifyAdminNewOrder } from '../services/telegramBot';
import prisma from '../db';

const router = express.Router();


router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body; 
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }
    const order = await orderService.createOrder(req.user!.id, items);

    // Уведомление админу в Telegram
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (user && order.orderItems) {
        const tgItems = order.orderItems.map((oi: any) => ({
          name: oi.product?.name || 'Товар',
          quantity: oi.quantity,
          price: oi.price * oi.quantity,
        }));
        await notifyAdminNewOrder(order.id, user.username, order.totalAmount || 0, tgItems);
      }
    } catch (tgErr) {
      console.error('Telegram notification error:', tgErr);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await orderService.getUserOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/orders/all — все заказы (только для админа)
router.get('/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== 'string') {
      return res.status(400).json({ error: 'ID должен быть строкой' });
    }
    if (!idParam) {
      return res.status(400).json({ error: 'ID не указан' });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    const order = await orderService.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    // Админ видит любой заказ, пользователь — только свой
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (requestingUser?.role !== 'admin' && order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/orders/:id/status — обновить статус и трек-номер (только админ)
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Неверный ID' });

    const { status, trackingNumber } = req.body;

    const validStatuses = ['pending', 'confirmed', 'assembling', 'shipped', 'delivered'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        orderItems: { include: { product: true } },
      },
    });

    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;