"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";
import type { OnlinePaymentMethodId } from "@/lib/payments/methods";
import { ONLINE_PAYMENT_METHODS } from "@/lib/payments/methods";
import Button from "@/components/ui/button";

type StripePaymentFormProps = {
  clientSecret: string;
  amount: number;
  orderId: string;
  paymentMethod: OnlinePaymentMethodId;
  onSuccess: (orderNumber: string) => void;
  onError: (message: string) => void;
  onBack: () => void;
};

function PaymentForm({
  amount,
  orderId,
  paymentMethod,
  onSuccess,
  onError,
  onBack,
}: Omit<StripePaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const methodLabel = ONLINE_PAYMENT_METHODS[paymentMethod].label;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/checkout/return?orderId=${orderId}`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message ?? "Pagamento non riuscito");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const res = await fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          onError(data.error ?? "Errore conferma ordine");
          return;
        }
        onSuccess(data.orderNumber);
      }
    } catch {
      onError("Errore durante il pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-border p-4 bg-white">
        <PaymentElement
          options={{
            layout: paymentMethod === "card" ? "tabs" : "accordion",
            paymentMethodOrder:
              paymentMethod === "card"
                ? undefined
                : [paymentMethod],
          }}
        />
      </div>
      <p className="text-xs text-muted">
        Pagamento sicuro con {methodLabel} tramite Stripe.
        {paymentMethod === "card" &&
          " In test usa la carta 4242 4242 4242 4242."}
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Indietro
        </Button>
        <Button type="submit" loading={loading} shape="pill" size="lg" className="flex-1">
          Paga €{amount.toFixed(2)}
        </Button>
      </div>
    </form>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const stripe = getStripe();
  if (!stripe) return null;

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1d1d1f",
            borderRadius: "8px",
          },
        },
      }}
    >
      <PaymentForm
        amount={props.amount}
        orderId={props.orderId}
        paymentMethod={props.paymentMethod}
        onSuccess={props.onSuccess}
        onError={props.onError}
        onBack={props.onBack}
      />
    </Elements>
  );
}
