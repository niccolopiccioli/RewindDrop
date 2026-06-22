import { z } from "zod";

const imageFitSchema = z.enum(["cover", "contain"]).default("cover");

export const imageSchema = z.object({
  url: z.string().min(1, "URL obbligatorio"),
  alt: z.string().optional().nullable(),
  objectFit: imageFitSchema.optional(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  position: z.number().int().min(0).default(0),
});

export const variantSchema = z.object({
  name: z.string().min(1, "Nome variante obbligatorio"),
  sku: z.string().min(1, "SKU obbligatorio"),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  price: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido"),
  description: z.string().min(1, "Descrizione obbligatoria"),
  price: z.number().positive("Prezzo deve essere positivo"),
  comparePrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU obbligatorio"),
  barcode: z.string().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().min(1, "Categoria obbligatoria"),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).min(1, "Almeno una variante richiesta"),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1).optional(),
  barcode: z.string().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().min(1).optional(),
  images: z.array(imageSchema).optional(),
  variants: z.array(variantSchema).optional(),
});

export const imageUpdateSchema = z.object({
  url: z.string().min(1).optional(),
  alt: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
});

export const imageReorderSchema = z.object({
  order: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    })
  ),
});

export const stockUpdateSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("set"), value: z.number().int().min(0) }),
  z.object({ operation: z.literal("increment"), value: z.number().int().min(1) }),
  z.object({ operation: z.literal("decrement"), value: z.number().int().min(1) }),
]);

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
