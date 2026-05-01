"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import CourseItem from "./CourseItem";
import AddCourseForm from "./AddCourseForm";
import CoursesTotalBar from "./CoursesTotalBar";
import { CATEGORIES, calculerTaxes } from "@/lib/taxes";
import { apiPath } from "@/lib/api";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type Course = {
  id: string;
  nom: string;
  prix: number | null;
  categorie: string;
  taxable: boolean;
  coche: boolean;
};

export default function CoursesList() {
  const { data, mutate } = useSWR<Course[]>(apiPath("/api/courses"), fetcher, {
    refreshInterval: 5000,
  });

  const items = data ?? [];
  const nonCoches = items.filter((i) => !i.coche);
  const coches = items.filter((i) => i.coche);

  const sousTotal = nonCoches.reduce((sum, i) => sum + (i.prix ?? 0), 0);
  const sousTotalTaxable = nonCoches
    .filter((i) => i.taxable)
    .reduce((sum, i) => sum + (i.prix ?? 0), 0);
  const { tps, tvq } = calculerTaxes(sousTotalTaxable);
  const total = sousTotal + tps + tvq;

  async function toggle(item: Course) {
    await fetch(apiPath(`/api/courses/${item.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coche: !item.coche }),
    });
    mutate();
  }

  async function remove(id: string) {
    await fetch(apiPath(`/api/courses/${id}`), { method: "DELETE" });
    mutate();
  }

  async function updatePrix(id: string, prix: number | null) {
    await fetch(apiPath(`/api/courses/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prix }),
    });
    mutate();
  }

  async function toggleTaxable(item: Course) {
    await fetch(apiPath(`/api/courses/${item.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taxable: !item.taxable }),
    });
    mutate();
  }

  async function clearCoches() {
    await Promise.all(coches.map((i) => fetch(apiPath(`/api/courses/${i.id}`), { method: "DELETE" })));
    mutate();
  }

  const grouped = CATEGORIES.reduce<Record<string, Course[]>>((acc, cat) => {
    const catItems = nonCoches.filter((i) => i.categorie === cat.nom);
    if (catItems.length) acc[cat.nom] = catItems;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <AddCourseForm onAdded={() => mutate()} />

      {items.length === 0 && (
        <div className="card p-12 flex flex-col items-center gap-3 text-slate-500">
          <ShoppingCart size={40} strokeWidth={1.2} />
          <p className="text-sm">Ta liste est vide</p>
        </div>
      )}

      <AnimatePresence>
        {Object.entries(grouped).map(([cat, catItems]) => {
          const catDef = CATEGORIES.find((c) => c.nom === cat);
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
                  {cat}
                </span>
                {catDef && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    catDef.taxable
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {catDef.taxable ? "taxé" : "non taxé"}
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
                    onToggleTaxable={toggleTaxable}
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
              Dans le panier ({coches.length})
            </span>
            <button
              onClick={clearCoches}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Tout supprimer
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
                onToggleTaxable={toggleTaxable}
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
