import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createStripePaymentIntent,
  isOnlinePaymentMethod,
} from "@/lib/payments";

const confirmSchema = z.object({
  orderId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { orderId } = confirmSchema.parse(await request.json());

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ success: true, orderNumber: order.number, paid: true });
    }

    if (!order.paymentMethod || !isOnlinePaymentMethod(order.paymentMethod)) {
      return NextResponse.json(
        { error: "Questo ordine non richiede pagamento online" },
        { status: 400 }
      );
    }

    const shippingAddr = order.shippingAddr as {
      name: string;
      street: string;
      street2?: string;
      city: string;
      postalCode: string;
      province?: string;
      country?: string;
      phone?: string;
      email?: string;
    };

    const intent = await createStripePaymentIntent(
      {
        id: order.id,
        number: order.number,
        total: Number(order.total),
        currency: order.currency,
      },
      order.paymentMethod,
      {
        ...shippingAddr,
        email: shippingAddr.email ?? order.user.email ?? undefined,
      }
    );

    return NextResponse.json({
      success: true,
      orderNumber: order.number,
      paymentMethod: order.paymentMethod,
      clientSecret: intent.clientSecret,
      paid: false,
    });
  } catch (error) {
    console.error("Confirm error:", error);
    return NextResponse.json({ error: "Conferma pagamento fallita" }, { status: 500 });
  }
}
