import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";
import { parseList } from "@/lib/lists";
import { listStores } from "@/lib/stores";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const list = parseList(new URL(req.url).searchParams.get("list"));
  const saved = await prisma.store.findMany({ where: { list }, select: { name: true } });
  return NextResponse.json(listStores(saved.map((s) => s.name), list));
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { name, list } = await req.json();
  await prisma.store.deleteMany({ where: { name, list: parseList(list) } });
  return NextResponse.json({ ok: true });
}
