import type { ImageFit } from "@/lib/image-fit";
import { EDITORIAL_IMAGES } from "@/lib/mock-images";

export const HOMEPAGE_CATEGORY_SLUGS = ["felpe", "t-shirts", "giacche"] as const;
export type HomepageCategorySlug = (typeof HOMEPAGE_CATEGORY_SLUGS)[number];

export const HOME_SPOT_KEYS = ["lookbook", "details"] as const;
export type HomeSpotKey = (typeof HOME_SPOT_KEYS)[number];

export const CATEGORY_DEFAULTS: Record<
  HomepageCategorySlug,
  {
    title: string;
    subtitle: string;
    image: string;
    imageAlt: string;
    wide?: boolean;
  }
> = {
  felpe: {
    title: "Felpe",
    subtitle: "Comfort e stile",
    image: EDITORIAL_IMAGES.felpe,
    imageAlt: "Modelle in passerella backstage durante una sfilata",
  },
  "t-shirts": {
    title: "T-Shirts",
    subtitle: "Essenziali",
    image: EDITORIAL_IMAGES.tShirts,
    imageAlt: "Gruppo in abbigliamento casual di stile",
  },
  giacche: {
    title: "Giacche",
    subtitle: "Outerwear",
    image: EDITORIAL_IMAGES.giacche,
    imageAlt: "Uomo con giacca nera",
    wide: true,
  },
};

export const SPOT_DEFAULTS: Record<
  HomeSpotKey,
  {
    title: string;
    subtitle: string;
    href: string;
    image: string;
    imageAlt: string;
  }
> = {
  lookbook: {
    title: "Lookbook",
    subtitle: "Milano",
    href: "/products",
    image: EDITORIAL_IMAGES.lookbook,
    imageAlt: "Ritratto in bianco e nero di donna con maglia a maniche lunghe",
  },
  details: {
    title: "Dettagli",
    subtitle: "Texture & materiali",
    href: "/products",
    image: EDITORIAL_IMAGES.details,
    imageAlt: "Manichino davanti alle vetrine",
  },
};

export const CATEGORY_LABELS: Record<HomepageCategorySlug, string> = {
  felpe: "Felpe — banner doppio (sinistra)",
  "t-shirts": "T-Shirts — banner doppio (destra)",
  giacche: "Giacche — banner wide",
};

export const SPOT_LABELS: Record<HomeSpotKey, string> = {
  lookbook: "Lookbook — griglia (sinistra)",
  details: "Dettagli — griglia (destra)",
};

export function defaultCategoryForm(slug: HomepageCategorySlug) {
  const d = CATEGORY_DEFAULTS[slug];
  return {
    title: d.title,
    subtitle: d.subtitle,
    href: `/products?category=${slug}`,
    image: d.image,
    imageAlt: d.imageAlt,
    objectFit: "cover" as ImageFit,
  };
}

export function defaultSpotForm(key: HomeSpotKey) {
  const d = SPOT_DEFAULTS[key];
  return {
    title: d.title,
    subtitle: d.subtitle,
    href: d.href,
    image: d.image,
    imageAlt: d.imageAlt,
    objectFit: "cover" as ImageFit,
  };
}

export function buildDefaultCategoryForms() {
  return Object.fromEntries(
    HOMEPAGE_CATEGORY_SLUGS.map((slug) => [slug, defaultCategoryForm(slug)])
  );
}

export function buildDefaultSpotForms() {
  return Object.fromEntries(
    HOME_SPOT_KEYS.map((key) => [key, defaultSpotForm(key)])
  );
}
