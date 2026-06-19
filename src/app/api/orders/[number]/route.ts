import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serialize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const email = request.nextUrl.searchParams.get("email");

  const order = await prisma.order.findUnique({
    where: { number },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
  }

  if (email && order.user.email !== email) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  return NextResponse.json(serializeOrder(order));
}
