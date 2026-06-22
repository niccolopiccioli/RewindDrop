-- AlterTable
ALTER TABLE "Image" ADD COLUMN IF NOT EXISTS "objectFit" TEXT NOT NULL DEFAULT 'cover';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "objectFit" TEXT NOT NULL DEFAULT 'cover';

-- AlterTable
ALTER TABLE "HomeSpot" ADD COLUMN IF NOT EXISTS "objectFit" TEXT NOT NULL DEFAULT 'cover';
