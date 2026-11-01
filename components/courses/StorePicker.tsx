"use client";

import { useState } from "react";
import useSWR from "swr";
import { BadgeCheck, Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { apiPath } from "@/lib/api";
import type { ListKind } from "@/lib/lists";
import type { StoreOption } from "@/lib/stores";
import { useCaptions } from "../LanguageProvider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const storesKey = (list: ListKind) => apiPath(`/api/stores?list=${list}`);

const ROW = "flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm hover:bg-slate-700/40 transition-colors";

type Props = {
  list: ListKind;
  value: string;
  onChange: (value: string) => void;
};

export default function StorePicker({ list, value, onChange }: Props) {
  const { t } = useCaptions();
  const { data: stores = [], mutate } = useSWR<StoreOption[]>(storesKey(list), fetcher);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  function pick(name: string) {
    setAdding(false);
    onChange(name);
    setOpen(false);
  }

  function startAdding() {
    setAdding(true);
    onChange("");
    setOpen(false);
  }

  async function remove(name: string) {
    if (!confirm(t.form.confirmDeleteStore(name))) return;
    await fetch(apiPath("/api/stores"), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, list }),
    });
    if (value === name) onChange("");
    mutate();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="input flex items-center justify-between gap-2 text-left"
      >
        <span className={`truncate ${value || adding ? "text-slate-100" : "text-slate-500"}`}>
          {adding ? t.form.otherStore : value || t.form.noStore}
        </span>
        <ChevronDown size={16} className={`flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="rounded-xl border border-slate-700 bg-base-800 overflow-hidden">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-700/40">
            <button type="button" onClick={() => pick("")} className={`${ROW} text-slate-400`}>
              {t.form.noStore}
            </button>
            {stores.map((s) => (
              <div key={s.name} className="flex items-center">
                <button type="button" onClick={() => pick(s.name)} className={`${ROW} text-slate-100`}>
                  <span className="truncate">{s.name}</span>
                  {!s.custom && <BadgeCheck size={14} className="flex-shrink-0 text-accent" aria-label={t.form.officialStore} />}
                  {value === s.name && <Check size={14} className="ml-auto flex-shrink-0 text-accent" />}
                </button>
                {s.custom && (
                  <button
                    type="button"
                    onClick={() => remove(s.name)}
                    aria-label={t.form.deleteStore(s.name)}
                    className="px-3 py-2.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={startAdding} className={`${ROW} text-accent font-medium`}>
              <Plus size={14} />
              {t.form.otherStore}
            </button>
          </div>
          <p className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 border-t border-slate-700/60">
            <BadgeCheck size={12} className="flex-shrink-0 text-accent" />
            {t.form.storeLegend}
          </p>
        </div>
      )}

      {adding && (
        <input
          autoFocus
          className="input"
          placeholder={t.form.storeName}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
