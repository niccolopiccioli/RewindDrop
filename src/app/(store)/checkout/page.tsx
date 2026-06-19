"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import StripePaymentForm from "@/components/checkout/stripe-payment-form";
import DevPaymentForm from "@/components/checkout/dev-payment-form";
import {
  type PaymentMethodId,
  type OnlinePaymentMethodId,
  isOnlinePaymentMethod,
} from "@/lib/payments/methods";

type Step = "shipping" | "payment" | "online" | "confirmation";

type PaymentOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
};

type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  province?: string | null;
  phone?: string | null;
  isDefault: boolean;
};

type OnlinePaymentState = {
  orderId: string;
  orderNumber: string;
  paymentMethod: OnlinePaymentMethodId;
  clientSecret?: string;
  devMode?: boolean;
};

const steps: { id: Step; label: string }[] = [
  { id: "shipping", label: "Spedizione" },
  { id: "payment", label: "Pagamento" },
  { id: "confirmation", label: "Conferma" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentOption[]>([]);
  const [stripeAvailable, setStripeAvailable] = useState(false);
  const [devPaymentSimulation, setDevPaymentSimulation] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>("card");
  const [onlinePayment, setOnlinePayment] = useState<OnlinePaymentState | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingData, setShippingData] = useState({
    name: "", street: "", city: "", postalCode: "", province: "", phone: "", email: "",
  });

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const displayStep = step === "online" ? "payment" : step;
  const currentStepIndex = steps.findIndex((s) => s.id === displayStep);

  useEffect(() => {
    if (items.length === 0 && step !== "confirmation") router.replace("/carrello");
  }, [items.length, step, router]);

  useEffect(() => {
    fetch("/api/payment-mode")
      .then((r) => r.json())
      .then((d) => {
        const methods: PaymentOption[] = d.methods ?? [];
        setPaymentMethods(methods);
        setStripeAvailable(Boolean(d.stripeAvailable));
        setDevPaymentSimulation(Boolean(d.devCardSimulation));
        if (methods.length > 0) {
          setSelectedPayment(methods[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/account/addresses")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAddresses(data);
            const def = data.find((a: Address) => a.isDefault);
            if (def) setSelectedAddressId(def.id);
          }
        });
      fetch("/api/account/profile")
        .then((r) => r.json())
        .then((u) => {
          if (u.email) setShippingData((s) => ({ ...s, email: u.email, name: u.name ?? s.name }));
        });
    }
  }, [session]);

  if (items.length === 0 && step !== "confirmation") return null;

  const createOrder = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: { ...shippingData, country: "IT" },
        saveAddress: session?.user ? saveAddress : false,
        addressId: selectedAddressId || undefined,
        paymentMethod: selectedPayment,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.details) {
        throw new Error("Stock insufficiente per alcuni articoli");
      }
      throw new Error(data.error ?? "Checkout fallito");
    }
    return data;
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await createOrder();

      if (data.paid) {
        clearCart();
        setOrderNumber(data.orderNumber);
        setStep("confirmation");
        return;
      }

      if (isOnlinePaymentMethod(selectedPayment) && data.orderId) {
        if (stripeAvailable) {
          const confirmRes = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId }),
          });
          const confirmData = await confirmRes.json();
          if (!confirmRes.ok) {
            setError(confirmData.error ?? "Impossibile avviare il pagamento");
            return;
          }
          if (confirmData.clientSecret) {
            setOnlinePayment({
              orderId: data.orderId,
              orderNumber: data.orderNumber,
              paymentMethod: selectedPayment,
              clientSecret: confirmData.clientSecret,
            });
            setStep("online");
            return;
          }
        } else if (devPaymentSimulation) {
          setOnlinePayment({
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            paymentMethod: selectedPayment,
            devMode: true,
          });
          setStep("online");
          return;
        } else {
          setError("Pagamento online non configurato. Aggiungi le chiavi Stripe al file .env");
          return;
        }
      }

      clearCart();
      setOrderNumber(data.orderNumber);
      setStep("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePaymentSuccess = (number: string) => {
    clearCart();
    setOrderNumber(number);
    setOnlinePayment(null);
    setStep("confirmation");
  };

  const applyAddress = (addr: Address) => {
    setShippingData({
      name: addr.name,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postalCode,
      province: addr.province ?? "",
      phone: addr.phone ?? "",
      email: shippingData.email,
    });
  };

  if (step === "confirmation") {
    return (
      <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <CheckCircle size={48} strokeWidth={1} className="mb-6 text-foreground" />
        <h1 className="text-display mb-3 text-xl font-semibold">Ordine confermato</h1>
        {orderNumber && (
          <p className="mb-2 text-sm">
            Numero ordine: <strong>{orderNumber}</strong>
          </p>
        )}
        <p className="mb-8 text-sm text-muted">
          Riceverai una email di conferma a breve.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {orderNumber && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/ordine/${orderNumber}?email=${encodeURIComponent(shippingData.email)}`
                )
              }
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

  return (
    <div className="container-wide max-w-4xl py-8 md:py-12">
      <h1 className="text-display text-2xl font-semibold mb-8">Checkout</h1>

      <div className="flex items-center gap-0 mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${
                i <= currentStepIndex ? "bg-foreground text-white border-foreground" : "border-border text-muted"
              }`}>
                {i + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-widest mt-2 ${i <= currentStepIndex ? "text-foreground" : "text-muted"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 -mt-4 ${i < currentStepIndex ? "bg-foreground" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {step === "shipping" && (
            <form onSubmit={(e) => { e.preventDefault(); setStep("payment"); }} className="space-y-4">
              {addresses.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-[11px] uppercase tracking-widest text-muted">Indirizzi salvati</p>
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setSelectedAddressId(a.id); applyAddress(a); }}
                      className={`w-full text-left p-3 border text-sm ${selectedAddressId === a.id ? "border-foreground" : "border-border"}`}
                    >
                      {a.name} — {a.street}, {a.city}
                    </button>
                  ))}
                </div>
              )}
              <Input label="Email" type="email" value={shippingData.email} onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })} required />
              <Input label="Nome e cognome" value={shippingData.name} onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })} required />
              <Input label="Indirizzo" value={shippingData.street} onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Città" value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} required />
                <Input label="CAP" value={shippingData.postalCode} onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Provincia" value={shippingData.province} onChange={(e) => setShippingData({ ...shippingData, province: e.target.value })} />
                <Input label="Telefono" type="tel" value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} required />
              </div>
              {session?.user && (
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                  Salva questo indirizzo
                </label>
              )}
              <Button type="submit" shape="pill" size="lg" className="mt-4">Continua</Button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
                  Metodo di pagamento
                </p>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full text-left p-4 border transition-colors ${
                        selectedPayment === method.id
                          ? "border-foreground bg-surface"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                            selectedPayment === method.id
                              ? "border-foreground"
                              : "border-border"
                          }`}
                        >
                          {selectedPayment === method.id && (
                            <span className="w-2 h-2 rounded-full bg-foreground" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-muted mt-0.5">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPayment === "bank_transfer" && (
                <p className="text-xs text-muted border border-border p-4">
                  Dopo la conferma riceverai via email le coordinate bancarie con il numero ordine come causale.
                </p>
              )}

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("shipping")} className="flex-1">Indietro</Button>
                <Button onClick={handlePaymentSubmit} loading={loading} shape="pill" size="lg" className="flex-1">
                  {isOnlinePaymentMethod(selectedPayment)
                    ? "Continua al pagamento"
                    : `Conferma ordine — €${total.toFixed(2)}`}
                </Button>
              </div>
            </div>
          )}

          {step === "online" && onlinePayment && (
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-widest text-muted">
                Completa il pagamento
              </p>
              {onlinePayment.clientSecret ? (
                <StripePaymentForm
                  clientSecret={onlinePayment.clientSecret}
                  amount={total}
                  orderId={onlinePayment.orderId}
                  paymentMethod={onlinePayment.paymentMethod}
                  onSuccess={handleOnlinePaymentSuccess}
                  onError={setError}
                  onBack={() => {
                    setStep("payment");
                    setOnlinePayment(null);
                  }}
                />
              ) : onlinePayment.devMode ? (
                <DevPaymentForm
                  amount={total}
                  orderId={onlinePayment.orderId}
                  paymentMethod={onlinePayment.paymentMethod}
                  onSuccess={handleOnlinePaymentSuccess}
                  onError={setError}
                  onBack={() => {
                    setStep("payment");
                    setOnlinePayment(null);
                  }}
                />
              ) : null}
              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2">{error}</p>}
            </div>
          )}

        </div>

        <div className="bg-surface p-6 h-fit sticky top-20">
          <h2 className="text-[11px] uppercase tracking-widest text-muted mb-4">Riepilogo</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-2">
              <span className="text-muted truncate mr-4">{item.name} ×{item.quantity}</span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotale</span><span>€{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Spedizione</span><span>{shipping === 0 ? "Gratuita" : `€${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-medium pt-2"><span>Totale</span><span>€{total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
