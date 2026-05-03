"use client";

import { useRef, useState } from "react";
import { Plus, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, TAXABLE_PAR_CATEGORIE } from "@/lib/taxes";
import { apiPath } from "@/lib/api";

type Props = {
  onAdded: () => void;
};

// Compresse l'image côté client en base64 (max 600px côté + JPEG 70%)
async function fileToCompressedDataUrl(file: File, maxSide = 600, quality = 0.7): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function AddCourseForm({ onAdded }: Props) {
  const DEFAULT_CAT = CATEGORIES[0]?.nom ?? "Autre";
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [quantite, setQuantite] = useState("1");
  const [categorie, setCategorie] = useState(DEFAULT_CAT);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const taxable = TAXABLE_PAR_CATEGORIE[categorie] ?? true;

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const compressed = await fileToCompressedDataUrl(f);
      setPhoto(compressed);
    } catch {
      alert("Impossible de lire cette photo.");
    }
  }

  function reset() {
    setNom("");
    setPrix("");
    setQuantite("1");
    setCategorie(DEFAULT_CAT);
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

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
        quantite: parseInt(quantite, 10) || 1,
        photo,
        categorie,
        taxable,
      }),
    });
    reset();
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
                className="input w-28"
                placeholder="Prix"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
              />
              <input
                type="number"
                min="1"
                step="1"
                className="input w-20 text-center"
                placeholder="Qté"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                title="Quantité"
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

            {/* Photo */}
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickPhoto}
                className="hidden"
              />
              {photo ? (
                <div className="relative">
                  <img
                    src={photo}
                    alt="Aperçu"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    aria-label="Retirer la photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:text-accent hover:border-accent text-sm transition-colors"
                >
                  <Camera size={16} />
                  Ajouter une photo
                </button>
              )}
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
