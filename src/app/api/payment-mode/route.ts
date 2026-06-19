import { NextResponse } from "next/server";
import {
  getAvailablePaymentMethods,
  isStripeAvailable,
} from "@/lib/payments";

export async function GET() {
  const stripeAvailable = isStripeAvailable();
  return NextResponse.json({
    methods: getAvailablePaymentMethods(),
    stripeAvailable,
    devCardSimulation: !stripeAvailable && process.env.NODE_ENV !== "production",
    stripePublishableKey: stripeAvailable
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      : null,
  });
}
