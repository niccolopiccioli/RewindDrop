import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password minimo 6 caratteri"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const addressSchema = z.object({
  name: z.string().min(2),
  street: z.string().min(3),
  street2: z.string().optional(),
  city: z.string().min(2),
  province: z.string().optional(),
  postalCode: z.string().min(4),
  country: z.string().default("IT"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(2000).optional(),
});
