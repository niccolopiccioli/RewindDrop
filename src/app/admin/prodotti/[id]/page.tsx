"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/admin/product-form";
import Button from "@/components/ui/button";

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <p className="text-gray-500">Caricamento...</p>;
  }

  if (!product) {
    return <p className="text-red-600">Prodotto non trovato</p>;
  }

  const images = (product.images as Array<Record<string, unknown>>) || [];
  const variants = (product.variants as Array<Record<string, unknown>>) || [];

  return (
    <div>
      <PageHeader
        title="Modifica prodotto"
        description={product.name as string}
        action={
          <Link
            href={`/prodotti/${product.slug as string}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink size={16} className="mr-1.5" />
              Vedi nel negozio
            </Button>
          </Link>
        }
      />
      <ProductForm
        productId={params.id as string}
        initialData={{
          name: product.name as string,
          slug: product.slug as string,
          description: product.description as string,
          price: product.price as number,
          comparePrice: product.comparePrice as number | null,
          sku: product.sku as string,
          barcode: product.barcode as string | null,
          weight: product.weight as number | null,
          featured: product.featured as boolean,
          active: product.active as boolean,
          tags: product.tags as string[],
          categoryId: product.categoryId as string,
          images: images.map((img, i) => ({
            url: img.url as string,
            alt: (img.alt as string) || "",
            position: (img.position as number) ?? i,
          })),
          variants: variants.map((v) => ({
            name: v.name as string,
            sku: v.sku as string,
            size: (v.size as string) || "",
            color: (v.color as string) || "",
            colorHex: (v.colorHex as string) || "",
            price: v.price ? String(v.price) : "",
            stock: String(v.stock),
            active: v.active as boolean,
          })),
        }}
      />
    </div>
  );
}
