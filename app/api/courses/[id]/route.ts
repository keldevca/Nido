import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const item = await prisma.courseItem.update({
    where: { id: params.id },
    data: { ...body, updatedBy: user },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await prisma.courseItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
