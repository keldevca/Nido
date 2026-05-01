import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const taches = await prisma.tache.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(taches);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const tache = await prisma.tache.create({
    data: {
      nom: body.nom,
      description: body.description ?? null,
      lieu: body.lieu ?? null,
      priorite: body.priorite ?? "normale",
      assigneA: body.assigneA ?? null,
      dateLimite: body.dateLimite ? new Date(body.dateLimite) : null,
      updatedBy: user,
    },
  });
  return NextResponse.json(tache, { status: 201 });
}
