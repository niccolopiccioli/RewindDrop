import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomerApi } from "@/lib/auth-guards";
import { reviewSchema } from "@/lib/validations/account";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId: product.id, approved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  }

  try {
    const data = reviewSchema.parse(await request.json());

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: product.id,
        },
      },
      create: {
        ...data,
        userId: session.user.id,
        productId: product.id,
        approved: false,
      },
      update: { ...data, approved: false },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }
}
