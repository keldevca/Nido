"use client";

import { motion } from "framer-motion";
import { Check, Trash2, MapPin, Calendar, User } from "lucide-react";
import type { Tache } from "./TachesList";

type Props = {
  tache: Tache;
  onToggle: (t: Tache) => void;
  onDelete: (id: string) => void;
};

const PRIORITE_STYLES: Record<string, string> = {
  haute: "bg-red-500/15 text-red-400 border-red-500/30",
  normale: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  basse: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const PRIORITE_DOT: Record<string, string> = {
  haute: "bg-red-400",
  normale: "bg-amber-400",
  basse: "bg-emerald-400",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "short",
  });
}

function isOverdue(d: string) {
  return new Date(d) < new Date();
}

export default function TacheItem({ tache, onToggle, onDelete }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`card p-3 sm:p-4 flex gap-3 ${tache.completee ? "opacity-40" : ""}`}
    >
      <button
        onClick={() => onToggle(tache)}
        aria-label={tache.completee ? "Décocher" : "Cocher"}
        className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
          tache.completee
            ? "bg-emerald-500 border-emerald-500"
            : "border-slate-600 hover:border-accent"
        }`}
      >
        {tache.completee && <Check size={15} strokeWidth={3} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-base font-medium leading-snug ${
              tache.completee ? "line-through text-slate-500" : "text-slate-100"
            }`}
          >
            {tache.nom}
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className={`tag border ${PRIORITE_STYLES[tache.priorite]}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITE_DOT[tache.priorite]}`} />
              {tache.priorite}
            </span>
            <button
              onClick={() => onDelete(tache.id)}
              aria-label="Supprimer"
              className="text-slate-500 hover:text-red-400 active:text-red-500 p-2 -m-1 rounded-lg active:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {tache.description && (
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tache.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {tache.lieu && (
            <span className="tag bg-slate-700/60 text-slate-400">
              <MapPin size={10} /> {tache.lieu}
            </span>
          )}
          {tache.assigneA && (
            <span className="tag bg-indigo-500/15 text-indigo-400">
              <User size={10} /> {tache.assigneA}
            </span>
          )}
          {tache.dateLimite && (
            <span
              className={`tag ${
                isOverdue(tache.dateLimite) && !tache.completee
                  ? "bg-red-500/15 text-red-400"
                  : "bg-slate-700/60 text-slate-400"
              }`}
            >
              <Calendar size={10} /> {formatDate(tache.dateLimite)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
