import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";
import { getLang } from "@/lib/lang";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await prisma.pushSubscription.updateMany({ where: { userName: user }, data: { lang: await getLang() } });
  return NextResponse.json({ ok: true });
}
