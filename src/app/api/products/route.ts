import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/products-query";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") ?? undefined;
  const sale = searchParams.get("sale") === "true";
  const gender = searchParams.get("gender");
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || searchParams.get("q") || undefined;
  const sizesParam = searchParams.get("sizes");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const fullImages = searchParams.get("fullImages") === "1";

  try {
    const result = await listProducts({
      category,
      sale,
      gender: gender === "men" || gender === "women" ? gender : undefined,
      sort,
      search,
      sizes: sizesParam ? sizesParam.split(",").filter(Boolean) : undefined,
      page,
      limit,
      fullImages,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
