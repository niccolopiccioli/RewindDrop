"use client";

import { useState } from "react";
import MediaImage from "@/components/ui/media-image";
import Input from "@/components/ui/input";
import AdminSaveActions, {
  type SaveFeedback,
} from "@/components/admin/admin-save-actions";
import AdminImageField from "@/components/admin/admin-image-field";
import type { ImageFit } from "@/lib/image-fit";
import { useAdminT } from "./admin-locale-provider";

export type BannerFormValues = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  imageAlt: string;
  objectFit: ImageFit;
};

type HomeBannerEditorProps = {
  label: string;
  description?: string;
  values: BannerFormValues;
  onChange: (values: BannerFormValues) => void;
  onSave: () => Promise<void>;
  saving?: boolean;
  hrefEditable?: boolean;
  wide?: boolean;
};

export default function HomeBannerEditor({
  label,
  description,
  values,
  onChange,
  onSave,
  saving = false,
  hrefEditable = false,
  wide = false,
}: HomeBannerEditorProps) {
  const t = useAdminT();
  const ht = (k: string) => t(`admin.homepage.${k}`);
  const ct = (k: string) => t(`admin.common.${k}`);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback>(null);

  const patch = (partial: Partial<BannerFormValues>) => {
    onChange({ ...values, ...partial });
  };

  const handleSave = async () => {
    setSaveFeedback(null);
    try {
      await onSave();
      setSaveFeedback({ type: "success", text: ct("saved") });
    } catch (err) {
      setSaveFeedback({
        type: "error",
        text: err instanceof Error ? err.message : ct("error"),
      });
    }
  };

  const previewClass = wide
    ? "aspect-[16/7] md:aspect-[21/9] w-full max-w-md"
    : "aspect-[3/4] md:aspect-[4/5] w-28";

  return (
    <section className="border border-border bg-white p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{label}</h3>
          {description && (
            <p className="text-sm text-muted mt-1">{description}</p>
          )}
        </div>
        <AdminSaveActions
          saving={saving}
          saveFeedback={saveFeedback}
          onSave={handleSave}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        <div
          className={`relative rounded-lg overflow-hidden flex-shrink-0 bg-surface border border-border ${previewClass}`}
        >
          <MediaImage
            src={values.image}
            alt={values.imageAlt || values.title}
            fill
            fit={values.objectFit}
            className="transition-transform duration-700 ease-out"
            sizes={wide ? "400px" : "112px"}
            iconClassName="w-8 h-8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
            <p className="text-display text-sm font-semibold text-white">
              {values.title || ht("titleLabel")}
            </p>
            {values.subtitle && (
              <p className="text-xs text-white/70">{values.subtitle}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label={ht("titleLabel")}
            value={values.title}
            onChange={(e) => {
              const title = e.target.value;
              patch({
                title,
                imageAlt:
                  !values.imageAlt || values.imageAlt === values.title
                    ? title
                    : values.imageAlt,
              });
            }}
            required
          />
          <Input
            label={ht("subtitle")}
            value={values.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
          />
          <Input
            label={ht("link")}
            value={values.href}
            onChange={(e) => patch({ href: e.target.value })}
            readOnly={!hrefEditable}
            className={!hrefEditable ? "opacity-70" : undefined}
          />
          <AdminImageField
            values={{
              image: values.image,
              imageAlt: values.imageAlt,
              objectFit: values.objectFit,
            }}
            onChange={({ image, imageAlt, objectFit }) =>
              patch({ image, imageAlt, objectFit })
            }
            altPlaceholder={values.title}
            hidePreview
          />
        </div>
      </div>
    </section>
  );
}