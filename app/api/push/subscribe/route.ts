import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const endpoint: string | undefined = body?.endpoint;
  const p256dh: string | undefined = body?.keys?.p256dh;
  const auth: string | undefined = body?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Subscription invalide" },
      { status: 400 }
    );
  }

  const sub = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh, auth, userName: user },
    update: { p256dh, auth, userName: user },
  });

  return NextResponse.json({ ok: true, id: sub.id });
}
