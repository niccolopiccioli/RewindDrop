import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomerApi } from "@/lib/auth-guards";
import { serializeOrder } from "@/lib/serialize";

export async function GET() {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map((o) => serializeOrder(o)));
}
