import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomerApi } from "@/lib/auth-guards";
import { serializeProduct } from "@/lib/serialize";

export async function GET() {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    items.map((w) => serializeProduct(w.product))
  );
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "productId richiesto" }, { status: 400 });
  }

  await prisma.wishlist.upsert({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
    create: { userId: session.user.id, productId },
    update: {},
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId richiesto" }, { status: 400 });
  }

  await prisma.wishlist.deleteMany({
    where: { userId: session.user.id, productId },
  });

  return NextResponse.json({ success: true });
}
