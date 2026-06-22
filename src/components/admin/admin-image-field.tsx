"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import MediaImage from "@/components/ui/media-image";
import Input from "@/components/ui/input";
import ImageFitSelect from "@/components/ui/image-fit-select";
import type { ImageFit } from "@/lib/image-fit";
import { normalizeImageUrl } from "@/lib/image-url";
import { useAdminT } from "./admin-locale-provider";

export type AdminImageValues = {
  image: string;
  imageAlt: string;
  objectFit: ImageFit;
};

type AdminImageFieldProps = {
  values: AdminImageValues;
  onChange: (values: AdminImageValues) => void;
  altPlaceholder?: string;
  hidePreview?: boolean;
};

export default function AdminImageField({
  values,
  onChange,
  altPlaceholder,
  hidePreview = false,
}: AdminImageFieldProps) {
  const t = useAdminT();
  const ht = (k: string) => t(`admin.homepage.${k}`);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const patch = (partial: Partial<AdminImageValues>) => {
    onChange({ ...values, ...partial });
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      patch({
        image: data.url,
        imageAlt: values.imageAlt || altPlaceholder || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.common.error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Input
        label={ht("image")}
        value={values.image}
        onChange={(e) => {
          const image = normalizeImageUrl(e.target.value);
          patch({
            image,
            ...(!values.imageAlt && altPlaceholder
              ? { imageAlt: altPlaceholder }
              : {}),
          });
        }}
        onBlur={(e) => {
          const image = normalizeImageUrl(e.target.value);
          if (image !== values.image) {
            patch({ image });
          }
        }}
        placeholder="https://images.unsplash.com/..."
      />
      <Input
        label="Alt text"
        value={values.imageAlt}
        onChange={(e) => patch({ imageAlt: e.target.value })}
        placeholder={altPlaceholder}
      />
      <ImageFitSelect
        value={values.objectFit}
        onChange={(objectFit) => patch({ objectFit })}
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <Upload size={16} />
          <span>{t("admin.products.addImage")}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImageUpload(file);
            }}
          />
        </label>
        {uploading && (
          <span className="text-sm text-gray-500">{t("admin.common.loading")}</span>
        )}
        {values.image && (
          <button
            type="button"
            onClick={() => patch({ image: "", imageAlt: "" })}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
          >
            <X size={14} />
            {t("admin.products.remove")}
          </button>
        )}
        {!hidePreview && (
          <div className="relative ml-auto w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-border bg-surface">
            <MediaImage
              src={values.image}
              alt={values.imageAlt || altPlaceholder || ""}
              fill
              fit={values.objectFit}
              sizes="64px"
              iconClassName="w-5 h-5"
            />
          </div>
        )}
      </div>
    </div>
  );
}