import { describe, it, expect } from "vitest";
import { checkoutSchema, shippingAddressSchema } from "./checkout";

describe("checkoutSchema", () => {
  it("validates a minimal checkout payload", () => {
    const result = checkoutSchema.safeParse({
      items: [{ variantId: "var_1", quantity: 2 }],
      shippingAddress: {
        name: "Mario Rossi",
        street: "Via Roma 1",
        city: "Milano",
        postalCode: "20100",
        phone: "3331234567",
      },
      paymentMethod: "cod",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty cart", () => {
    const result = checkoutSchema.safeParse({
      items: [],
      shippingAddress: {
        name: "Mario Rossi",
        street: "Via Roma 1",
        city: "Milano",
        postalCode: "20100",
        phone: "3331234567",
      },
      paymentMethod: "cod",
    });
    expect(result.success).toBe(false);
  });
});

describe("shippingAddressSchema", () => {
  it("requires name and street", () => {
    const result = shippingAddressSchema.safeParse({
      name: "A",
      street: "X",
      city: "Milano",
      postalCode: "20100",
      phone: "123",
    });
    expect(result.success).toBe(false);
  });
});
