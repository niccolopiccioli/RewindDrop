"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/button";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";

type Order = {
  number: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; total: number }[];
};

function OrderContent() {
  const { number } = useParams<{ number: string }>();
  const searchParams = useSearchParams();
  const paths = usePaths();
  const { t, locale } = useI18n();
  const email = searchParams.get("email");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = email ? `?email=${encodeURIComponent(email)}` : "";
    fetch(`/api/orders/${number}${params}`).then(async (r) => {
      if (!r.ok) {
        setError(t("account.orderNotFound"));
        return;
      }
      setOrder(await r.json());
    });
  }, [number, email, t]);

  if (error) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-muted mb-4">{error}</p>
        <Link href={paths.home}>
          <Button variant="outline">{t("common.backHome")}</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-wide py-16 text-center text-muted text-sm">
        {t("products.loading")}
      </div>
    );
  }

  return (
    <div className="container-wide mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <CheckCircle size={48} strokeWidth={1} className="mx-auto text-foreground mb-6" />
      <h1 className="text-display text-xl font-semibold mb-2">{t("checkout.orderConfirmed")}</h1>
      <p className="text-sm text-muted mb-1">{t("account.orders")}</p>
      <p className="text-lg font-medium mb-6">{order.number}</p>
      <p className="text-sm text-muted mb-8">{order.status}</p>
      <div className="border border-border divide-y divide-border text-left mb-8 w-full">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between p-4 text-sm">
            <span>
              {item.name} ×{item.quantity}
            </span>
            <span>€{Number(item.total).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between p-4 text-sm font-medium">
          <span>{t("cart.total")}</span>
          <span>€{Number(order.total).toFixed(2)}</span>
        </div>
      </div>
      <Button onClick={() => (window.location.href = paths.home)} shape="pill">
        {t("common.backHome")}
      </Button>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const { t } = useI18n();

  return (
    <Suspense
      fallback={
        <div className="container-wide py-16 text-center text-muted text-sm">
          {t("products.loading")}
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
