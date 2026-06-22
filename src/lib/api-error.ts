import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Record già esistente", field: error.meta?.target },
        { status: 409 }
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Riferimento non valido o record in uso" },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Record non trovato" }, { status: 404 });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    const message = error.message;
    const schemaHint =
      message.includes("Unknown argument") || message.includes("Unknown field")
        ? " Schema database non aggiornato: esegui `npx prisma generate && npx prisma db push` e riavvia il server."
        : "";
    return NextResponse.json(
      { error: `Errore database.${schemaHint}` },
      { status: 500 }
    );
  }

  console.error("API error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
