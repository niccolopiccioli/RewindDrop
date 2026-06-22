import { describe, expect, it } from "vitest";
import {
  colorCode,
  generateProductSku,
  generateVariantMatrix,
  generateVariantSku,
  recalculateVariantSkus,
} from "@/lib/sku";
import { getDefaultSizesForCategory } from "@/lib/product-templates";

describe("colorCode", () => {
  it("returns first 3 letters uppercase", () => {
    expect(colorCode("Nero")).toBe("NER");
    expect(colorCode("Bianco")).toBe("BIA");
  });
});

describe("generateProductSku", () => {
  it("uses category prefix and name initials", () => {
    expect(
      generateProductSku({
        categorySlug: "t-shirts",
        productName: "Essential Tee",
        sequence: 42,
      })
    ).toBe("TS-ET-042");
  });

  it("handles felpe category", () => {
    expect(
      generateProductSku({
        categorySlug: "felpe",
        productName: "Basic Hoodie",
        sequence: 3,
      })
    ).toBe("FEL-BH-003");
  });
});

describe("generateVariantSku", () => {
  it("appends size only without color", () => {
    expect(
      generateVariantSku({ baseSku: "TS-ET-042", size: "M" })
    ).toBe("TS-ET-042-M");
  });

  it("includes color code with size", () => {
    expect(
      generateVariantSku({
        baseSku: "WB-005-OLI",
        size: "S",
        color: "Nero",
      })
    ).toBe("WB-005-OLI-NER-S");
  });
});

describe("generateVariantMatrix", () => {
  it("creates color x size grid", () => {
    const variants = generateVariantMatrix({
      baseSku: "TS-ET-001",
      sizes: ["S", "M"],
      colors: [
        { name: "Nero", hex: "#000000" },
        { name: "Bianco", hex: "#FFFFFF" },
      ],
      defaultStock: 10,
    });

    expect(variants).toHaveLength(4);
    expect(variants[0].sku).toBe("TS-ET-001-NER-S");
    expect(variants[0].stock).toBe("10");
    expect(variants[3].sku).toBe("TS-ET-001-BIA-M");
  });

  it("creates size-only rows without colors", () => {
    const variants = generateVariantMatrix({
      baseSku: "CAP-001",
      sizes: ["S", "M"],
      colors: [],
      defaultStock: 5,
    });

    expect(variants).toHaveLength(2);
    expect(variants[0].sku).toBe("CAP-001-S");
  });
});

describe("recalculateVariantSkus", () => {
  it("updates skus when base sku changes", () => {
    const variants = generateVariantMatrix({
      baseSku: "OLD-SKU",
      sizes: ["L"],
      colors: [{ name: "Nero" }],
    });

    const updated = recalculateVariantSkus(variants, "NEW-SKU");
    expect(updated[0].sku).toBe("NEW-SKU-NER-L");
  });
});

describe("getDefaultSizesForCategory", () => {
  it("returns apparel sizes for t-shirts", () => {
    expect(getDefaultSizesForCategory("t-shirts")).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
    ]);
  });

  it("returns UNI for accessories", () => {
    expect(getDefaultSizesForCategory("cappelli")).toEqual(["UNI"]);
  });
});
