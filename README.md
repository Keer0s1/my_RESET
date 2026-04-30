# ReSet — Premium Electronics Store

Современное веб-приложение интернет-магазина электроники с премиальным дизайном в стиле Apple.
Full-Stack проект: React + Node.js + Express + PostgreSQL.

---

## 🛠 Технологии

### Frontend
- **React 19** — функциональные компоненты, хуки, Context API
- **CSS Modules** — модульные стили, glassmorphism, анимации
- **React Router v7** — клиентская маршрутизация
- **Axios** — HTTP-запросы к REST API
- **Lucide React** — иконки
- **Vite** — сборка и dev-сервер

### Backend
- **Node.js + Express 5** — REST API
- **PostgreSQL + Prisma ORM** — база данных
- **JWT + bcrypt** — авторизация и хеширование паролей
- **Socket.io** — чат поддержки в реальном времени (WebSocket)
- **Telegram Bot API** — уведомления о заказах и поддержка

---

## ⚡ Функционал

### Пользователь
- ✅ Каталог товаров с поиском, фильтрацией и сортировкой
- ✅ Детальная страница товара
- ✅ Корзина (добавление, удаление, изменение количества)
- ✅ Оформление заказа
- ✅ Избранное (❤️ wishlist с анимацией)
- ✅ Чат с поддержкой (реалтайм через WebSocket)
- ✅ Регистрация и авторизация (JWT)
- ✅ Тёмная / светлая тема

### Админ
- ✅ Панель управления заказами (`/admin/orders`)
- ✅ Чат поддержки с пользователями (`/admin/support`)
- ✅ Telegram-уведомления о новых заказах
- ✅ Ответы пользователям через Telegram-бота

### UI/UX
- ✅ Премиальный дизайн (Apple-style)
- ✅ Glassmorphism, градиенты, micro-анимации
- ✅ Адаптивная вёрстка (Desktop / Tablet / Mobile)
- ✅ Страница «О нас» с философией бренда

---

## 📁 Структура проекта

```
shop-main/
├── backend/
│   ├── prisma/              # Схема БД и миграции
│   ├── src/
│   │   ├── api/             # REST маршруты (auth, products, orders, favorites, support)
│   │   ├── services/        # Бизнес-логика, Telegram-бот
│   │   ├── middleware/      # JWT аутентификация
│   │   ├── chat/            # WebSocket обработчики
│   │   └── server.ts        # Точка входа
│   └── .env                 # Переменные окружения (не в git!)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI компоненты (Header, Footer, ProductCard, ...)
│   │   ├── pages/           # Страницы приложения
│   │   ├── context/         # React Context (Auth, Cart, Theme, Favorites)
│   │   ├── hooks/           # Кастомные хуки
│   │   ├── services/        # API-сервисы
│   │   └── assets/          # Изображения товаров
│   └── index.html
│
├── .gitignore
└── README.md
```

---

## 🚀 Установка и запуск

### Требования
- Node.js 20+
- PostgreSQL

### 1. Клонирование
```bash
git clone https://github.com/Keer0s1/my_RESET.git
cd my_RESET
```

### 2. Backend
```bash
cd backend
npm install
```

Создайте файл `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my-shop?schema=public"
JWT_SECRET="your-secret-key"
PORT=3000
```

Настройка БД:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Запуск:
```bash
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173



## 📝 Лицензия

Учебный проект.