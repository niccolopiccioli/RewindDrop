import { z } from "zod";
import { normalizeImageUrl } from "@/lib/image-url";

const imageField = z
  .string()
  .transform((value) => normalizeImageUrl(value))
  .pipe(
    z.union([
      z.literal(""),
      z.string().min(1),
    ])
  )
  .optional()
  .nullable();

export const homepageCategoryBannerSchema = z.object({
  name: z.string().min(1, "Titolo obbligatorio").optional(),
  bannerSubtitle: z.string().optional().nullable(),
  image: imageField,
  imageAlt: z.string().optional().nullable(),
  objectFit: z.enum(["cover", "contain"]).optional(),
});

export const homeSpotBannerSchema = z.object({
  title: z.string().min(1, "Titolo obbligatorio"),
  subtitle: z.string().optional().nullable(),
  href: z.string().min(1, "Link obbligatorio"),
  image: imageField,
  imageAlt: z.string().optional().nullable(),
  objectFit: z.enum(["cover", "contain"]).optional(),
});

export type HomepageCategoryBannerInput = z.infer<
  typeof homepageCategoryBannerSchema
>;
export type HomeSpotBannerInput = z.infer<typeof homeSpotBannerSchema>;
