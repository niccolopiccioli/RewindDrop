import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { stockUpdateSchema } from "@/lib/validations/product";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id, variantId } = await params;

  try {
    const body = await request.json();
    const data = stockUpdateSchema.parse(body);

    const variant = await prisma.variant.findUnique({
      where: { id: variantId, productId: id },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variante non trovata" }, { status: 404 });
    }

    let newStock: number;
    switch (data.operation) {
      case "set":
        newStock = data.value;
        break;
      case "increment":
        newStock = variant.stock + data.value;
        break;
      case "decrement":
        newStock = Math.max(0, variant.stock - data.value);
        break;
    }

    const updated = await prisma.variant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
