import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
          variant: true,
        },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
            variant: true,
          },
        },
      },
    });
  }
  return cart;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const cart = await getOrCreateCart(session.user.id);
  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name: item.product.name,
    slug: item.product.slug,
    image: item.product.images[0]?.url ?? "",
    size: item.variant.size,
    color: item.variant.color,
    colorHex: item.variant.colorHex,
    price: Number(item.price),
    quantity: item.quantity,
    stock: item.variant.stock,
  }));

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login richiesto" }, { status: 401 });
  }

  const body = await request.json();
  const { items } = body as {
    items: { variantId: string; quantity: number; productId: string; price: number }[];
  };

  const cart = await getOrCreateCart(session.user.id);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  if (items?.length) {
    await prisma.cartItem.createMany({
      data: items.map((item) => ({
        cartId: cart.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
