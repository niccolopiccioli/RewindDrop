import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isOnlinePaymentMethod } from "@/lib/payments";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";

const schema = z.object({
  orderId: z.string(),
});

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Non disponibile" }, { status: 403 });
  }

  try {
    const { orderId } = schema.parse(await request.json());

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    if (!order.paymentMethod || !isOnlinePaymentMethod(order.paymentMethod)) {
      return NextResponse.json(
        { error: "Metodo di pagamento non valido" },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentMethod: order.paymentMethod,
        paymentIntent: `sim_${orderId}`,
      },
    });

    const email = order.user.email;
    if (email) {
      await sendEmail({
        to: email,
        subject: `Ordine confermato — ${order.number}`,
        html: orderConfirmationEmail({
          number: order.number,
          total: Number(order.total),
          items: order.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            total: Number(i.total),
          })),
        }),
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: updated.number,
      paid: true,
    });
  } catch (error) {
    console.error("Simulate payment error:", error);
    return NextResponse.json({ error: "Simulazione fallita" }, { status: 500 });
  }
}
