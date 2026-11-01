import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";
import { sendPushToOthers } from "@/lib/push";
import { rememberStore } from "@/lib/stores";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const item = await prisma.courseItem.update({
    where: { id: params.id },
    data: {
      ...body,
      ...("store" in body && { store: body.store?.trim() || null }),
      updatedBy: user,
    },
  });

  if ("store" in body) await rememberStore(item.store);

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

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await prisma.courseItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
