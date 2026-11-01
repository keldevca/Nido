"use client";

import { useRef, useState } from "react";
import { mutate } from "swr";
import { Camera, X } from "lucide-react";
import { LISTS, isTaxable, type ListKind } from "@/lib/lists";
import type { Course } from "./CoursesList";
import StorePicker, { storesKey } from "./StorePicker";
import { useCaptions } from "../LanguageProvider";

export type CourseFormValues = Omit<Course, "id" | "coche" | "list">;

type Props = {
  list: ListKind;
  initial?: Course;
  submitLabel: string;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  onCancel: () => void;
};

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

export default function CourseForm({ list, initial, submitLabel, onSubmit, onCancel }: Props) {
  const { t, label } = useCaptions();
  const categories = LISTS[list].categories;
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [prix, setPrix] = useState(initial?.prix?.toString() ?? "");
  const [quantite, setQuantite] = useState(String(initial?.quantite ?? 1));
  const [categorie, setCategorie] = useState(initial?.categorie ?? categories[0]?.nom ?? "Autre");
  const [taxable, setTaxable] = useState(initial?.taxable ?? isTaxable(list, categorie));
  const [store, setStore] = useState(initial?.store ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function changeCategorie(value: string) {
    setCategorie(value);
    setTaxable(isTaxable(list, value));
  }

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const compressed = await fileToCompressedDataUrl(f);
      setPhoto(compressed);
    } catch {
      alert(t.form.photoError);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return;
    setLoading(true);
    await onSubmit({
      nom: nom.trim(),
      prix: prix ? parseFloat(prix) : null,
      quantite: parseInt(quantite, 10) || 1,
      photo,
      categorie,
      store: store.trim() || null,
      taxable,
    });
    setLoading(false);
    mutate(storesKey(list));
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        autoFocus
        className="input"
        placeholder={t.form.name}
        value={nom}
        onChange={(e) => setNom(e.target.value)}
      />

      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          className="input w-28"
          placeholder={t.form.price}
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
        />
        <input
          type="number"
          min="1"
          step="1"
          className="input w-20 text-center"
          placeholder={t.form.qty}
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          title={t.form.quantity}
        />
        <select
          className="input flex-1"
          value={categorie}
          onChange={(e) => changeCategorie(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.nom} value={c.nom}>
              {label(c.nom)}
            </option>
          ))}
        </select>
      </div>

      <StorePicker list={list} value={store} onChange={setStore} />

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
              alt={t.form.preview}
              className="w-16 h-16 rounded-xl object-cover border border-slate-700"
            />
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
              aria-label={t.form.removePhoto}
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
            {t.form.addPhoto}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setTaxable((v) => !v)}
        aria-pressed={taxable}
        className={`flex items-center justify-between gap-3 text-left text-xs px-3 py-2 rounded-xl font-medium transition-colors ${
          taxable
            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        }`}
      >
        <span>{taxable ? t.form.willBeTaxed : t.form.notTaxed}</span>
        <span className="flex-shrink-0 underline underline-offset-2 opacity-80">{t.form.changeTax}</span>
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          {t.common.cancel}
        </button>
        <button
          type="submit"
          disabled={loading || !nom.trim()}
          className="flex-1 btn-primary disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
