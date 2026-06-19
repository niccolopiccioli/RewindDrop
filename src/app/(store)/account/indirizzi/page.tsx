"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

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
                Predefinito
              </span>
            )}
            <p className="font-medium">{a.name}</p>
            <p className="text-muted">{a.street}</p>
            <p className="text-muted">{a.postalCode} {a.city}</p>
          </div>
          <button onClick={() => handleDelete(a.id)} className="text-xs text-muted hover:text-foreground">
            Elimina
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="border border-border p-6 space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Indirizzo" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Città" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input label="CAP" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit">Salva</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annulla</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="outline">Aggiungi indirizzo</Button>
      )}
    </div>
  );
}
