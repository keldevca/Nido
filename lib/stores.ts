import { prisma } from "./prisma";
import { LISTS, type ListKind } from "./lists";

export type StoreOption = { name: string; custom: boolean };

const normalize = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();

const findStore = (name: string, names: string[]) => names.find((n) => normalize(n) === normalize(name));

export function listStores(savedStores: string[], list: ListKind): StoreOption[] {
  const options: StoreOption[] = LISTS[list].suggestedStores.map((name) => ({ name, custom: false }));
  for (const name of savedStores) {
    if (!findStore(name, options.map((o) => o.name))) options.push({ name, custom: true });
  }
  return options.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export async function resolveStore(input: string | null | undefined, list: ListKind): Promise<string | null> {
  const name = input?.trim();
  if (!name) return null;
  const saved = await prisma.store.findMany({ where: { list }, select: { name: true } });
  const existing = findStore(name, [...LISTS[list].suggestedStores, ...saved.map((s) => s.name)]);
  if (existing) return existing;
  await prisma.store.create({ data: { name, list } });
  return name;
}
