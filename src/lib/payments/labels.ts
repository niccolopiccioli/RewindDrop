import { t, type MessageKey } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import {
  type PaymentMethodId,
  isOnlinePaymentMethod,
} from "@/lib/payments/methods";

const PAYMENT_MESSAGE_KEYS: Record<
  PaymentMethodId,
  { label: MessageKey; description: MessageKey }
> = {
  card: {
    label: "payments.card.label",
    description: "payments.card.description",
  },
  paypal: {
    label: "payments.paypal.label",
    description: "payments.paypal.description",
  },
  klarna: {
    label: "payments.klarna.label",
    description: "payments.klarna.description",
  },
  satispay: {
    label: "payments.satispay.label",
    description: "payments.satispay.description",
  },
  scalapay: {
    label: "payments.scalapay.label",
    description: "payments.scalapay.description",
  },
  cod: {
    label: "payments.cod.label",
    description: "payments.cod.description",
  },
  bank_transfer: {
    label: "payments.bank_transfer.label",
    description: "payments.bank_transfer.description",
  },
};

export function localizePaymentMethod(
  locale: Locale,
  id: PaymentMethodId,
  options?: { localSimulation?: boolean }
) {
  const keys = PAYMENT_MESSAGE_KEYS[id];
  let description = t(locale, keys.description);
  if (options?.localSimulation && isOnlinePaymentMethod(id)) {
    description = `${description} — ${t(locale, "payments.localSimulation")}`;
  }
  return {
    label: t(locale, keys.label),
    description,
  };
}

export function localizePaymentMethods(
  locale: Locale,
  methods: { id: PaymentMethodId }[],
  devSimulation: boolean
) {
  return methods.map((method) => ({
    id: method.id,
    ...localizePaymentMethod(locale, method.id, {
      localSimulation: devSimulation && isOnlinePaymentMethod(method.id),
    }),
  }));
}
