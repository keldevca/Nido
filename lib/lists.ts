import { CATEGORIES, type Categorie } from "./taxes";

export type ListKind = "groceries" | "purchases";

const PURCHASE_CATEGORIES: Categorie[] = [
  { nom: "Meubles", taxable: true },
  { nom: "Décoration & Éclairage", taxable: true },
  { nom: "Vêtements & Chaussures", taxable: true },
  { nom: "Électronique", taxable: true },
  { nom: "Électroménagers", taxable: true },
  { nom: "Sport & Loisirs", taxable: true },
  { nom: "Bricolage & Jardin", taxable: true },
  { nom: "Cadeaux", taxable: true },
  { nom: "Autre", taxable: true },
];

export const LISTS: Record<ListKind, { path: string; categories: Categorie[]; suggestedStores: string[] }> = {
  groceries: {
    path: "/courses",
    categories: CATEGORIES,
    suggestedStores: ["Dollarama", "Costco", "Maxi", "IGA", "Metro", "Super C", "Walmart"],
  },
  purchases: {
    path: "/shopping",
    categories: PURCHASE_CATEGORIES,
    suggestedStores: ["IKEA", "Structube", "Simons", "Winners", "Canadian Tire", "Best Buy", "Home Depot", "Amazon"],
  },
};

export const parseList = (value: unknown): ListKind => (value === "purchases" ? "purchases" : "groceries");

export const isTaxable = (list: ListKind, categorie: string) =>
  LISTS[list].categories.find((c) => c.nom === categorie)?.taxable ?? true;
