import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-guards";
import { uploadImage } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nessun file fornito" }, { status: 400 });
    }

    const url = await uploadImage(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload fallito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
