import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const endpoint: string | undefined = body?.endpoint;

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint requis" }, { status: 400 });
  }

  await prisma.pushSubscription
    .delete({ where: { endpoint } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
