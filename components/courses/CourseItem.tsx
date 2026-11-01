"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, X, Store } from "lucide-react";
import type { Course } from "./CoursesList";
import CourseForm, { type CourseFormValues } from "./CourseForm";
import { useCaptions } from "../LanguageProvider";

type Props = {
  item: Course;
  onToggle: (item: Course) => void;
  onDelete: (id: string) => void;
  onUpdatePrix: (id: string, prix: number | null) => void;
  onEdit: (id: string, values: CourseFormValues) => Promise<void>;
  showStore: boolean;
};

export default function CourseItem({ item, onToggle, onDelete, onUpdatePrix, onEdit, showStore }: Props) {
  const { t } = useCaptions();
  const [editing, setEditing] = useState(false);
  const [editingPrix, setEditingPrix] = useState(false);
  const [prixInput, setPrixInput] = useState(item.prix?.toString() ?? "");
  const [photoOpen, setPhotoOpen] = useState(false);
  const storeLabel = showStore ? item.store : null;
  const hasMeta = item.quantite > 1 || !!storeLabel || item.prix != null;

  function savePrix() {
    const val = parseFloat(prixInput);
    onUpdatePrix(item.id, isNaN(val) ? null : val);
    setEditingPrix(false);
  }

  async function saveEdit(values: CourseFormValues) {
    await onEdit(item.id, values);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="p-3">
        <CourseForm
          list={item.list}
          initial={item}
          submitLabel={t.common.save}
          onSubmit={saveEdit}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
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
          aria-label={item.coche ? t.common.uncheck : t.common.check}
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
            aria-label={t.item.viewPhoto}
            className="flex-shrink-0"
          >
            <img
              src={item.photo}
              alt={item.nom}
              className="w-10 h-10 rounded-lg object-cover border border-slate-700"
            />
          </button>
        ) : null}

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={t.item.edit(item.nom)}
            className="block w-full text-left"
          >
            <span
              title={item.nom}
              className={`text-base font-medium leading-tight break-words line-clamp-2 ${
                item.coche ? "line-through text-slate-500" : "text-slate-100"
              }`}
            >
              {item.nom}
            </span>
          </button>

          {hasMeta && (
            <div className="flex items-center gap-1.5 mt-1 min-w-0">
              {item.quantite > 1 && (
                <span className="flex-shrink-0 text-xs font-bold text-accent bg-accent/15 rounded-md px-1.5 py-0.5">
                  ×{item.quantite}
                </span>
              )}
              {storeLabel && (
                <span className="flex items-center gap-1 min-w-0 text-xs text-slate-400">
                  <Store size={12} className="flex-shrink-0" />
                  <span className="truncate">{storeLabel}</span>
                </span>
              )}
              {item.prix != null && (
                <div className="ml-auto flex-shrink-0">
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
                      className="w-20 bg-base-800 border border-accent rounded-md px-2 py-0.5 text-sm text-right text-slate-100 focus:outline-none"
                      placeholder="0.00"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setPrixInput(item.prix?.toString() ?? "");
                        setEditingPrix(true);
                      }}
                      aria-label={t.item.editPrice}
                      className="font-mono text-sm text-slate-300 hover:text-slate-100 px-1.5 py-0.5 rounded-md active:bg-slate-700/40 transition-colors"
                    >
                      {(item.prix * (item.quantite ?? 1)).toFixed(2)} $
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(item.id)}
          aria-label={t.common.delete}
          className="flex-shrink-0 text-slate-500 hover:text-red-400 active:text-red-500 p-2 -mr-1 rounded-lg active:bg-red-500/10 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </motion.div>

      {/* Lightbox photo */}
      <AnimatePresence>
        {photoOpen && item.photo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPhotoOpen(false)}
            className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center gap-4 p-4"
          >
            <button
              onClick={() => setPhotoOpen(false)}
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
              aria-label={t.common.close}
            >
              <X size={22} />
            </button>
            <img
              src={item.photo}
              alt={item.nom}
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
            />
            <p className="text-white text-center text-base font-medium max-w-md break-words">
              {item.nom}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
