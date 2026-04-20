import prisma from '../db';

interface OrderItemInput {
  productId: number;
  quantity: number;
  price: number;
}

export async function createOrder(userId: number, items: OrderItemInput[]) {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        orderItems: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });
    return newOrder;
  });
  return order;
}

export async function getUserOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, email: true } },
      orderItems: { include: { product: true } },
    },
  });
}
