"use client";

import { useState } from "react";
import type { OnlinePaymentMethodId } from "@/lib/payments/methods";
import { localizePaymentMethod } from "@/lib/payments/labels";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useI18n } from "@/components/layout/locale-provider";

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
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/34");
  const [cvc, setCvc] = useState("123");

  const methodLabel = localizePaymentMethod(locale, paymentMethod).label;

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
        onError(data.error ?? t("checkout.simulatedFailed"));
        return;
      }
      onSuccess(data.orderNumber);
    } catch {
      onError(t("checkout.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-border p-4 space-y-4 bg-surface">
        <p className="text-xs text-muted">
          {t("checkout.devModeIntro", { method: methodLabel })}
        </p>
        {paymentMethod === "card" ? (
          <>
            <Input
              label={t("checkout.cardNumber")}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("checkout.expiry")}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
              />
              <Input
                label={t("checkout.cvc")}
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
              />
            </div>
          </>
        ) : (
          <p className="text-sm">
            {t("checkout.devSimulateRedirect", { method: methodLabel })}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          {t("checkout.back")}
        </Button>
        <Button type="submit" loading={loading} shape="pill" size="lg" className="flex-1">
          {t("checkout.devPayWith", {
            amount: amount.toFixed(2),
            method: methodLabel,
          })}
        </Button>
      </div>
    </form>
  );
}
