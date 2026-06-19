import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { orderStatusUpdateSchema } from "@/lib/validations/order";
import { handleApiError } from "@/lib/api-error";
import { serializeOrder } from "@/lib/serialize";
import { sendEmail } from "@/lib/email";

const RESTORE_STATUSES = ["CANCELLED", "REFUNDED"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { slug: true } },
            variant: { select: { size: true, color: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    return NextResponse.json(serializeOrder(order as Record<string, unknown>));
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
    const parsed = orderStatusUpdateSchema.parse(body);
    const { status, notes } = parsed as { status?: string; notes?: string };

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: { select: { email: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    const shouldRestore =
      status &&
      RESTORE_STATUSES.includes(status as (typeof RESTORE_STATUSES)[number]) &&
      !RESTORE_STATUSES.includes(
        existing.status as (typeof RESTORE_STATUSES)[number]
      );

    const order = await prisma.$transaction(async (tx) => {
      if (shouldRestore) {
        for (const item of existing.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          ...(status ? { status: status as typeof existing.status } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { slug: true } },
              variant: { select: { size: true, color: true } },
            },
          },
        },
      });
    });

    if (status && existing.user.email) {
      await sendEmail({
        to: existing.user.email,
        subject: `Aggiornamento ordine ${existing.number}`,
        html: `<p>Il tuo ordine <strong>${existing.number}</strong> è ora: <strong>${status}</strong></p>`,
      });
    }

    return NextResponse.json(serializeOrder(order as Record<string, unknown>));
  } catch (error) {
    return handleApiError(error);
  }
}
