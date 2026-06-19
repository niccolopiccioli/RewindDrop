import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido"),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  parentId: z.string().optional().nullable(),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
