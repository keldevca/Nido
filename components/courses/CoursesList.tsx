"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import CourseItem from "./CourseItem";
import AddCourseForm from "./AddCourseForm";
import CoursesTotalBar from "./CoursesTotalBar";
import { calculerTaxes } from "@/lib/taxes";
import { LISTS, type ListKind } from "@/lib/lists";
import { apiPath } from "@/lib/api";
import { useCaptions } from "../LanguageProvider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type Course = {
  id: string;
  nom: string;
  prix: number | null;
  quantite: number;
  photo: string | null;
  categorie: string;
  store: string | null;
  list: ListKind;
  taxable: boolean;
  coche: boolean;
};

type GroupBy = "store" | "category";

const NO_STORE = "__none__";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-accent border-accent text-white"
          : "border-slate-700 text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function CoursesList({ list }: { list: ListKind }) {
  const { t, label } = useCaptions();
  const categories = LISTS[list].categories;
  const mixedTax = categories.some((c) => !c.taxable);
  const EmptyIcon = list === "purchases" ? ShoppingBag : ShoppingCart;
  const { data, mutate } = useSWR<Course[]>(apiPath(`/api/courses?list=${list}`), fetcher, {
    refreshInterval: 5000,
  });

  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("store");

  const allItems = data ?? [];
  const usedStores = Array.from(new Set(allItems.map((i) => i.store).filter((s): s is string => !!s)))
    .sort((a, b) => a.localeCompare(b, "fr"));
  const activeStore = storeFilter && usedStores.includes(storeFilter) ? storeFilter : null;
  const items = activeStore ? allItems.filter((i) => i.store === activeStore) : allItems;
  const nonCoches = items.filter((i) => !i.coche);
  const coches = items.filter((i) => i.coche);

  const sousTotal = nonCoches.reduce((sum, i) => sum + (i.prix ?? 0) * (i.quantite ?? 1), 0);
  const sousTotalTaxable = nonCoches
    .filter((i) => i.taxable)
    .reduce((sum, i) => sum + (i.prix ?? 0) * (i.quantite ?? 1), 0);
  const { tps, tvq } = calculerTaxes(sousTotalTaxable);
  const total = sousTotal + tps + tvq;

  async function update(id: string, changes: Partial<Course>) {
    await fetch(apiPath(`/api/courses/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    mutate();
  }

  const toggle = (item: Course) => update(item.id, { coche: !item.coche });
  const updatePrix = (id: string, prix: number | null) => update(id, { prix });

  async function remove(id: string) {
    await fetch(apiPath(`/api/courses/${id}`), { method: "DELETE" });
    mutate();
  }

  async function clearCoches() {
    await Promise.all(coches.map((i) => fetch(apiPath(`/api/courses/${i.id}`), { method: "DELETE" })));
    mutate();
  }

  const groupKeys = groupBy === "store" ? [...usedStores, NO_STORE] : categories.map((c) => c.nom);
  const groupOf = (i: Course) => (groupBy === "store" ? i.store ?? NO_STORE : i.categorie);
  const grouped = groupKeys.reduce<Record<string, Course[]>>((acc, key) => {
    const groupItems = nonCoches.filter((i) => groupOf(i) === key);
    if (groupItems.length) acc[key] = groupItems;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <AddCourseForm list={list} onAdded={() => mutate()} />

      {allItems.length > 0 && (
        <div className="flex gap-2">
          <Chip active={groupBy === "store"} onClick={() => setGroupBy("store")}>
            {t.shopping.byStore}
          </Chip>
          <Chip active={groupBy === "category"} onClick={() => setGroupBy("category")}>
            {t.shopping.byCategory}
          </Chip>
        </div>
      )}

      {usedStores.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[null, ...usedStores].map((store) => (
            <Chip key={store ?? "all"} active={activeStore === store} onClick={() => setStoreFilter(store)}>
              {store ?? t.shopping.allStores}
            </Chip>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="card p-12 flex flex-col items-center gap-3 text-slate-500">
          <EmptyIcon size={40} strokeWidth={1.2} />
          <p className="text-sm">{t.lists[list].empty}</p>
        </div>
      )}

      <AnimatePresence>
        {Object.entries(grouped).map(([cat, catItems]) => {
          const catDef = groupBy === "category" && mixedTax ? categories.find((c) => c.nom === cat) : undefined;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card overflow-hidden"
            >
              <div className="px-4 py-2 border-b border-slate-700/50 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex-1">
                  {cat === NO_STORE ? t.shopping.noStore : label(cat)}
                </span>
                {catDef && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    catDef.taxable
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {catDef.taxable ? t.shopping.taxed : t.shopping.notTaxed}
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-700/40">
                {catItems.map((item) => (
                  <CourseItem
                    key={item.id}
                    item={item}
                    onToggle={toggle}
                    onDelete={remove}
                    onUpdatePrix={updatePrix}
                    onEdit={update}
                    showStore={groupBy !== "store"}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {coches.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {t.shopping.inCart(coches.length)}
            </span>
            <button
              onClick={clearCoches}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              {t.common.clearAll}
            </button>
          </div>
          <div className="divide-y divide-slate-700/40">
            {coches.map((item) => (
              <CourseItem
                key={item.id}
                item={item}
                onToggle={toggle}
                onDelete={remove}
                onUpdatePrix={updatePrix}
                onEdit={update}
                showStore
              />
            ))}
          </div>
        </motion.div>
      )}

      {items.length > 0 && (
        <CoursesTotalBar
          sousTotal={sousTotal}
          sousTotalTaxable={sousTotalTaxable}
          tps={tps}
          tvq={tvq}
          total={total}
        />
      )}
    </div>
  );
}
