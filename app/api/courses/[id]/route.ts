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
  const item = await prisma.courseItem.update({
    where: { id: params.id },
    data: { ...body, updatedBy: user },
  });

  if (typeof body.coche === "boolean") {
    const verbe = body.coche ? "a coché" : "a décoché";
    sendPushToOthers(
      {
        title: `${user} ${verbe} un article`,
        body: item.nom,
        url: "/courses",
        tag: "nido-courses",
      },
      user
    ).catch(() => {});
  }

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
