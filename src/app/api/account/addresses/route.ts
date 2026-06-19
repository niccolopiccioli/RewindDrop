import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomerApi } from "@/lib/auth-guards";
import { addressSchema } from "@/lib/validations/account";

export async function GET() {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  try {
    const data = addressSchema.parse(await request.json());

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const count = await prisma.address.count({
      where: { userId: session.user.id },
    });

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: session.user.id,
        isDefault: data.isDefault ?? count === 0,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }
}
