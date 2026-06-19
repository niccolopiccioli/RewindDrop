"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header";
import Button from "@/components/ui/button";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  approved: boolean;
  user: { name: string | null; email: string };
  product: { name: string; slug: string };
};

export default function RecensioniPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState("false");

  const load = () =>
    fetch(`/api/admin/reviews?approved=${filter}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []));

  useEffect(() => { load(); }, [filter]);

  const moderate = async (id: string, approved: boolean) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    load();
  };

  return (
    <div>
      <PageHeader title="Recensioni" description="Moderazione recensioni clienti" />
      <div className="flex gap-2 mb-6">
        {[
          { value: "false", label: "In attesa" },
          { value: "true", label: "Approvate" },
          { value: "", label: "Tutte" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs uppercase tracking-widest border ${
              filter === f.value ? "bg-foreground text-white border-foreground" : "border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border border-border p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Link href={`/prodotti/${r.product.slug}`} className="text-sm font-medium hover:underline">
                  {r.product.name}
                </Link>
                <p className="text-xs text-muted">{r.user.name ?? r.user.email} — {r.rating}/5</p>
              </div>
              <Status label={r.approved ? "Approvata" : "In attesa"} />
            </div>
            {r.comment && <p className="text-sm text-muted mb-3">{r.comment}</p>}
            {!r.approved && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => moderate(r.id, true)}>Approva</Button>
                <Button size="sm" variant="outline" onClick={() => moderate(r.id, false)}>Rifiuta</Button>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-muted">Nessuna recensione.</p>}
      </div>
    </div>
  );
}

function Status({ label }: { label: string }) {
  return (
    <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-border">
      {label}
    </span>
  );
}
