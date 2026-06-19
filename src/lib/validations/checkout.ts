import { z } from "zod";

export const shippingAddressSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  street: z.string().min(3, "Indirizzo richiesto"),
  street2: z.string().optional(),
  city: z.string().min(2, "Città richiesta"),
  province: z.string().optional(),
  postalCode: z.string().min(4, "CAP richiesto"),
  country: z.string().default("IT"),
  phone: z.string().min(6, "Telefono richiesto"),
  email: z.string().email("Email non valida").optional(),
});

export const checkoutItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const paymentMethodSchema = z.enum([
  "card",
  "paypal",
  "klarna",
  "satispay",
  "scalapay",
  "cod",
  "bank_transfer",
]);

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Carrello vuoto"),
  shippingAddress: shippingAddressSchema,
  saveAddress: z.boolean().optional(),
  addressId: z.string().optional(),
  paymentMethod: paymentMethodSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
