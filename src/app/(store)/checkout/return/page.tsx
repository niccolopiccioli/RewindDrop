"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { getStripe } from "@/lib/stripe-client";
import { useCartStore } from "@/stores/cart";
import Button from "@/components/ui/button";

function CheckoutReturnContent() {
  const router = useRouter();
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
      setError("Parametri di pagamento mancanti");
      return;
    }

    if (redirectStatus === "failed") {
      setStatus("error");
      setError("Il pagamento non è andato a buon fine. Riprova.");
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
            setError("Pagamento non completato");
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
          setError(data.error ?? "Errore conferma ordine");
          return;
        }

        clearCart();
        setOrderNumber(data.orderNumber);
        setStatus("success");
      } catch {
        setStatus("error");
        setError("Errore durante la verifica del pagamento");
      }
    }

    finalize(orderIdParam, paymentIntentId);
  }, [searchParams, clearCart]);

  if (status === "loading") {
    return (
      <div className="container-wide max-w-lg py-20 text-center">
        <p className="text-sm text-muted">Verifica pagamento in corso…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container-wide max-w-lg py-20 text-center space-y-6">
        <h1 className="text-display text-xl font-semibold">Pagamento non riuscito</h1>
        <p className="text-sm text-muted">{error}</p>
        <Button onClick={() => router.push("/checkout")} shape="pill">
          Torna al checkout
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <CheckCircle size={48} strokeWidth={1} className="mb-6 text-foreground" />
      <h1 className="text-display mb-3 text-xl font-semibold">Ordine confermato</h1>
      {orderNumber && (
        <p className="text-sm">
          Numero ordine: <strong>{orderNumber}</strong>
        </p>
      )}
      <p className="mb-8 text-sm text-muted">Riceverai una email di conferma a breve.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {orderNumber && (
          <Button
            variant="outline"
            onClick={() => router.push(`/ordine/${orderNumber}`)}
          >
            Dettaglio ordine
          </Button>
        )}
        <Button onClick={() => router.push("/")} shape="pill">
          Torna alla home
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="container-wide max-w-lg py-20 text-center">
          <p className="text-sm text-muted">Caricamento…</p>
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
