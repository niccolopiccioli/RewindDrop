import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";

function buildWhere(search: string | null, category: string | null, active: string | null) {
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

  return where;
}

/** Elenco leggero id + active per selezione multipla admin */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const active = searchParams.get("active");

  try {
    const where = buildWhere(search, category, active);

    const products = await prisma.product.findMany({
      where,
      select: { id: true, active: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      products,
      total: products.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
