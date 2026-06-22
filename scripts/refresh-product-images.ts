import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  getProductImageUrl,
  type CategoryImageKey,
} from "../src/lib/mock-images";

const CATEGORY_SLUGS = new Set([
  "t-shirts",
  "felpe",
  "pantaloni",
  "cappelli",
  "borse",
  "giacche",
]);

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { position: "asc" } } },
    orderBy: [{ categoryId: "asc" }, { createdAt: "asc" }],
  });

  const counters: Record<string, number> = {};

  for (const product of products) {
    const slug = product.category.slug;
    if (!CATEGORY_SLUGS.has(slug)) continue;

    const index = counters[slug] ?? 0;
    counters[slug] = index + 1;

    const url = getProductImageUrl(slug as CategoryImageKey, index);
    const primary = product.images[0];

    if (primary) {
      await prisma.image.update({
        where: { id: primary.id },
        data: { url, alt: product.name },
      });
    } else {
      await prisma.image.create({
        data: {
          productId: product.id,
          url,
          alt: product.name,
          position: 0,
        },
      });
    }

    console.log(`Updated: ${product.name}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
