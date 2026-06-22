import { prisma } from "../src/lib/prisma";
import { getProductImageUrl, type CategoryImageKey } from "../src/lib/mock-images";
import { normalizeHex } from "../src/lib/colors";

async function main() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { position: "asc" } },
      variants: {
        where: { active: true },
        select: { color: true, colorHex: true },
      },
      category: { select: { slug: true } },
    },
  });

  let updated = 0;

  for (const product of products) {
    const seen = new Set<string>();
    const colors: { name: string; hex: string }[] = [];

    for (const variant of product.variants) {
      const hex = normalizeHex(variant.colorHex || "");
      if (!hex || seen.has(hex)) continue;
      seen.add(hex);
      colors.push({ name: variant.color || hex, hex });
    }

    if (colors.length <= 1) {
      const only = colors[0];
      if (only && product.images[0] && !product.images[0].colorHex) {
        await prisma.image.update({
          where: { id: product.images[0].id },
          data: { colorHex: only.hex, alt: `${product.name} ${only.name}` },
        });
        updated++;
      }
      continue;
    }

    const category = product.category.slug as CategoryImageKey;
    const linked = new Set(
      product.images
        .map((image) => normalizeHex(image.colorHex || ""))
        .filter(Boolean)
    );

    const missing = colors.filter((color) => !linked.has(color.hex));
    if (missing.length === 0 && product.images.length >= colors.length) continue;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const existing = product.images.find(
          (image) => normalizeHex(image.colorHex || "") === color.hex
        );

        if (existing) {
          await tx.image.update({
            where: { id: existing.id },
            data: {
              position: i,
              alt: `${product.name} ${color.name}`,
              colorHex: color.hex,
            },
          });
          continue;
        }

        await tx.image.create({
          data: {
            productId: product.id,
            url: getProductImageUrl(category, i + product.images.length),
            alt: `${product.name} ${color.name}`,
            position: i,
            colorHex: color.hex,
          },
        });
      }
    });

    updated++;
  }

  console.log(`Backfilled color images for ${updated} products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
