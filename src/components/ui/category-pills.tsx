"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";
import { stripLocaleFromPath } from "@/lib/i18n/routing";

type Category = { name: string; slug: string };

export default function CategoryPills() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paths = usePaths();
  const { t } = useI18n();
  const activeCategory = searchParams.get("category") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const barePath = stripLocaleFromPath(pathname);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories([
            { name: t("nav.all"), slug: "" },
            ...data.map((c: Category) => ({ name: c.name, slug: c.slug })),
          ]);
        }
      });
  }, [t]);

  if (barePath !== "/" && barePath !== "/products") return null;
  if (categories.length === 0) return null;

  return (
    <div className="overflow-x-auto overscroll-x-contain scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 min-w-max pb-1">
        {categories.map((cat) => {
          const isActive =
            cat.slug === activeCategory ||
            (cat.slug === "" && !activeCategory);

          const href = cat.slug
            ? paths.productsCategory(cat.slug)
            : paths.products;

          return (
            <Link
              key={cat.slug || "all"}
              href={href}
              className={`min-h-11 inline-flex items-center px-4 py-2.5 text-xs uppercase tracking-widest whitespace-nowrap rounded-full border transition-all duration-300 ${
                isActive
                  ? "bg-foreground text-white border-foreground"
                  : "bg-white text-foreground border-border hover:border-foreground"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
