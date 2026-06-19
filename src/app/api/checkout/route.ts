import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations/checkout";
import {
  resolvePaymentMethod,
  isOnlinePaymentMethod,
  getPaymentMethodLabel,
} from "@/lib/payments";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, saveAddress, addressId, paymentMethod } =
      checkoutSchema.parse(body);

    const method = resolvePaymentMethod(paymentMethod);

    const session = await auth();
    const variantIds = items.map((i) => i.variantId);

    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds }, active: true },
      include: { product: { select: { id: true, name: true, price: true, active: true } } },
    });

    if (variants.length !== items.length) {
      return NextResponse.json(
        { error: "Una o più varianti non sono disponibili" },
        { status: 400 }
      );
    }

    const stockErrors: { variantId: string; name: string; available: number }[] = [];
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (!variant.product.active) {
        throw new Error(`Prodotto non disponibile: ${variant.product.name}`);
      }
      if (variant.stock < item.quantity) {
        stockErrors.push({
          variantId: variant.id,
          name: variant.product.name,
          available: variant.stock,
        });
      }
      const price = Number(variant.price ?? variant.product.price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: variant.productId,
        variantId: variant.id,
        name: variant.product.name,
        sku: variant.sku,
        quantity: item.quantity,
        price,
        total: itemTotal,
      };
    });

    if (stockErrors.length > 0) {
      return NextResponse.json(
        { error: "Stock insufficiente", details: stockErrors },
        { status: 409 }
      );
    }

    const shipping = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    let userId: string;

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const guestEmail =
        shippingAddress.email ?? `guest-${Date.now()}@eshop.local`;
      const guestUser = await prisma.user.upsert({
        where: { email: guestEmail },
        update: {},
        create: {
          email: guestEmail,
          name: shippingAddress.name,
          role: "CUSTOMER",
        },
      });
      userId = guestUser.id;
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number: orderNumber,
          userId,
          status: "PENDING",
          subtotal,
          shipping,
          tax: 0,
          total,
          shippingAddr: shippingAddress,
          paymentMethod: method,
          items: { create: orderItems },
        },
        include: { items: true, user: { select: { email: true } } },
      });

      for (const item of items) {
        const updated = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error("Stock insufficiente durante la transazione");
        }
      }

      if (session?.user?.id && saveAddress) {
        const existing = await tx.address.count({ where: { userId } });
        await tx.address.create({
          data: {
            userId,
            name: shippingAddress.name,
            street: shippingAddress.street,
            street2: shippingAddress.street2,
            city: shippingAddress.city,
            province: shippingAddress.province,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country ?? "IT",
            phone: shippingAddress.phone,
            isDefault: existing === 0,
          },
        });
      }

      if (session?.user?.id && addressId) {
        const addr = await tx.address.findFirst({
          where: { id: addressId, userId },
        });
        if (addr) {
          await tx.order.update({
            where: { id: created.id },
            data: {
              shippingAddr: {
                name: addr.name,
                street: addr.street,
                street2: addr.street2,
                city: addr.city,
                province: addr.province,
                postalCode: addr.postalCode,
                country: addr.country,
                phone: addr.phone,
              },
            },
          });
        }
      }

      return created;
    });

    const email = shippingAddress.email ?? order.user.email;

    if (isOnlinePaymentMethod(method)) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.number,
        paymentMethod: method,
        paid: false,
      });
    }

    if (email) {
      const extraNote =
        method === "bank_transfer"
          ? "<p><strong>Bonifico:</strong> IBAN IT00 X000 0000 0000 0000 0000 000 — causale: " +
            order.number +
            "</p>"
          : "";

      await sendEmail({
        to: email,
        subject: `Ordine confermato — ${order.number}`,
        html:
          orderConfirmationEmail({
            number: order.number,
            total,
            items: order.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              total: Number(i.total),
            })),
          }) +
          `<p>Metodo di pagamento: ${getPaymentMethodLabel(method)}</p>` +
          extraNote,
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number,
      paymentMethod: method,
      paid: true,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout fallito" },
      { status: 500 }
    );
  }
}
