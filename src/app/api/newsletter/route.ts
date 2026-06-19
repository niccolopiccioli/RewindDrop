import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }
}
