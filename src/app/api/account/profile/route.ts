import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireCustomerApi } from "@/lib/auth-guards";
import {
  passwordUpdateSchema,
  profileUpdateSchema,
} from "@/lib/validations/account";

export async function GET() {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await requireCustomerApi();
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();

    if (body.currentPassword) {
      const { currentPassword, newPassword } =
        passwordUpdateSchema.parse(body);
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (!user?.password) {
        return NextResponse.json({ error: "Password non impostata" }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Password attuale errata" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: await bcrypt.hash(newPassword, 10) },
      });
      return NextResponse.json({ success: true });
    }

    const { name, email } = profileUpdateSchema.parse(body);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Aggiornamento fallito" }, { status: 400 });
  }
}
