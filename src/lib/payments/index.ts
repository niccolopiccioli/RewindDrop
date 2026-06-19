import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  type OnlinePaymentMethodId,
  type PaymentMethodId,
  ONLINE_PAYMENT_METHODS,
  OFFLINE_PAYMENT_METHODS,
  isOnlinePaymentMethod,
} from "./methods";

export {
  type PaymentMethodId,
  type OnlinePaymentMethodId,
  type OfflinePaymentMethodId,
  ONLINE_PAYMENT_METHODS,
  OFFLINE_PAYMENT_METHODS,
  ONLINE_PAYMENT_METHOD_IDS,
  PAYMENT_METHOD_IDS,
  isOnlinePaymentMethod,
  getPaymentMethodLabel,
} from "./methods";

const stripe =
  process.env.STRIPE_SECRET_KEY &&
  new Stripe(process.env.STRIPE_SECRET_KEY);

export function isStripeAvailable(): boolean {
  return Boolean(
    stripe && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

export function isDevPaymentSimulation(): boolean {
  return !isStripeAvailable() && process.env.NODE_ENV !== "production";
}

export function getPaymentMode(): "mock" | "stripe" {
  return process.env.PAYMENT_MODE === "stripe" && isStripeAvailable()
    ? "stripe"
    : "mock";
}

export function getAvailablePaymentMethods(): {
  id: PaymentMethodId;
  label: string;
  description: string;
}[] {
  const methods: { id: PaymentMethodId; label: string; description: string }[] =
    [];

  const showOnline = isStripeAvailable() || isDevPaymentSimulation();

  if (showOnline) {
    for (const [id, config] of Object.entries(ONLINE_PAYMENT_METHODS)) {
      const methodId = id as OnlinePaymentMethodId;
      let description: string = config.description;
      if (!isStripeAvailable() && isDevPaymentSimulation()) {
        description = `${config.description} — simulazione locale`;
      }
      methods.push({
        id: methodId,
        label: config.label,
        description,
      });
    }
  }

  for (const [id, config] of Object.entries(OFFLINE_PAYMENT_METHODS)) {
    methods.push({
      id: id as keyof typeof OFFLINE_PAYMENT_METHODS,
      label: config.label,
      description: config.description,
    });
  }

  return methods;
}

export function resolvePaymentMethod(
  method: PaymentMethodId
): PaymentMethodId {
  if (isOnlinePaymentMethod(method) && !isStripeAvailable()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Pagamento online non disponibile");
    }
  }
  return method;
}

type ShippingAddress = {
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

export async function createStripePaymentIntent(
  order: {
    id: string;
    number: string;
    total: number;
    currency: string;
  },
  paymentMethod: OnlinePaymentMethodId,
  shippingAddress?: ShippingAddress
) {
  if (!stripe) throw new Error("Stripe non configurato");

  const config = ONLINE_PAYMENT_METHODS[paymentMethod];
  const params: Stripe.PaymentIntentCreateParams = {
    amount: Math.round(order.total * 100),
    currency: order.currency.toLowerCase(),
    metadata: {
      orderId: order.id,
      orderNumber: order.number,
      paymentMethod,
    },
  };

  if (paymentMethod === "card") {
    params.automatic_payment_methods = { enabled: true };
  } else {
    params.payment_method_types = [...config.stripeTypes];
  }

  if (shippingAddress) {
    const country = (shippingAddress.country ?? "IT").toUpperCase();
    params.shipping = {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      address: {
        line1: shippingAddress.street,
        line2: shippingAddress.street2,
        city: shippingAddress.city,
        state: shippingAddress.province,
        postal_code: shippingAddress.postalCode,
        country,
      },
    };

    if (paymentMethod === "klarna") {
      params.payment_method_options = {
        klarna: { preferred_locale: "it-IT" },
      };
    }
  }

  const intent = await stripe.paymentIntents.create(params);

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentIntent: intent.id },
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
}

export async function confirmMockPayment(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentMethod: "mock",
    },
  });
}

export async function markOrderPaidFromStripe(
  paymentIntentId: string,
  paymentMethod?: string
) {
  const order = await prisma.order.findFirst({
    where: { paymentIntent: paymentIntentId },
  });
  if (!order) return null;

  const method =
    paymentMethod ?? order.paymentMethod ?? "card";

  return prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paymentMethod: method,
    },
  });
}
