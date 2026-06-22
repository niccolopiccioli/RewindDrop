import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";
import { hardDeleteProducts } from "@/lib/product-delete";

const bulkDeleteSchema = z
  .object({
    ids: z.array(z.string().min(1)).optional(),
    all: z.boolean().optional(),
  })
  .refine((data) => data.all === true || (data.ids?.length ?? 0) > 0, {
    message: "Specifica ids o all: true",
  });

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { ids, all } = bulkDeleteSchema.parse(body);

    const where: Prisma.ProductWhereInput = all ? {} : { id: { in: ids! } };
    const { deleted } = await hardDeleteProducts(where);

    return NextResponse.json({ deleted, skipped: 0 });
  } catch (error) {
    return handleApiError(error);
  }
}
