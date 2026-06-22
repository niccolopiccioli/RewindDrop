"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/product-card";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  featured?: boolean;
  images: { url: string }[];
  variants: { size?: string | null; stock: number }[];
  category: { name: string; slug: string };
};

import { useI18n } from "@/components/layout/locale-provider";

export default function WishlistPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));
  }, []);

  if (products.length === 0) {
    return <p className="text-sm text-muted">{t("account.wishlistEmpty")}</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
