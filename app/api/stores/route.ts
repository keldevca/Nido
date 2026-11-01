import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";
import { listStores } from "@/lib/stores";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const saved = await prisma.store.findMany({ select: { name: true } });
  return NextResponse.json(listStores(saved.map((s) => s.name)));
}
