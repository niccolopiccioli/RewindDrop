"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";
  const callbackUrl = searchParams.get("callbackUrl") || (isAdmin ? "/admin" : "/account");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email o password non validi");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Registrazione fallita");
        return;
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Account creato ma login fallito");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-sm bg-white p-8 md:p-10 border border-border">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em]">ESHOP</Link>
          <h1 className="text-display text-lg font-semibold mt-6">
            {isAdmin ? "Area Admin" : mode === "login" ? "Accedi" : "Registrati"}
          </h1>
          <p className="text-xs text-muted mt-2">
            {isAdmin ? "Accesso riservato agli amministratori" : "Il tuo account cliente"}
          </p>
        </div>

        {!isAdmin && (
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest border ${
                mode === "login" ? "bg-foreground text-white border-foreground" : "border-border"
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest border ${
                mode === "register" ? "bg-foreground text-white border-foreground" : "border-border"
              }`}
            >
              Registrati
            </button>
          </div>
        )}

        <form onSubmit={mode === "register" && !isAdmin ? handleRegister : handleLogin} className="space-y-4">
          {mode === "register" && !isAdmin && (
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2">{error}</p>}
          <Button type="submit" fullWidth shape="pill" size="lg" loading={loading}>
            {mode === "register" && !isAdmin ? "Crea account" : "Accedi"}
          </Button>
        </form>

        <div className="text-center text-xs text-muted mt-8 space-y-2">
          <Link href="/" className="block hover:text-foreground transition-colors">Torna allo shop</Link>
          {!isAdmin && (
            <Link href="/login?admin=1&callbackUrl=/admin" className="block hover:text-foreground transition-colors">
              Accesso admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-muted text-sm">Caricamento...</div>}>
      <LoginForm />
    </Suspense>
  );
}
