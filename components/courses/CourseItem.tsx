"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Pencil, X, ImageIcon } from "lucide-react";
import type { Course } from "./CoursesList";

type Props = {
  item: Course;
  onToggle: (item: Course) => void;
  onDelete: (id: string) => void;
  onUpdatePrix: (id: string, prix: number | null) => void;
  onToggleTaxable: (item: Course) => void;
};

export default function CourseItem({ item, onToggle, onDelete, onUpdatePrix, onToggleTaxable }: Props) {
  const [editingPrix, setEditingPrix] = useState(false);
  const [prixInput, setPrixInput] = useState(item.prix?.toString() ?? "");
  const [photoOpen, setPhotoOpen] = useState(false);

  function savePrix() {
    const val = parseFloat(prixInput);
    onUpdatePrix(item.id, isNaN(val) ? null : val);
    setEditingPrix(false);
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className={`flex items-center gap-3 px-3 py-3 transition-colors ${
          item.coche ? "opacity-40" : ""
        }`}
      >
        <button
          onClick={() => onToggle(item)}
          aria-label={item.coche ? "Décocher" : "Cocher"}
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
            item.coche
              ? "bg-emerald-500 border-emerald-500"
              : "border-slate-600 hover:border-accent"
          }`}
        >
          {item.coche && <Check size={15} strokeWidth={3} className="text-white" />}
        </button>

        {item.photo ? (
          <button
            onClick={() => setPhotoOpen(true)}
            aria-label="Voir la photo"
            className="flex-shrink-0"
          >
            <img
              src={item.photo}
              alt={item.nom}
              className="w-10 h-10 rounded-lg object-cover border border-slate-700"
            />
          </button>
        ) : null}

        <span
          className={`flex-1 text-base font-medium leading-tight ${
            item.coche ? "line-through text-slate-500" : "text-slate-100"
          }`}
        >
          {item.nom}
          {item.quantite > 1 && (
            <span className="ml-2 text-xs font-bold text-accent bg-accent/15 rounded-md px-1.5 py-0.5 align-middle">
              ×{item.quantite}
            </span>
          )}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleTaxable(item)}
            title={item.taxable ? "Taxé — toucher pour retirer" : "Non taxé — toucher pour taxer"}
            aria-label={item.taxable ? "Retirer la taxe" : "Marquer comme taxé"}
            className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
              item.taxable
                ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {item.taxable ? "T" : "0%"}
          </button>

          {editingPrix ? (
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={prixInput}
              onChange={(e) => setPrixInput(e.target.value)}
              onBlur={savePrix}
              onKeyDown={(e) => e.key === "Enter" && savePrix()}
              className="w-20 bg-base-800 border border-accent rounded-lg px-2 py-1 text-sm text-right text-slate-100 focus:outline-none"
              placeholder="0.00"
            />
          ) : (
            <button
              onClick={() => setEditingPrix(true)}
              aria-label="Modifier le prix"
              className="flex items-center gap-1 text-sm text-slate-300 hover:text-slate-100 px-2 py-1 rounded-lg active:bg-slate-700/40 transition-colors"
            >
              {item.prix != null ? (
                <span className="font-mono">
                  {(item.prix * (item.quantite ?? 1)).toFixed(2)} $
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-500">
                  <Pencil size={13} />
                  <span className="text-xs">prix</span>
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => onDelete(item.id)}
            aria-label="Supprimer"
            className="text-slate-500 hover:text-red-400 active:text-red-500 p-2 rounded-lg active:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>

      {/* Lightbox photo */}
      <AnimatePresence>
        {photoOpen && item.photo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhotoOpen(false)}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setPhotoOpen(false)}
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Fermer"
            >
              <X size={22} />
            </button>
            <img
              src={item.photo}
              alt={item.nom}
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
