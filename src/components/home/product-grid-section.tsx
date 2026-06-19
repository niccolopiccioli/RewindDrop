"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/product-card";
import SectionHeader from "@/components/ui/section-header";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  featured?: boolean;
  images: { url: string; alt?: string | null }[];
  variants: { size?: string | null; stock: number }[];
}

export default function ProductGridSection({
  title,
  href,
  params = {},
  badge,
}: {
  title: string;
  href: string;
  params?: Record<string, string>;
  badge?: "new" | "sale" | null;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams({ limit: "8", ...params });
    fetch(`/api/products?${searchParams}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, [JSON.stringify(params)]);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <SectionHeader title={title} href={href} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-surface mb-3" />
                <div className="h-3 bg-surface w-3/4 mb-2" />
                <div className="h-3 bg-surface w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container-wide">
        <SectionHeader title={title} href={href} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} badge={badge} />
          ))}
        </div>
      </div>
    </section>
  );
}
