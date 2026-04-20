import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser } from "../services/users";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

const router = express.Router();

router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Отсутствуют обязательные поля" });
    }
    const newUser = await createUser(username, email, password);
    return res.status(201).json({ user: newUser });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) return res.status(409).json({ error: "Email уже используется" });
      if (target?.includes('username')) return res.status(409).json({ error: "Имя пользователя уже занято" });
    }
    console.error(error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

router.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role   
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Выход выполнен" });
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, email: true, role: true } 
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;