"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LIEUX, ASSIGNES } from "./TachesList";
import { apiPath } from "@/lib/api";

type Props = {
  onAdded: () => void;
};

export default function AddTacheForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [lieu, setLieu] = useState("");
  const [priorite, setPriorite] = useState("normale");
  const [assigneA, setAssigneA] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return;
    setLoading(true);
    await fetch(apiPath("/api/taches"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: nom.trim(),
        description: description.trim() || null,
        lieu: lieu || null,
        priorite,
        assigneA: assigneA || null,
        dateLimite: dateLimite || null,
      }),
    });
    setNom("");
    setDescription("");
    setLieu("");
    setPriorite("normale");
    setAssigneA("");
    setDateLimite("");
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
        Ajouter une tâche
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
              placeholder="Nom de la tâche"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />

            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                className="input"
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
              >
                <option value="">Lieu (optionnel)</option>
                {LIEUX.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={assigneA}
                onChange={(e) => setAssigneA(e.target.value)}
              >
                <option value="">Assigné à (optionnel)</option>
                {ASSIGNES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Priorité</p>
                <div className="flex gap-1">
                  {["haute", "normale", "basse"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorite(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                        priorite === p
                          ? p === "haute"
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : p === "normale"
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                            : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1.5">Date limite</p>
                <input
                  type="date"
                  className="input"
                  value={dateLimite}
                  onChange={(e) => setDateLimite(e.target.value)}
                />
              </div>
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
