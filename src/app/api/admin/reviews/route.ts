import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const approved = request.nextUrl.searchParams.get("approved");
  const where =
    approved === "true"
      ? { approved: true }
      : approved === "false"
        ? { approved: false }
        : {};

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id, approved } = await request.json();
  const review = await prisma.review.update({
    where: { id },
    data: { approved: Boolean(approved) },
  });
  return NextResponse.json(review);
}
