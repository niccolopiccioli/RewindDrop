import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { productSchema } from "@/lib/validations/product";
import { handleApiError } from "@/lib/api-error";
import { serializeProduct } from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const active = searchParams.get("active");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (active === "true") where.active = true;
    if (active === "false") where.active = false;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: { select: { id: true, stock: true, active: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => {
        const serialized = serializeProduct(p as Record<string, unknown>);
        const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
        return { ...serialized, totalStock };
      }),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          comparePrice: data.comparePrice ?? null,
          sku: data.sku,
          barcode: data.barcode ?? null,
          weight: data.weight ?? null,
          featured: data.featured,
          active: data.active,
          tags: data.tags,
          categoryId: data.categoryId,
          images: {
            create: data.images.map((img, i) => ({
              url: img.url,
              alt: img.alt ?? null,
              position: img.position ?? i,
            })),
          },
          variants: {
            create: data.variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              size: v.size ?? null,
              color: v.color ?? null,
              colorHex: v.colorHex || null,
              price: v.price ?? null,
              stock: v.stock,
              active: v.active,
            })),
          },
        },
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
      });
    });

    return NextResponse.json(serializeProduct(product as Record<string, unknown>), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
