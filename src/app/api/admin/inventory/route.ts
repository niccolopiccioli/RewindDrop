import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";

export async function GET() {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const threshold = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

  const variants = await prisma.variant.findMany({
    where: { active: true, stock: { lt: threshold } },
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { stock: "asc" },
    take: 50,
  });

  return NextResponse.json(variants);
}
