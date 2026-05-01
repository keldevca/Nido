import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api";

export type ActivityItem = {
  id: string;
  type: "course" | "tache";
  nom: string;
  updatedBy: string | null;
  updatedAt: string;
  isNew: boolean;
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [courses, taches] = await Promise.all([
    prisma.courseItem.findMany({
      where: { updatedAt: { gte: since } },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.tache.findMany({
      where: { updatedAt: { gte: since } },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
  ]);

  const items: ActivityItem[] = [
    ...courses.map((c) => ({
      id: c.id,
      type: "course" as const,
      nom: c.nom,
      updatedBy: c.updatedBy,
      updatedAt: c.updatedAt.toISOString(),
      isNew: c.createdAt.getTime() === c.updatedAt.getTime(),
    })),
    ...taches.map((t) => ({
      id: t.id,
      type: "tache" as const,
      nom: t.nom,
      updatedBy: t.updatedBy,
      updatedAt: t.updatedAt.toISOString(),
      isNew: t.createdAt.getTime() === t.updatedAt.getTime(),
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 20);

  return NextResponse.json(items);
}
