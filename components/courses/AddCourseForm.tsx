"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, TAXABLE_PAR_CATEGORIE } from "@/lib/taxes";
import { apiPath } from "@/lib/api";

type Props = {
  onAdded: () => void;
};

export default function AddCourseForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [categorie, setCategorie] = useState("Autre");
  const [loading, setLoading] = useState(false);

  const taxable = TAXABLE_PAR_CATEGORIE[categorie] ?? true;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return;
    setLoading(true);
    await fetch(apiPath("/api/courses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: nom.trim(),
        prix: prix ? parseFloat(prix) : null,
        categorie,
        taxable,
      }),
    });
    setNom("");
    setPrix("");
    setCategorie("Autre");
    setLoading(false);
    onAdded();
    setOpen(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Ajouter un article
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            onSubmit={submit}
            className="card mt-2 p-4 flex flex-col gap-3 overflow-hidden"
          >
            <input
              autoFocus
              className="input"
              placeholder="Nom de l'article"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />

            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                className="input w-32"
                placeholder="Prix approx."
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
              />
              <select
                className="input flex-1"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.nom} value={c.nom}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className={`text-xs px-3 py-2 rounded-xl font-medium ${
              taxable
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              {taxable ? "Cet article sera taxé (TPS + TVQ)" : "Cet article est non taxé (denrée de base)"}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !nom.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
