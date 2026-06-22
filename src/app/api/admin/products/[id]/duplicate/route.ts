import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";
import { serializeProduct } from "@/lib/serialize";
import {
  generateProductSku,
  generateUniqueSlug,
  generateVariantSku,
} from "@/lib/sku";

async function findAvailableSlug(baseSlug: string): Promise<string> {
  let attempt = 1;
  let candidate = generateUniqueSlug(baseSlug, attempt);

  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = generateUniqueSlug(baseSlug, attempt);
  }

  return candidate;
}

async function findAvailableProductSku(
  categorySlug: string,
  productName: string
): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const candidate = generateProductSku({
      categorySlug,
      productName,
      sequence: Math.floor(Math.random() * 900) + 100,
    });
    const existing = await prisma.product.findUnique({ where: { sku: candidate } });
    if (!existing) return candidate;
  }

  return generateProductSku({
    categorySlug,
    productName,
    sequence: Date.now() % 1000,
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const source = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { slug: true } },
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { name: "asc" } },
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    const newSlug = await findAvailableSlug(source.slug);
    const newSku = await findAvailableProductSku(
      source.category.slug,
      `${source.name} Copy`
    );

    const variantSkus = new Set<string>();
    const variantData = source.variants.map((v, index) => {
      let variantSku = generateVariantSku({
        baseSku: newSku,
        size: v.size || v.name || "UNI",
        color: v.color,
      });

      while (variantSkus.has(variantSku)) {
        variantSku = `${variantSku}-${index + 1}`;
      }
      variantSkus.add(variantSku);

      return {
        name: v.name,
        sku: variantSku,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        price: v.price,
        stock: v.stock,
        active: v.active,
      };
    });

    const duplicate = await prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          name: `${source.name} (copia)`,
          slug: newSlug,
          description: source.description,
          price: source.price,
          comparePrice: source.comparePrice,
          sku: newSku,
          barcode: null,
          weight: source.weight,
          featured: false,
          active: false,
          tags: source.tags,
          categoryId: source.categoryId,
          images: {
            create: source.images.map((img, i) => ({
              url: img.url,
              alt: img.alt,
              objectFit: img.objectFit ?? "cover",
              colorHex: img.colorHex,
              position: img.position ?? i,
            })),
          },
          variants: {
            create: variantData,
          },
        },
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: { name: "asc" } },
        },
      });
    });

    return NextResponse.json(
      {
        ...serializeProduct(duplicate as Record<string, unknown>),
        redirectUrl: `/admin/prodotti/${duplicate.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
