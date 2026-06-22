-- AlterTable
ALTER TABLE "Category" ADD COLUMN "bannerSubtitle" TEXT;

-- CreateTable
CREATE TABLE "HomeSpot" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "href" TEXT NOT NULL DEFAULT '/prodotti',
    "image" TEXT,
    "imageAlt" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSpot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeSpot_key_key" ON "HomeSpot"("key");
