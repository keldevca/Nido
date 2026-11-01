export const SUGGESTED_STORES = ["Dollarama", "Costco", "Maxi", "IGA", "Metro", "Super C", "Walmart"];

export function listStores(usedStores: string[]): string[] {
  return Array.from(new Set([...usedStores, ...SUGGESTED_STORES]));
}
