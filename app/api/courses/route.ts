import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";
import { sendPushToOthers } from "@/lib/push";
import { LISTS, parseList } from "@/lib/lists";
import { resolveStore } from "@/lib/stores";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const list = parseList(new URL(req.url).searchParams.get("list"));
  const items = await prisma.courseItem.findMany({
    where: { list },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const list = parseList(body.list);
  const item = await prisma.courseItem.create({
    data: {
      nom: body.nom,
      prix: body.prix ?? null,
      quantite: body.quantite && body.quantite > 0 ? body.quantite : 1,
      photo: body.photo ?? null,
      categorie: body.categorie ?? "Autre",
      store: await resolveStore(body.store, list),
      list,
      taxable: body.taxable ?? true,
      updatedBy: user,
    },
  });

  sendPushToOthers(
    {
      title: (t) => t.notify.itemAdded(user),
      body: item.nom,
      url: LISTS[list].path,
      tag: `nido-${list}`,
    },
    user
  ).catch(() => {});

  return NextResponse.json(item, { status: 201 });
}
