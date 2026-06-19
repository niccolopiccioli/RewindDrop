import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { productUpdateSchema } from "@/lib/validations/product";
import { handleApiError } from "@/lib/api-error";
import { serializeProduct } from "@/lib/serialize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { name: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    return NextResponse.json(serializeProduct(product as Record<string, unknown>));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = productUpdateSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      const { images, variants, ...productData } = data;

      const updated = await tx.product.update({
        where: { id },
        data: productData,
      });

      if (images) {
        await tx.image.deleteMany({ where: { productId: id } });
        await tx.image.createMany({
          data: images.map((img, i) => ({
            productId: id,
            url: img.url,
            alt: img.alt ?? null,
            position: img.position ?? i,
          })),
        });
      }

      if (variants) {
        await tx.variant.deleteMany({ where: { productId: id } });
        await tx.variant.createMany({
          data: variants.map((v) => ({
            productId: id,
            name: v.name,
            sku: v.sku,
            size: v.size ?? null,
            color: v.color ?? null,
            colorHex: v.colorHex || null,
            price: v.price ?? null,
            stock: v.stock,
            active: v.active,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: updated.id },
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: { name: "asc" } },
        },
      });
    });

    return NextResponse.json(serializeProduct(product as Record<string, unknown>));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const hard = request.nextUrl.searchParams.get("hard") === "true";

  try {
    if (hard) {
      const [orderItems, cartItems] = await Promise.all([
        prisma.orderItem.count({ where: { productId: id } }),
        prisma.cartItem.count({ where: { productId: id } }),
      ]);

      if (orderItems > 0 || cartItems > 0) {
        return NextResponse.json(
          { error: "Impossibile eliminare: prodotto referenziato in ordini o carrelli" },
          { status: 409 }
        );
      }

      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: true });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, product: { id: product.id, active: false } });
  } catch (error) {
    return handleApiError(error);
  }
}
