import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";
import { clearProductCartItems } from "@/lib/cart-availability";

const bulkVisibilitySchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Seleziona almeno un prodotto"),
  action: z.enum(["hide", "show"]),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { ids, action } = bulkVisibilitySchema.parse(body);

    const targetActive = action === "show";
    const requiredCurrent = action === "hide";

    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids },
        active: requiredCurrent,
      },
      data: { active: targetActive },
    });

    if (action === "hide" && result.count > 0) {
      const hidden = await prisma.product.findMany({
        where: { id: { in: ids }, active: false },
        select: { id: true },
      });
      await clearProductCartItems(hidden.map((product) => product.id));
    }

    return NextResponse.json({
      updated: result.count,
      skipped: ids.length - result.count,
      action,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
