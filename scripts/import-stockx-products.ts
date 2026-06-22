import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getProductImageUrl } from "../src/lib/mock-images";
import { buildMockVariants } from "../src/lib/mock-products";
import {
  buildStockxImages,
  STOCKX_PRODUCTS,
} from "../src/lib/stockx-products";
import {
  stockxGalleryImage,
  stockxImageExists,
  stockxProductImage,
} from "../src/lib/stockx-images";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function resolvePrimaryImage(
  stockxSlug: string,
  category: string,
  index: number
) {
  const primary = stockxProductImage(stockxSlug);
  if (await stockxImageExists(primary)) return primary;

  const gallery = stockxGalleryImage(stockxSlug, "01");
  if (await stockxImageExists(gallery)) return gallery;

  const poolCategory =
    category === "sneakers" ||
    category === "t-shirts" ||
    category === "felpe" ||
    category === "pantaloni" ||
    category === "giacche" ||
    category === "cappelli" ||
    category === "borse"
      ? category
      : "sneakers";

  return getProductImageUrl(
    poolCategory as Parameters<typeof getProductImageUrl>[0],
    index
  );
}

async function main() {
  let category = await prisma.category.findUnique({ where: { slug: "sneakers" } });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Sneakers",
        slug: "sneakers",
        description: "Sneaker, slide e calzature streetwear",
        image: getProductImageUrl("sneakers", 0),
        imageAlt: "Sneakers",
      },
    });
    console.log("Created sneakers category");
  }

  const categoryIds = Object.fromEntries(
    (await prisma.category.findMany({ select: { slug: true, id: true } })).map(
      (row) => [row.slug, row.id]
    )
  );

  let created = 0;
  let updated = 0;

  for (const [index, product] of STOCKX_PRODUCTS.entries()) {
    const categoryId = categoryIds[product.category];
    if (!categoryId) {
      console.warn(`Skip ${product.slug}: missing category ${product.category}`);
      continue;
    }

    const primaryImage = await resolvePrimaryImage(
      product.stockxSlug,
      product.category,
      index
    );

    const images = buildStockxImages({ ...product, image: primaryImage });
    const variants = buildMockVariants(product);

    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.image.deleteMany({ where: { productId: existing.id } }),
        prisma.variant.deleteMany({ where: { productId: existing.id } }),
        prisma.product.update({
          where: { id: existing.id },
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice ?? null,
            sku: product.sku,
            featured: product.featured ?? false,
            active: true,
            tags: product.tags,
            categoryId,
            images: { create: images },
            variants: { create: variants },
          },
        }),
      ]);
      updated++;
      continue;
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice ?? null,
        sku: product.sku,
        featured: product.featured ?? false,
        active: true,
        tags: product.tags,
        categoryId,
        images: { create: images },
        variants: { create: variants },
      },
    });
    created++;
  }

  console.log(`StockX import done: ${created} created, ${updated} updated`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
