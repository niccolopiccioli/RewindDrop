import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await prisma.product.findFirst({
      where: { slug, active: true },
      include: {
        images: {
          orderBy: { position: "asc" },
        },
        variants: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        reviews: {
          where: { approved: true },
          select: {
            rating: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeProduct(product));
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
