"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import ProductForm, {
  type ProductFormHandle,
  type ProductFormStatus,
} from "@/components/admin/product-form";
import AdminSaveActions from "@/components/admin/admin-save-actions";
import UnsavedChangesDialog from "@/components/admin/unsaved-changes-dialog";
import Button from "@/components/ui/button";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { normalizeImageFit } from "@/lib/image-fit";
import { useAdminT } from "@/components/admin/admin-locale-provider";

export default function EditProductPage() {
  const params = useParams();
  const formRef = useRef<ProductFormHandle>(null);
  const t = useAdminT();
  const pt = (k: string) => t(`admin.products.${k}`);
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<ProductFormStatus>({
    loading: false,
    saveFeedback: null,
    saveLabel: pt("save"),
    isDirty: false,
  });
  const guard = useUnsavedChangesGuard(formStatus.isDirty);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <p className="text-gray-500">{t("admin.common.loading")}</p>;
  }

  if (!product) {
    return <p className="text-red-600">{pt("productNotFound")}</p>;
  }

  const images = (product.images as Array<Record<string, unknown>>) || [];
  const variants = (product.variants as Array<Record<string, unknown>>) || [];

  return (
    <div>
      <PageHeader
        title={pt("editProduct")}
        description={product.name as string}
        onBack={() => guard.confirmHref("/admin/products")}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <AdminSaveActions
              size="lg"
              saveLabel={formStatus.saveLabel}
              saving={formStatus.loading}
              saveFeedback={formStatus.saveFeedback}
              onSave={() => formRef.current?.submit()}
            />
            <a
              href={`/products/${product.slug as string}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" type="button">
                <ExternalLink size={16} className="mr-1.5" />
                {pt("seeInShop")}
              </Button>
            </a>
          </div>
        }
      />
      <ProductForm
        ref={formRef}
        hideSaveActions
        onStatusChange={setFormStatus}
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
            objectFit: normalizeImageFit(img.objectFit as string | null),
            colorHex: (img.colorHex as string) || null,
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
      <UnsavedChangesDialog
        open={guard.open}
        onStay={guard.stayOnPage}
        onLeave={guard.leaveWithoutSaving}
      />
    </div>
  );
}