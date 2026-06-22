"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { getStripe } from "@/lib/stripe-client";
import { useCartStore } from "@/stores/cart";
import Button from "@/components/ui/button";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";

function CheckoutReturnContent() {
  const router = useRouter();
  const paths = usePaths();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const redirectStatus = searchParams.get("redirect_status");

    const orderIdParam = searchParams.get("orderId");
    const paymentIntentId = searchParams.get("payment_intent");

    if (!orderIdParam || !paymentIntentId) {
      setStatus("error");
      setError(t("checkout.paymentFailed"));
      return;
    }

    if (redirectStatus === "failed") {
      setStatus("error");
      setError(t("checkout.paymentFailed"));
      return;
    }

    async function finalize(orderId: string, intentId: string) {
      try {
        const stripe = await getStripe();
        if (stripe) {
          const { paymentIntent: intent } =
            await stripe.retrievePaymentIntent(intentId);
          if (intent?.status !== "succeeded") {
            setStatus("error");
            setError(t("checkout.paymentFailed"));
            return;
          }
        }

        const res = await fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentIntentId: intentId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setError(data.error ?? t("checkout.paymentFailed"));
          return;
        }

        clearCart();
        setOrderNumber(data.orderNumber);
        setStatus("success");
      } catch {
        setStatus("error");
        setError(t("checkout.paymentFailed"));
      }
    }

    finalize(orderIdParam, paymentIntentId);
  }, [searchParams, clearCart, t]);

  if (status === "loading") {
    return (
      <div className="container-wide max-w-lg py-20 text-center">
        <p className="text-sm text-muted">{t("checkout.verifyingPayment")}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container-wide max-w-lg py-20 text-center space-y-6">
        <h1 className="text-display text-xl font-semibold">{t("checkout.paymentFailed")}</h1>
        <p className="text-sm text-muted">{error}</p>
        <Button onClick={() => router.push(paths.checkout)} shape="pill">
          {t("checkout.backToCheckout")}
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <CheckCircle size={48} strokeWidth={1} className="mb-6 text-foreground" />
      <h1 className="text-display mb-3 text-xl font-semibold">{t("checkout.orderConfirmed")}</h1>
      {orderNumber && (
        <p className="text-sm">
          {t("checkout.orderNumber")}: <strong>{orderNumber}</strong>
        </p>
      )}
      <p className="mb-8 text-sm text-muted">{t("checkout.confirmationEmail")}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {orderNumber && (
          <Button
            variant="outline"
            onClick={() => router.push(paths.order(orderNumber))}
          >
            {t("checkout.viewOrder")}
          </Button>
        )}
        <Button onClick={() => router.push(paths.home)} shape="pill">
          {t("common.backHome")}
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  const { t } = useI18n();

  return (
    <Suspense
      fallback={
        <div className="container-wide max-w-lg py-20 text-center">
          <p className="text-sm text-muted">{t("products.loading")}</p>
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
