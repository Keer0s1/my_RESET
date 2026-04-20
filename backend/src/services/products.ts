import prisma from '../db';
import { Prisma } from '../generated/prisma';

interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export async function getAllProducts(filters: ProductFilters = {}) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.category && filters.category !== 'all') {
    where.category = filters.category;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  switch (filters.sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'name_desc':
      orderBy = { name: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    default:
      orderBy = { id: 'asc' };
  }

  return prisma.product.findMany({ where, orderBy });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({ where: { id } });
}

export async function getCategories() {
  const products = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  return products.map(p => p.category);
}

export async function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: number, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({ where: { id } });
}