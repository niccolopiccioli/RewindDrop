"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useI18n } from "@/components/layout/locale-provider";

type Address = {
  id: string;
  name: string;
  street: string;
  street2?: string | null;
  city: string;
  province?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

const empty = {
  name: "", street: "", street2: "", city: "", province: "", postalCode: "", phone: "",
};

export default function AddressesPage() {
  const { t } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => setAddresses(Array.isArray(data) ? data : []));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, country: "IT" }),
    });
    setForm(empty);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      {addresses.map((a) => (
        <div key={a.id} className="border border-border p-4 flex justify-between">
          <div className="text-sm">
            {a.isDefault && (
              <span className="text-[10px] uppercase tracking-widest text-muted block mb-1">
                {t("account.defaultAddress")}
              </span>
            )}
            <p className="font-medium">{a.name}</p>
            <p className="text-muted">{a.street}</p>
            <p className="text-muted">{a.postalCode} {a.city}</p>
          </div>
          <button onClick={() => handleDelete(a.id)} className="text-xs text-muted hover:text-foreground">
            {t("common.delete")}
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="border border-border p-6 space-y-4">
          <Input label={t("common.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label={t("common.address")} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("common.city")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input label={t("common.postalCode")} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit">{t("common.save")}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="outline">{t("account.addAddress")}</Button>
      )}
    </div>
  );
}
