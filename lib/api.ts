import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export const apiPath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.name ?? null;
}

export const unauthorized = () =>
  NextResponse.json({ error: "Non autorisé" }, { status: 401 });
