import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const items = await prisma.courseItem.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const item = await prisma.courseItem.create({
    data: {
      nom: body.nom,
      prix: body.prix ?? null,
      categorie: body.categorie ?? "Autre",
      taxable: body.taxable ?? true,
      updatedBy: user,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
