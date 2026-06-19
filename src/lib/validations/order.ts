import { z } from "zod";

const orderStatuses = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(orderStatuses).optional(),
  notes: z.string().max(2000).optional(),
}).refine((d) => d.status !== undefined || d.notes !== undefined, {
  message: "Almeno un campo da aggiornare",
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
