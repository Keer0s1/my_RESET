import prisma from '../src/db';
import bcrypt from 'bcrypt';

async function main() {
  // Очистка
  await prisma.supportMessage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Пользователи
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  await prisma.user.create({
    data: { username: 'admin', email: 'admin@shop.ru', password: adminPass, role: 'admin' },
  });

  await prisma.user.create({
    data: { username: 'user', email: 'user@shop.ru', password: userPass, role: 'user' },
  });

  // Продукты — 12 штук
  const products = [
    {
      name: 'iPhone 17 Pro Max',
      description: '6.9" OLED, чип A19 Pro, 256 ГБ, тройная камера 48 Мп, USB-C, защита IP68, титановый корпус',
      price: 149990,
      image: '/smartphone.jpg',
      category: 'smartphones',
      stock: 15,
    },
    {
      name: 'MacBook Pro M5',
      description: 'Apple M5 Pro, 18 ГБ RAM, SSD 512 ГБ, Liquid Retina XDR 14.2", до 22 часов работы',
      price: 249990,
      image: '/laptop.jpg',
      category: 'laptops',
      stock: 8,
    },
    {
      name: 'AirPods Max',
      description: 'Полноразмерные наушники, Active Noise Cancelling, Spatial Audio, USB-C, до 30 часов работы',
      price: 59990,
      image: '/headphones.jpg',
      category: 'accessories',
      stock: 20,
    },
    {
      name: 'Apple Watch Ultra 3',
      description: 'Титановый корпус 49 мм, GPS + Cellular, дайвинг до 40 м, двухчастотный GPS, S10 чип',
      price: 89990,
      image: '/smartwatch.jpg',
      category: 'accessories',
      stock: 10,
    },
    {
      name: 'iPad Pro M5',
      description: 'Чип M5, 13" Liquid Retina XDR, 256 ГБ, Thunderbolt, Face ID, поддержка Apple Pencil Pro',
      price: 129990,
      image: '/tablet.jpg',
      category: 'tablets',
      stock: 12,
    },
    {
      name: 'Nintendo Switch 2',
      description: '8" LCD экран, Joy-Con с магнитным креплением, обратная совместимость, 64 ГБ памяти',
      price: 44990,
      image: '/console.jpg',
      category: 'gaming',
      stock: 25,
    },
    {
      name: 'iPhone 17 Pro',
      description: '6.3" OLED, чип A19 Pro, 128 ГБ, камера 48 Мп, Dynamic Island, USB-C, керамический щит',
      price: 119990,
      image: '/smartphone.jpg',
      category: 'smartphones',
      stock: 18,
    },
    {
      name: 'MacBook Air 13 M4',
      description: 'Apple M4, 16 ГБ RAM, SSD 256 ГБ, Liquid Retina 13.6", бесшумный, до 18 часов работы',
      price: 129990,
      image: '/laptop.jpg',
      category: 'laptops',
      stock: 14,
    },
    {
      name: 'AirPods Pro 3',
      description: 'Активное шумоподавление, адаптивный звук, USB-C, защита IP54, до 6 часов прослушивания',
      price: 24990,
      image: '/airpods_pro.png',
      category: 'accessories',
      stock: 30,
    },
    {
      name: 'Steam Deck OLED',
      description: '7.4" HDR OLED, AMD APU, 512 ГБ NVMe SSD, Wi-Fi 6E, до 12 часов автономности',
      price: 54990,
      image: '/steamdeck.png',
      category: 'gaming',
      stock: 10,
    },
    {
      name: 'iPad Air M3',
      description: 'Чип M3, 11" Liquid Retina, 128 ГБ, Touch ID, поддержка Apple Pencil Pro и Magic Keyboard',
      price: 69990,
      image: '/tablet.jpg',
      category: 'tablets',
      stock: 16,
    },
    {
      name: 'Apple Watch SE 3',
      description: 'Алюминиевый корпус 44 мм, GPS, S9 чип, отслеживание здоровья, обнаружение ДТП',
      price: 29990,
      image: '/smartwatch.jpg',
      category: 'accessories',
      stock: 22,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Seed completed: 2 users + 12 products');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });