"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header";
import Button from "@/components/ui/button";
import { useAdminT } from "@/components/admin/admin-locale-provider";

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
  const t = useAdminT();
  const rt = (k: string) => t(`admin.reviews.${k}`);
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
      <PageHeader title={rt("title")} description={rt("description")} />
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: "false", label: rt("pending") },
          { value: "true", label: rt("approved") },
          { value: "", label: rt("all") },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs uppercase tracking-widest border whitespace-nowrap ${
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <div className="min-w-0">
                <Link href={`/products/${r.product.slug}`} className="text-sm font-medium hover:underline">
                  {r.product.name}
                </Link>
                <p className="text-xs text-muted">{r.user.name ?? r.user.email} — {r.rating}/5</p>
              </div>
              <StatusLabel label={r.approved ? rt("approvedLabel") : rt("pendingLabel")} />
            </div>
            {r.comment && <p className="text-sm text-muted mb-3">{r.comment}</p>}
            {!r.approved && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => moderate(r.id, true)}>{rt("approve")}</Button>
                <Button size="sm" variant="outline" onClick={() => moderate(r.id, false)}>{rt("reject")}</Button>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-muted">{rt("noReviews")}</p>}
      </div>
    </div>
  );
}

function StatusLabel({ label }: { label: string }) {
  return (
    <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-border shrink-0">
      {label}
    </span>
  );
}