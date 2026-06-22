"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useAdminT } from "./admin-locale-provider";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  X,
  Wand2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import ProductImagePreview from "@/components/admin/product-image-preview";
import AdminSaveActions, {
  type SaveFeedback,
} from "@/components/admin/admin-save-actions";
import AdminImageField from "@/components/admin/admin-image-field";
import ColorHexField from "@/components/ui/color-hex-field";
import { slugify } from "@/lib/slug";
import {
  generateProductSku,
  generateVariantMatrix,
  recalculateVariantSkus,
  sortVariants,
  sortSizes,
  type VariantDraft,
} from "@/lib/sku";
import {
  getDefaultSizesForCategory,
  US_SIZES,
} from "@/lib/product-templates";
import type { ImageFit } from "@/lib/image-fit";
import { normalizeImageFit } from "@/lib/image-fit";
import { createProductFormSnapshot } from "@/lib/product-form-snapshot";
import {
  imageColorHex,
  linkImageToColor,
} from "@/lib/product-color-images";
import { uniqueColors } from "@/lib/colors";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImageField {
  url: string;
  alt: string;
  position: number;
  objectFit: ImageFit;
  colorHex?: string | null;
}

function mapImageField(
  img: {
    url: string;
    alt?: string | null;
    position?: number;
    objectFit?: string | null;
    colorHex?: string | null;
  },
  index: number
): ImageField {
  return {
    url: img.url,
    alt: img.alt || "",
    position: img.position ?? index,
    objectFit: normalizeImageFit(img.objectFit ?? null),
    colorHex: imageColorHex(img.colorHex),
  };
}

type VariantField = VariantDraft;

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
  hideSaveActions?: boolean;
  onStatusChange?: (status: ProductFormStatus) => void;
}

export type ProductFormStatus = {
  loading: boolean;
  saveFeedback: SaveFeedback;
  saveLabel: string;
  isDirty: boolean;
};

export type ProductFormHandle = {
  submit: () => void;
};

const DEFAULT_STOCK_KEY = "eshop-admin-default-stock";

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

