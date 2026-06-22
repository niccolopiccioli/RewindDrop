"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/page-header";
import HomeBannerEditor, {
  type BannerFormValues,
} from "@/components/admin/home-banner-editor";
import {
  HOMEPAGE_CATEGORY_SLUGS,
  HOME_SPOT_KEYS,
  CATEGORY_DEFAULTS,
  CATEGORY_LABELS,
  SPOT_LABELS,
  buildDefaultCategoryForms,
  buildDefaultSpotForms,
  type HomepageCategorySlug,
  type HomeSpotKey,
} from "@/lib/homepage-banner-config";
import { normalizeImageFit } from "@/lib/image-fit";
import { normalizeImageUrl } from "@/lib/image-url";

function toForm(row: {
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
  imageAlt: string | null;
  objectFit?: string | null;
}): BannerFormValues {
  return {
    title: row.title,
    subtitle: row.subtitle ?? "",
    href: row.href,
    image: normalizeImageUrl(row.image ?? ""),
    imageAlt: row.imageAlt ?? row.title,
    objectFit: normalizeImageFit(row.objectFit),
  };
}

function formatApiError(data: unknown, status: number): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") return JSON.stringify(err);
  }
  return `Errore caricamento (${status})`;
}

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [categoryForms, setCategoryForms] = useState(buildDefaultCategoryForms);
  const [spotForms, setSpotForms] = useState(buildDefaultSpotForms);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/homepage-banners", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(formatApiError(data, res.status));
      }

      const cats = data.categories ?? [];
      const sps = data.spots ?? [];

      setCategoryForms((prev) => {
        const next = { ...prev };
        for (const slug of HOMEPAGE_CATEGORY_SLUGS) {
          const row = cats.find(
            (c: { slug: string }) => c.slug === slug
          );
          if (row) {
            next[slug] = toForm({
              title: row.name,
              subtitle: row.bannerSubtitle,
              href: row.href,
              image: row.image,
              imageAlt: row.imageAlt,
              objectFit: row.objectFit,
            });
          }
        }
        return next;
      });

      setSpotForms((prev) => {
        const next = { ...prev };
        for (const key of HOME_SPOT_KEYS) {
          const row = sps.find((s: { key: string }) => s.key === key);
          if (row) {
            next[key] = toForm({
              title: row.title,
              subtitle: row.subtitle,
              href: row.href,
              image: row.image,
              imageAlt: row.imageAlt,
              objectFit: row.objectFit,
            });
          }
        }
        return next;
      });
    } catch (err) {
      setFetchError(
        err instanceof Error
          ? err.message
          : "Impossibile caricare i banner dal server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const saveCategory = async (slug: HomepageCategorySlug) => {
    const form = categoryForms[slug];
    if (!form) throw new Error("Banner non trovato");
    setSavingKey(`cat-${slug}`);
    try {
      const res = await fetch(
        `/api/admin/homepage-banners/category/${encodeURIComponent(slug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.title,
            bannerSubtitle: form.subtitle || null,
            image: form.image.trim() === "" ? "" : normalizeImageUrl(form.image),
            imageAlt: form.imageAlt.trim() === "" ? "" : form.imageAlt,
            objectFit: form.objectFit,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(formatApiError(data, res.status));
      await fetchBanners();
    } finally {
      setSavingKey(null);
    }
  };

  const saveSpot = async (key: HomeSpotKey) => {
    const form = spotForms[key];
    if (!form) throw new Error("Banner non trovato");
    setSavingKey(`spot-${key}`);
    try {
      const res = await fetch(
        `/api/admin/homepage-banners/spot/${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            subtitle: form.subtitle || null,
            href: form.href,
            image: form.image.trim() === "" ? "" : normalizeImageUrl(form.image),
            imageAlt: form.imageAlt.trim() === "" ? "" : form.imageAlt,
            objectFit: form.objectFit,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(formatApiError(data, res.status));
      await fetchBanners();
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Homepage"
        description="Modifica i 5 banner editoriali visibili in homepage (immagine, titolo, sottotitolo)."
      />

      {loading && (
        <p className="text-sm text-muted">Sincronizzazione con il database…</p>
      )}

      {fetchError && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Attenzione</p>
          <p className="mt-1">{fetchError}</p>
          <p className="mt-2 text-amber-800">
            Puoi comunque modificare i banner qui sotto. Se il salvataggio fallisce,
            esegui le migration del database (<code className="text-xs">npm run db:push</code>{" "}
            in locale o <code className="text-xs">prisma migrate deploy</code> in produzione).
          </p>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Categorie in evidenza
        </h2>
        {HOMEPAGE_CATEGORY_SLUGS.map((slug) => (
          <HomeBannerEditor
            key={slug}
            label={CATEGORY_LABELS[slug]}
            description="Il link punta automaticamente alla categoria."
            values={categoryForms[slug]}
            onChange={(values) =>
              setCategoryForms((prev) => ({ ...prev, [slug]: values }))
            }
            onSave={() => saveCategory(slug)}
            saving={savingKey === `cat-${slug}`}
            wide={!!CATEGORY_DEFAULTS[slug].wide}
          />
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Lookbook & dettagli
        </h2>
        {HOME_SPOT_KEYS.map((key) => (
          <HomeBannerEditor
            key={key}
            label={SPOT_LABELS[key]}
            values={spotForms[key]}
            onChange={(values) =>
              setSpotForms((prev) => ({ ...prev, [key]: values }))
            }
            onSave={() => saveSpot(key)}
            saving={savingKey === `spot-${key}`}
            hrefEditable
          />
        ))}
      </div>
    </div>
  );
}
