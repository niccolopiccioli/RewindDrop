export const ONLINE_PAYMENT_METHODS = {
  card: {
    label: "Carta di credito / debito",
    description:
      "Visa, Mastercard, Amex — anche Apple Pay e Google Pay",
    stripeTypes: ["card"] as const,
  },
  paypal: {
    label: "PayPal",
    description: "Paga con il tuo account PayPal",
    stripeTypes: ["paypal"] as const,
  },
  klarna: {
    label: "Klarna",
    description: "Paga ora o in 3 rate senza interessi",
    stripeTypes: ["klarna"] as const,
  },
  satispay: {
    label: "Satispay",
    description: "Paga dall'app Satispay",
    stripeTypes: ["satispay"] as const,
  },
  scalapay: {
    label: "Scalapay",
    description: "Paga in 3 o 4 rate senza interessi",
    stripeTypes: ["scalapay"] as const,
  },
} as const;

export const OFFLINE_PAYMENT_METHODS = {
  cod: {
    label: "Pagamento alla consegna",
    description: "Paga in contanti o con POS al corriere",
  },
  bank_transfer: {
    label: "Bonifico bancario",
    description: "Riceverai le coordinate IBAN via email",
  },
} as const;

export type OnlinePaymentMethodId = keyof typeof ONLINE_PAYMENT_METHODS;
export type OfflinePaymentMethodId = keyof typeof OFFLINE_PAYMENT_METHODS;
export type PaymentMethodId = OnlinePaymentMethodId | OfflinePaymentMethodId;

export const ONLINE_PAYMENT_METHOD_IDS = Object.keys(
  ONLINE_PAYMENT_METHODS
) as OnlinePaymentMethodId[];

export const PAYMENT_METHOD_IDS = [
  ...ONLINE_PAYMENT_METHOD_IDS,
  ...Object.keys(OFFLINE_PAYMENT_METHODS),
] as PaymentMethodId[];

export function isOnlinePaymentMethod(
  method: string
): method is OnlinePaymentMethodId {
  return method in ONLINE_PAYMENT_METHODS;
}

export function getPaymentMethodLabel(method: string): string {
  if (method in ONLINE_PAYMENT_METHODS) {
    return ONLINE_PAYMENT_METHODS[method as OnlinePaymentMethodId].label;
  }
  if (method in OFFLINE_PAYMENT_METHODS) {
    return OFFLINE_PAYMENT_METHODS[method as OfflinePaymentMethodId].label;
  }
  return method;
}
