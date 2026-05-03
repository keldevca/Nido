import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";
import { sendPushToOthers } from "@/lib/push";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  if (body.dateLimite) body.dateLimite = new Date(body.dateLimite);
  const tache = await prisma.tache.update({
    where: { id: params.id },
    data: { ...body, updatedBy: user },
  });

  if (typeof body.completee === "boolean") {
    const verbe = body.completee ? "a complété" : "a rouvert";
    sendPushToOthers(
      {
        title: `${user} ${verbe} une tâche`,
        body: tache.nom,
        url: "/taches",
        tag: "nido-taches",
      },
      user
    ).catch(() => {});
  }

  return NextResponse.json(tache);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await prisma.tache.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
