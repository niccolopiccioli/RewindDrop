export type ImageFit = "cover" | "contain";

export const IMAGE_FIT_OPTIONS: {
  value: ImageFit;
  label: string;
  description: string;
}[] = [
  {
    value: "cover",
    label: "Riempie",
    description: "Adatta allo spazio, ritaglia se necessario",
  },
  {
    value: "contain",
    label: "Intera",
    description: "Mostra l'immagine completa",
  },
];

export function normalizeImageFit(value?: string | null): ImageFit {
  return value === "contain" ? "contain" : "cover";
}
