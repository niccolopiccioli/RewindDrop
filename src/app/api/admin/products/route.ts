import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { productSchema } from "@/lib/validations/product";
import { handleApiError } from "@/lib/api-error";
import { serializeProduct } from "@/lib/serialize";

const VALID_SORTS = ["sku", "category", "price", "stock", "active", "createdAt"] as const;
type SortField = (typeof VALID_SORTS)[number];

function buildOrderBy(
  sort: SortField,
  order: "asc" | "desc"
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "sku":
      return { sku: order };
    case "category":
      return { category: { name: order } };
    case "price":
      return { price: order };
    case "active":
      return { active: order };
    case "createdAt":
    default:
      return { createdAt: order };
  }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const active = searchParams.get("active");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sortParam = searchParams.get("sort") || "createdAt";
  const orderParam = searchParams.get("order") === "asc" ? "asc" : "desc";
  const sort = VALID_SORTS.includes(sortParam as SortField)
    ? (sortParam as SortField)
    : "createdAt";

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

    const include = {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: "asc" as const }, take: 1 },
      variants: { select: { id: true, stock: true, active: true } },
    };

    if (sort === "stock") {
      const [allProducts, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include,
        }),
        prisma.product.count({ where }),
      ]);

      const sorted = allProducts
        .map((p) => ({
          product: p,
          totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
        }))
        .sort((a, b) =>
          orderParam === "asc"
            ? a.totalStock - b.totalStock
            : b.totalStock - a.totalStock
        );

      const paginated = sorted.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        products: paginated.map(({ product, totalStock }) => ({
          ...serializeProduct(product as Record<string, unknown>),
          totalStock,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include,
        orderBy: buildOrderBy(sort, orderParam),
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
              objectFit: img.objectFit ?? "cover",
              colorHex: img.colorHex || null,
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
