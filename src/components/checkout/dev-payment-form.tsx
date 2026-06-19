"use client";

import { useState } from "react";
import type { OnlinePaymentMethodId } from "@/lib/payments/methods";
import { ONLINE_PAYMENT_METHODS } from "@/lib/payments/methods";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type DevPaymentFormProps = {
  amount: number;
  orderId: string;
  paymentMethod: OnlinePaymentMethodId;
  onSuccess: (orderNumber: string) => void;
  onError: (message: string) => void;
  onBack: () => void;
};

export default function DevPaymentForm({
  amount,
  orderId,
  paymentMethod,
  onSuccess,
  onError,
  onBack,
}: DevPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/34");
  const [cvc, setCvc] = useState("123");

  const methodLabel = ONLINE_PAYMENT_METHODS[paymentMethod].label;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/simulate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Pagamento simulato fallito");
        return;
      }
      onSuccess(data.orderNumber);
    } catch {
      onError("Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-border p-4 space-y-4 bg-surface">
        <p className="text-xs text-muted">
          Modalità sviluppo — Stripe non configurato. Simula un pagamento con{" "}
          {methodLabel}.
        </p>
        {paymentMethod === "card" ? (
          <>
            <Input
              label="Numero carta"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Scadenza"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/AA"
              />
              <Input
                label="CVV"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
              />
            </div>
          </>
        ) : (
          <p className="text-sm">
            Clicca il pulsante qui sotto per simulare il redirect verso{" "}
            {methodLabel} e completare l&apos;ordine.
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Indietro
        </Button>
        <Button type="submit" loading={loading} shape="pill" size="lg" className="flex-1">
          Paga €{amount.toFixed(2)} con {methodLabel}
        </Button>
      </div>
    </form>
  );
}
