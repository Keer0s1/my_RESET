import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../db';

const router = express.Router();

// GET /api/favorites — получить избранное текущего пользователя
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites.map(f => f.product));
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/favorites/ids — получить только ID избранных товаров
router.get('/ids', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      select: { productId: true },
    });
    res.json(favorites.map(f => f.productId));
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/favorites/:productId — добавить в избранное
router.post('/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Неверный ID товара' });
    }

    await prisma.favorite.create({
      data: {
        userId: req.user!.id,
        productId,
      },
    });
    res.status(201).json({ success: true });
  } catch (error: any) {
    // Уже в избранном (unique constraint)
    if (error.code === 'P2002') {
      return res.status(200).json({ success: true, message: 'Уже в избранном' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/favorites/:productId — удалить из избранного
router.delete('/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Неверный ID товара' });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user!.id,
        productId,
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
