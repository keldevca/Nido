import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";
import { sendPushToOthers } from "@/lib/push";
import { LISTS, parseList } from "@/lib/lists";
import { resolveStore } from "@/lib/stores";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  if ("store" in body) {
    const current = await prisma.courseItem.findUniqueOrThrow({ where: { id: params.id }, select: { list: true } });
    body.store = await resolveStore(body.store, parseList(current.list));
  }
  const item = await prisma.courseItem.update({
    where: { id: params.id },
    data: { ...body, updatedBy: user },
  });

  if (typeof body.coche === "boolean") {
    const list = parseList(item.list);
    sendPushToOthers(
      {
        title: (t) => (body.coche ? t.notify.itemChecked(user) : t.notify.itemUnchecked(user)),
        body: item.nom,
        url: LISTS[list].path,
        tag: `nido-${list}`,
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
