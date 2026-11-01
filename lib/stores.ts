import { prisma } from "./prisma";

export const SUGGESTED_STORES = ["Dollarama", "Costco", "Maxi", "IGA", "Metro", "Super C", "Walmart"];

export function listStores(savedStores: string[]): string[] {
  return Array.from(new Set([...SUGGESTED_STORES, ...savedStores])).sort((a, b) => a.localeCompare(b, "fr"));
}

export async function rememberStore(name: string | null) {
  if (!name) return;
  await prisma.store.upsert({ where: { name }, create: { name }, update: {} });
}
