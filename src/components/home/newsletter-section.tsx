"use client";

import { useState } from "react";
import Button from "@/components/ui/button";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "ok" : "error");
    if (res.ok) setEmail("");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container-wide max-w-lg mx-auto text-center">
        <h2 className="text-display text-xl md:text-2xl font-semibold mb-3">
          Resta aggiornato
        </h2>
        <p className="text-sm text-muted mb-8">
          Offerte esclusive e nuovi arrivi direttamente nella tua inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="La tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <Button type="submit" shape="pill">
            Iscriviti
          </Button>
        </form>
        {status === "ok" && (
          <p className="text-xs text-green-700 mt-3">Iscrizione completata!</p>
        )}
        {status === "error" && (
          <p className="text-xs text-red-600 mt-3">Email non valida.</p>
        )}
      </div>
    </section>
  );
}
