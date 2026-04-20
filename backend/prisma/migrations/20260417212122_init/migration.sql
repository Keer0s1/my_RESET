-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'other',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
