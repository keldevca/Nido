"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import TacheItem from "./TacheItem";
import AddTacheForm from "./AddTacheForm";
import { useState } from "react";
import { apiPath } from "@/lib/api";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type Tache = {
  id: string;
  nom: string;
  description: string | null;
  lieu: string | null;
  priorite: string;
  assigneA: string | null;
  dateLimite: string | null;
  completee: boolean;
};

import { MEMBERS } from "@/lib/users";

export const LIEUX = ["Maison", "Travail", "Courses", "École", "Autre"];
export const ASSIGNES = [...MEMBERS, "Ensemble"];

const PRIORITE_ORDER: Record<string, number> = { haute: 0, normale: 1, basse: 2 };

const FILTRES = ["toutes", ...ASSIGNES] as const;
type Filtre = (typeof FILTRES)[number];

export default function TachesList() {
  const { data, mutate } = useSWR<Tache[]>(apiPath("/api/taches"), fetcher, {
    refreshInterval: 5000,
  });
  const [filtre, setFiltre] = useState<Filtre>("toutes");

  const taches = data ?? [];

  const actives = taches
    .filter((t) => !t.completee)
    .filter((t) => filtre === "toutes" || t.assigneA === filtre)
    .sort((a, b) => (PRIORITE_ORDER[a.priorite] ?? 1) - (PRIORITE_ORDER[b.priorite] ?? 1));

  const completees = taches.filter((t) => t.completee);

  async function toggle(tache: Tache) {
    await fetch(apiPath(`/api/taches/${tache.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completee: !tache.completee }),
    });
    mutate();
  }

  async function remove(id: string) {
    await fetch(apiPath(`/api/taches/${id}`), { method: "DELETE" });
    mutate();
  }

  async function clearCompletees() {
    await Promise.all(completees.map((t) => fetch(apiPath(`/api/taches/${t.id}`), { method: "DELETE" })));
    mutate();
  }

  return (
    <div className="flex flex-col gap-4">
      <AddTacheForm onAdded={() => mutate()} />

      <div className="flex gap-2 flex-wrap">
        {FILTRES.map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              filtre === f
                ? "bg-accent text-white"
                : "bg-base-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {taches.length === 0 && (
        <div className="card p-12 flex flex-col items-center gap-3 text-slate-500">
          <ClipboardList size={40} strokeWidth={1.2} />
          <p className="text-sm">Aucune tâche en cours</p>
        </div>
      )}

      <AnimatePresence>
        {actives.map((tache) => (
          <TacheItem
            key={tache.id}
            tache={tache}
            onToggle={toggle}
            onDelete={remove}
          />
        ))}
      </AnimatePresence>

      {completees.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Terminées ({completees.length})
            </span>
            <button
              onClick={clearCompletees}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Tout supprimer
            </button>
          </div>
          <div className="divide-y divide-slate-700/40">
            {completees.map((tache) => (
              <TacheItem
                key={tache.id}
                tache={tache}
                onToggle={toggle}
                onDelete={remove}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
