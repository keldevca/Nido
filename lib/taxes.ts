export const TPS = 0.05;
export const TVQ = 0.09975;

export type Categorie = {
  nom: string;
  taxable: boolean;
};

export const CATEGORIES: Categorie[] = [
  { nom: "Fruits & Légumes", taxable: false },
  { nom: "Viandes & Poissons", taxable: false },
  { nom: "Produits laitiers", taxable: false },
  { nom: "Pain & Céréales", taxable: false },
  { nom: "Épicerie", taxable: false },
  { nom: "Surgelés", taxable: false },
  { nom: "Boissons (jus, eau, café)", taxable: false },
  { nom: "Collations & Bonbons", taxable: true },
  { nom: "Boissons gazeuses & Alcool", taxable: true },
  { nom: "Aliments préparés", taxable: true },
  { nom: "Vêtements", taxable: true },
  { nom: "Pharmacie / Santé", taxable: true },
  { nom: "Hygiène & Beauté", taxable: true },
  { nom: "Maison & Entretien", taxable: true },
  { nom: "Autre", taxable: true },
];

export const TAXABLE_PAR_CATEGORIE = Object.fromEntries(
  CATEGORIES.map((c) => [c.nom, c.taxable])
);

export function calculerTaxes(sousTotalTaxable: number) {
  const tps = sousTotalTaxable * TPS;
  const tvq = sousTotalTaxable * TVQ;
  return { tps, tvq, taxes: tps + tvq };
}
