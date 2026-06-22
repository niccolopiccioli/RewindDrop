-- AlterTable
ALTER TABLE "Image" ADD COLUMN "colorHex" TEXT;

-- CreateIndex
CREATE INDEX "Image_colorHex_idx" ON "Image"("colorHex");
