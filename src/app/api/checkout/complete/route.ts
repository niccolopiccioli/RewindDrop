import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { isOnlinePaymentMethod } from "@/lib/payments";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";

const schema = z.object({
  orderId: z.string(),
  paymentIntentId: z.string(),
});

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentIntentId } = schema.parse(await request.json());

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe non configurato" },
        { status: 400 }
      );
    }

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

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Pagamento non completato" },
        { status: 400 }
      );
    }

    if (intent.metadata.orderId !== orderId) {
      return NextResponse.json({ error: "Ordine non corrispondente" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentMethod: order.paymentMethod,
        paymentIntent: paymentIntentId,
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
    console.error("Complete checkout error:", error);
    return NextResponse.json(
      { error: "Conferma pagamento fallita" },
      { status: 500 }
    );
  }
}
