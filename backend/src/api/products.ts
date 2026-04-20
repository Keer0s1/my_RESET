import express, { Request, Response } from 'express';
import * as productService from '../services/products';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/products — с фильтрацией, поиском, сортировкой
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, sort, minPrice, maxPrice } = req.query;
    const products = await productService.getAllProducts({
      search: search as string,
      category: category as string,
      sort: sort as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/products/categories — список категорий
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await productService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/products/:id — один товар
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/products — создать товар (auth)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Не хватает полей' });
    }
    const newProduct = await productService.createProduct({ name, description, price, image, category, stock });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/products/:id — обновить товар (auth)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    const updated = await productService.updateProduct(id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/products/:id — удалить товар (auth)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;