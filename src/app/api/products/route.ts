import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const sale = searchParams.get("sale");
  const gender = searchParams.get("gender");
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || searchParams.get("q");
  const sizesParam = searchParams.get("sizes");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const where: Record<string, unknown> = {
      active: true,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (sale === "true") {
      where.comparePrice = { not: null };
    }

    if (gender === "men" || gender === "women") {
      where.tags = { has: gender };
    }

    if (sizesParam) {
      const sizes = sizesParam.split(",").filter(Boolean);
      if (sizes.length > 0) {
        where.variants = {
          some: {
            active: true,
            size: { in: sizes },
            stock: { gt: 0 },
          },
        };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { position: "asc" },
            take: 1,
          },
          variants: {
            where: { active: true },
            select: {
              size: true,
              color: true,
              colorHex: true,
              stock: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => serializeProduct(p)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
