"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X } from "lucide-react";
import MediaImage from "@/components/ui/media-image";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { slugify } from "@/lib/slug";

interface Category {
  id: string;
  name: string;
}

interface ImageField {
  url: string;
  alt: string;
  position: number;
}

interface VariantField {
  name: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  stock: string;
  active: boolean;
}

interface ProductFormProps {
  productId?: string;
  initialData?: {
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice: number | null;
    sku: string;
    barcode?: string | null;
    weight?: number | null;
    featured: boolean;
    active: boolean;
    tags: string[];
    categoryId: string;
    images: ImageField[];
    variants: VariantField[];
  };
}

const emptyVariant = (): VariantField => ({
  name: "UNI",
  sku: "",
  size: "",
  color: "",
  colorHex: "",
  price: "",
  stock: "0",
  active: true,
});

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [comparePrice, setComparePrice] = useState(
    initialData?.comparePrice?.toString() || ""
  );
  const [sku, setSku] = useState(initialData?.sku || "");
  const [barcode, setBarcode] = useState(initialData?.barcode || "");
  const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [images, setImages] = useState<ImageField[]>(
    initialData?.images || [{ url: "", alt: "", position: 0 }]
  );
  const [variants, setVariants] = useState<VariantField[]>(
    initialData?.variants || [emptyVariant()]
  );
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit || !slug) {
      setSlug(slugify(value));
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploading(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, url: data.url } : img))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fallito");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name,
      slug,
      description,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      sku,
      barcode: barcode || null,
      weight: weight ? parseFloat(weight) : null,
      featured,
      active,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      categoryId,
      images: images.filter((img) => img.url),
      variants: variants.map((v) => ({
        name: v.name,
        sku: v.sku,
        size: v.size || null,
        color: v.color || null,
        colorHex: v.colorHex || null,
        price: v.price ? parseFloat(v.price) : null,
        stock: parseInt(v.stock) || 0,
        active: v.active,
      })),
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore nel salvataggio");
      }

      router.push("/admin/prodotti");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      <section className="border border-border bg-white p-6 space-y-4">
        <h2 className="text-xl font-bold">Informazioni base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Seleziona categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Tags (separati da virgola)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </section>

      <section className="border border-border bg-white p-6 space-y-4">
        <h2 className="text-xl font-bold">Prezzi e SKU</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Prezzo (€)"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <Input
            label="Prezzo confronto (€)"
            type="number"
            step="0.01"
            min="0"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
          />
          <Input
            label="SKU prodotto"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.01"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded"
            />
            In evidenza
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded"
            />
            Attivo
          </label>
        </div>
      </section>

      <section className="border border-border bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Immagini</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setImages([...images, { url: "", alt: "", position: images.length }])
            }
          >
            <Plus size={16} className="mr-1" />
            Aggiungi
          </Button>
        </div>
        {images.map((img, index) => (
          <div key={index} className="flex gap-4 items-start p-4 bg-surface">
            <div
              className="relative w-28 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-white border border-border"
            >
              <MediaImage
                src={img.url}
                alt={img.alt || ""}
                fill
                fit="contain"
                sizes="112px"
                iconClassName="w-5 h-5"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Input
                label="URL immagine"
                value={img.url}
                onChange={(e) =>
                  setImages(images.map((im, i) =>
                    i === index ? { ...im, url: e.target.value } : im
                  ))
                }
              />
              <Input
                label="Alt text"
                value={img.alt}
                onChange={(e) =>
                  setImages(images.map((im, i) =>
                    i === index ? { ...im, alt: e.target.value } : im
                  ))
                }
              />
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <Upload size={16} />
                <span>Carica file</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(index, file);
                  }}
                />
                {uploading === index && <span className="text-gray-500">Caricamento...</span>}
              </label>
            </div>
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setImages(images.filter((_, i) => i !== index))}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="border border-border bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Varianti</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVariants([...variants, emptyVariant()])}
          >
            <Plus size={16} className="mr-1" />
            Aggiungi
          </Button>
        </div>
        {variants.map((variant, index) => (
          <div key={index} className="p-4 bg-surface space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input
                label="Nome"
                value={variant.name}
                onChange={(e) =>
                  setVariants(variants.map((v, i) =>
                    i === index ? { ...v, name: e.target.value } : v
                  ))
                }
                required
              />
              <Input
                label="SKU"
                value={variant.sku}
                onChange={(e) =>
                  setVariants(variants.map((v, i) =>
                    i === index ? { ...v, sku: e.target.value } : v
                  ))
                }
                required
              />
              <Input
                label="Taglia"
                value={variant.size}
                onChange={(e) =>
                  setVariants(variants.map((v, i) =>
                    i === index ? { ...v, size: e.target.value } : v
                  ))
                }
              />
              <Input
                label="Stock"
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) =>
                  setVariants(variants.map((v, i) =>
                    i === index ? { ...v, stock: e.target.value } : v
                  ))
                }
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input
                label="Colore"
                value={variant.color}
                onChange={(e) =>
                  setVariants(variants.map((v, i) =>
                    i === index ? { ...v, color: e.target.value } : v
                  ))
                }
              />
              <Input
                label="Colore hex"
                value={variant.colorHex}
                onChange={(e) =>
                  setVariants(variants.map((v, i) =>
                    i === index ? { ...v, colorHex: e.target.value } : v
                  ))
                }
                placeholder="#000000"
              />
              <Input
                label="Prezzo override"
                type="number"
                step="0.01"
                value={variant.price}
                onChange={(e) =>
                  setVariants(variants.map((v, i) =>
                    i === index ? { ...v, price: e.target.value } : v
                  ))
                }
              />
              <div className="flex items-end pb-1">
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                    Rimuovi
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/prodotti")}
        >
          Annulla
        </Button>
        <Button type="submit" loading={loading} size="lg">
          {isEdit ? "Salva modifiche" : "Crea prodotto"}
        </Button>
      </div>
    </form>
  );
}
