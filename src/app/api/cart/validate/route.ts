import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/api-error";
import { getUnavailableVariantIds } from "@/lib/cart-availability";

const validateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
      })
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = validateSchema.parse(body);
    const unavailableVariantIds = await getUnavailableVariantIds(items);

    return NextResponse.json({ unavailableVariantIds });
  } catch (error) {
    return handleApiError(error);
  }
}
