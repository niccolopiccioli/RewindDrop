"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((u) => {
        setName(u.name ?? "");
        setEmail(u.email ?? "");
      });
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    if (res.ok) setMessage("Profilo aggiornato");
    else setError("Errore aggiornamento");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.ok) {
      setMessage("Password aggiornata");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const data = await res.json();
      setError(data.error ?? "Errore");
    }
  };

  return (
    <div className="space-y-10 max-w-md">
      <form onSubmit={saveProfile} className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-widest text-muted">Dati personali</h2>
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit">Salva</Button>
      </form>

      <form onSubmit={changePassword} className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-widest text-muted">Cambia password</h2>
        <Input label="Password attuale" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input label="Nuova password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button type="submit" variant="outline">Aggiorna password</Button>
      </form>

      {message && <p className="text-xs text-green-700">{message}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
        Esci
      </Button>
    </div>
  );
}