const ProductForm = forwardRef<ProductFormHandle, ProductFormProps>(
  function ProductForm(
    { productId, initialData, hideSaveActions = false, onStatusChange },
    ref
  ) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;
  const t = useAdminT();
  const pt = (k: string, vars?: Record<string, string | number>) => t(`admin.products.${k}`, vars);
  const [currentProductId, setCurrentProductId] = useState(productId);
  const isEdit = !!currentProductId;

  useImperativeHandle(ref, () => ({
    submit: () => formRef.current?.requestSubmit(),
  }));

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [skuStatus, setSkuStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const skuCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [images, setImages] = useState<ImageField[]>(() =>
    (initialData?.images || [{ url: "", alt: "", position: 0, objectFit: "cover" }]).map(
      mapImageField
    )
  );
  const [variants, setVariants] = useState<VariantField[]>(() =>
    sortVariants(initialData?.variants || [emptyVariant()])
  );

  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [matrixColors, setMatrixColors] = useState<{ name: string; hex: string }[]>([
    { name: "Nero", hex: "#000000" },
  ]);
  const [defaultStock, setDefaultStock] = useState("10");

  const buildSnapshot = useCallback(
    () =>
      createProductFormSnapshot({
        name,
        slug,
        description,
        price,
        comparePrice,
        sku,
        barcode,
        weight,
        featured,
        active,
        tags,
        categoryId,
        images,
        variants,
      }),
    [
      name,
      slug,
      description,
      price,
      comparePrice,
      sku,
      barcode,
      weight,
      featured,
      active,
      tags,
      categoryId,
      images,
      variants,
    ]
  );

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    createProductFormSnapshot({
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price?.toString() || "",
      comparePrice: initialData?.comparePrice?.toString() || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      weight: initialData?.weight?.toString() || "",
      featured: initialData?.featured ?? false,
      active: initialData?.active ?? true,
      tags: initialData?.tags?.join(", ") || "",
      categoryId: initialData?.categoryId || "",
      images: (initialData?.images || [
        { url: "", alt: "", position: 0, objectFit: "cover" as const },
      ]).map(mapImageField),
      variants: sortVariants(initialData?.variants || [emptyVariant()]),
    })
  );

  const isDirty = buildSnapshot() !== savedSnapshot;

  const markSaved = useCallback(
    (snapshot?: string) => {
      setSavedSnapshot(snapshot ?? buildSnapshot());
    },
    [buildSnapshot]
  );

  const handleLinkImageColor = (imageIndex: number, colorHex: string | null) => {
    const normalized = imageColorHex(colorHex);
    const colorName = uniqueColors(variants).find(
      (color) => color.colorHex === normalized
    )?.color;

    setImages((current) => {
      const linked = linkImageToColor(current, imageIndex, normalized);
      return linked.map((image, index) => {
        if (index !== imageIndex || !normalized || !colorName || image.alt.trim()) {
          return image;
        }
        return {
          ...image,
          alt: `${name.trim() || pt("productNamePlaceholder", { color: "" }).replace(" {color}", "").replace("{color}", "")} ${colorName}`,
        };
      });
    });
    setActiveImageIndex(imageIndex);
  };

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(DEFAULT_STOCK_KEY);
    if (stored) setDefaultStock(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(DEFAULT_STOCK_KEY, defaultStock);
  }, [defaultStock]);

  useEffect(() => {
    onStatusChangeRef.current?.({
      loading,
      saveFeedback,
      saveLabel: isEdit ? pt("save") : pt("create"),
      isDirty,
    });
  }, [loading, saveFeedback, isEdit, isDirty]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const checkSkuAvailability = useCallback(
    (value: string) => {
      if (skuCheckTimer.current) clearTimeout(skuCheckTimer.current);

      if (!value.trim()) {
        setSkuStatus("idle");
        return;
      }

      setSkuStatus("checking");
      skuCheckTimer.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ sku: value.trim() });
          if (currentProductId) params.set("excludeProductId", currentProductId);
          const res = await fetch(`/api/admin/products/check-sku?${params}`);
          const data = await res.json();
          setSkuStatus(data.available ? "available" : "taken");
        } catch {
          setSkuStatus("idle");
        }
      }, 400);
    },
    [currentProductId]
  );

  useEffect(() => {
    if (sku) checkSkuAvailability(sku);
  }, [sku, checkSkuAvailability]);

  const pf = (k: string) => t(`admin.productForm.${k}`);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit || !slug) {
      setSlug(slugify(value));
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);

    if (isEdit) return;

    const cat = categories.find((c) => c.id === newCategoryId);
    if (!cat) return;

    const hasFilledVariants = variants.some(
      (v) => v.sku || v.size || v.color || parseInt(v.stock) > 0
    );

    if (hasFilledVariants) {
      if (!confirm(pf("applyDefaultSizes"))) return;
    }

    setSelectedSizes(getDefaultSizesForCategory(cat.slug));
  };

  const handleGenerateSku = () => {
    if (!name.trim()) {
      setError(pt("enterNameBeforeSku"));
      return;
    }
    if (!selectedCategory) {
      setError(pt("selectCategoryFirst"));
      return;
    }

    setError("");
    setSku(
      generateProductSku({
        categorySlug: selectedCategory.slug,
        productName: name,
      })
    );
  };

  const setVariantsOrdered = (next: VariantField[]) => {
    setVariants(sortVariants(next));
  };

  const handleGenerateMatrix = (colorsOnly = false) => {
    if (!sku.trim()) {
      setError(pf("generateSkuFirst"));
      return;
    }

    if (selectedSizes.length === 0) {
      setError(pf("selectAtLeastOneSize"));
      return;
    }

    setError("");
    const colors = colorsOnly ? [] : matrixColors.filter((c) => c.name.trim());
    const generated = generateVariantMatrix({
      baseSku: sku.trim(),
      sizes: selectedSizes,
      colors,
      defaultStock: parseInt(defaultStock) || 10,
    });
    setVariantsOrdered(generated);
  };

  const handleRecalculateVariantSkus = () => {
    if (!sku.trim()) return;
    if (!confirm(pt("recalculateConfirm"))) return;
    setVariantsOrdered(recalculateVariantSkus(variants, sku.trim()));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      const next = prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size];
      return sortSizes(next);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveFeedback(null);

    if (skuStatus === "taken") {
      setSaveFeedback({ type: "error", text: pt("skuTakenError") });
      return;
    }

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
      images: images
        .filter((img) => img.url.trim())
        .map((img, i) => ({
          url: img.url.trim(),
          alt: img.alt || null,
          objectFit: img.objectFit,
          colorHex: imageColorHex(img.colorHex),
          position: i,
        })),
      variants: sortVariants(variants).map((v) => ({
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
      const wasCreate = !currentProductId;
      const url = currentProductId
        ? `/api/admin/products/${currentProductId}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: currentProductId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || pt("saveFailed"));
      }

      if (wasCreate && data.id) {
        setCurrentProductId(data.id);
        router.replace(`/admin/products/${data.id}`, { scroll: false });
      }

      setSaveFeedback({
        type: "success",
        text: wasCreate ? pt("createSuccess") : pt("saveSuccess"),
      });

      if (data.images) {
        const savedImages = data.images as Array<{
          url: string;
          alt?: string | null;
          objectFit?: string | null;
          colorHex?: string | null;
          position?: number;
        }>;
        const nextImages =
          savedImages.length > 0
            ? savedImages.map(mapImageField)
            : [{ url: "", alt: "", position: 0, objectFit: "cover" as const, colorHex: null }];

        setImages(nextImages);
        markSaved(
          createProductFormSnapshot({
            name,
            slug,
            description,
            price,
            comparePrice,
            sku,
            barcode,
            weight,
            featured,
            active,
            tags,
            categoryId,
            images: nextImages,
            variants,
          })
        );
      } else {
        markSaved();
      }

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : pt("saveFailed");
      setSaveFeedback({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-none">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 min-w-0">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

        <section className="border border-border bg-white p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-bold">{pt("basicInfo")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={pt("name")}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <Input
              label={pt("name")}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {pt("descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {pt("category")}
            </label>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">{pt("selectCategoryLabel")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {selectedCategory && !isEdit && (
              <p className="mt-1 text-xs text-muted">
                {pt("sizeTemplate", { sizes: getDefaultSizesForCategory(selectedCategory.slug).join(", ") })}
              </p>
            )}
          </div>
        </section>

        <section className="border border-border bg-white p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-bold">{pt("pricing")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={pt("priceEuro")}
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label={pt("comparePrice")}
              type="number"
              step="0.01"
              min="0"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-muted mb-2">
              {pt("productSku")}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className={`flex-1 px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-foreground ${
                  skuStatus === "taken" ? "border-red-500" : "border-border"
                }`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateSku}
                title={pt("generateSku")}
                className="shrink-0"
              >
                <Wand2 size={16} className="mr-1.5" />
                {pt("generate")}
              </Button>
            </div>
            {skuStatus === "checking" && (
              <p className="mt-1 text-xs text-muted">{pt("checkingAvailability")}</p>
            )}
            {skuStatus === "available" && sku && (
              <p className="mt-1 text-xs text-green-600">{pt("skuAvailable")}</p>
            )}
            {skuStatus === "taken" && (
              <p className="mt-1 text-xs text-red-600">{pt("skuTaken")}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded"
              />
              {pt("featured")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded"
              />
              {pt("active")}
            </label>
          </div>
        </section>

        <section className="border border-border bg-white p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-bold">{pt("images")}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {!hideSaveActions && (
                <AdminSaveActions
                  saveLabel={isEdit ? pt("save") : pt("create")}
                  saving={loading}
                  saveFeedback={saveFeedback}
                  onSave={() => formRef.current?.requestSubmit()}
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImages([
                    ...images,
                    {
                      url: "",
                      alt: "",
                      position: images.length,
                      objectFit: "cover",
                      colorHex: null,
                    },
                  ]);
                  setActiveImageIndex(images.length);
                }}
              >
                <Plus size={16} className="mr-1" />
                {pt("addImage")}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] gap-6 lg:gap-8 items-start">
            <div className="space-y-4 min-w-0">
              {images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative border bg-surface p-4 rounded-lg space-y-3 cursor-pointer transition-colors ${
                    activeImageIndex === index
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border"
                  }`}
                >
                  {imageColorHex(img.colorHex) && (
                    <span
                      className="absolute top-3 left-3 z-10 w-4 h-4 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: imageColorHex(img.colorHex) ?? undefined }}
                      title={pt("linkedToColor")}
                    />
                  )}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = images.filter((_, i) => i !== index);
                        setImages(next);
                        setActiveImageIndex((current) => {
                          if (current === index) {
                            return Math.max(0, index - 1);
                          }
                          if (current > index) return current - 1;
                          return current;
                        });
                      }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                      title={pt("deleteImageSlot")}
                    >
                      <X size={18} />
                    </button>
                  )}
                  {images.length > 1 && (
                    <p className="text-xs uppercase tracking-widest text-muted">
                      {pt("imageSlot", { number: index + 1 })}
                    </p>
                  )}
                  <AdminImageField
                    values={{
                      image: img.url,
                      imageAlt: img.alt,
                      objectFit: img.objectFit,
                    }}
                    onChange={({ image, imageAlt, objectFit }) => {
                      setActiveImageIndex(index);
                      setImages(
                        images.map((im, i) =>
                          i === index
                            ? { ...im, url: image, alt: imageAlt, objectFit }
                            : im
                        )
                      );
                    }}
                    altPlaceholder={`${name}${images.length > 1 ? ` ${index + 1}` : ""}`}
                  />
                </div>
              ))}
            </div>
            <ProductImagePreview
              images={images}
              variants={variants}
              activeIndex={activeImageIndex}
              onSelect={setActiveImageIndex}
              onLinkColor={handleLinkImageColor}
              name={name}
            />
          </div>
        </section>

        <section className="border border-border bg-white p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold">{pt("variants")}</h2>
            <div className="flex gap-2 flex-wrap">
              {variants.some((v) => v.sku) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRecalculateVariantSkus}
                >
                  <RefreshCw size={14} className="mr-1" />
                  {pt("recalculateSku")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVariantsOrdered([...variants, emptyVariant()])}
              >
                <Plus size={16} className="mr-1" />
                {pt("addVariant")}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-surface border border-border space-y-4">
            <h3 className="text-sm font-semibold">{pt("generateVariants")}</h3>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted mb-2">
                {pt("usSizes")}
              </p>
              <div className="flex flex-wrap gap-2">
                {US_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
                      selectedSizes.includes(size)
                        ? "border-foreground bg-foreground text-white"
                        : "border-border text-muted hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
                {pt("colors")}
              </p>
              {matrixColors.map((color, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-start">
                  <div className="flex-1 min-w-[140px]">
                    <Input
                      label={index === 0 ? pt("colorName") : undefined}
                      value={color.name}
                      onChange={(e) =>
                        setMatrixColors(
                          matrixColors.map((c, i) =>
                            i === index ? { ...c, name: e.target.value } : c
                          )
                        )
                      }
                      placeholder={pt("colorPlaceholder")}
                    />
                  </div>
                  <div className="flex-[2] min-w-0">
                    <ColorHexField
                      label={index === 0 ? pt("hex") : undefined}
                      value={color.hex}
                      onChange={(hex) =>
                        setMatrixColors(
                          matrixColors.map((c, i) =>
                            i === index ? { ...c, hex } : c
                          )
                        )
                      }
                    />
                  </div>
                  {matrixColors.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setMatrixColors(matrixColors.filter((_, i) => i !== index))
                      }
                      className="pb-3 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setMatrixColors([...matrixColors, { name: "", hex: "" }])
                }
              >
                <Plus size={14} className="mr-1" />
                {pt("addColor")}
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-full sm:w-32">
                <Input
                  label={pt("defaultStock")}
                  type="number"
                  min="0"
                  value={defaultStock}
                  onChange={(e) => setDefaultStock(e.target.value)}
                />
              </div>
              <Button type="button" onClick={() => handleGenerateMatrix(false)}>
                {pt("generateGrid")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerateMatrix(true)}
              >
                {pt("sizesOnly")}
              </Button>
            </div>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="p-4 bg-surface space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  label={pt("variantName")}
                  value={variant.name}
                  onChange={(e) =>
                    setVariants(
                      variants.map((v, i) =>
                        i === index ? { ...v, name: e.target.value } : v
                      )
                    )
                  }
                  required
                />
                <Input
                  label={pt("variantSku")}
                  value={variant.sku}
                  onChange={(e) =>
                    setVariants(
                      variants.map((v, i) =>
                        i === index ? { ...v, sku: e.target.value } : v
                      )
                    )
                  }
                  required
                />
                <Input
                  label={pt("size")}
                  value={variant.size}
                  onChange={(e) =>
                    setVariants(
                      variants.map((v, i) =>
                        i === index ? { ...v, size: e.target.value } : v
                      )
                    )
                  }
                />
                <Input
                  label={pt("variantStock")}
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) =>
                    setVariants(
                      variants.map((v, i) =>
                        i === index ? { ...v, stock: e.target.value } : v
                      )
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label={pt("color")}
                  value={variant.color}
                  onChange={(e) =>
                    setVariants(
                      variants.map((v, i) =>
                        i === index ? { ...v, color: e.target.value } : v
                      )
                    )
                  }
                />
                <ColorHexField
                  label={pt("colorHex")}
                  value={variant.colorHex}
                  onChange={(colorHex) =>
                    setVariants(
                      variants.map((v, i) =>
                        i === index ? { ...v, colorHex } : v
                      )
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  label={pt("priceOverride")}
                  type="number"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) =>
                    setVariants(
                      variants.map((v, i) =>
                        i === index ? { ...v, price: e.target.value } : v
                      )
                    )
                  }
                />
                <div className="flex items-end pb-1">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setVariantsOrdered(variants.filter((_, i) => i !== index))
                      }
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                      {pt("remove")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="border border-border bg-white p-4 sm:p-6 space-y-4">
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-xl font-bold">{pt("advanced")}</h2>
            {advancedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {advancedOpen && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={pt("barcode")}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <Input
                  label={pt("weight")}
                  type="number"
                  step="0.01"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <Input
                label={pt("tags")}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          )}
        </section>

        {!hideSaveActions && (
          <AdminSaveActions
            size="lg"
            saveLabel={isEdit ? pt("save") : pt("create")}
            saving={loading}
            saveFeedback={saveFeedback}
          />
        )}
      </form>
    </div>
  );
});

export default ProductForm;
