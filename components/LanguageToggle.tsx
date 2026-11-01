"use client";

import type { Lang } from "@/lib/captions";
import { useCaptions } from "./LanguageProvider";

const LANGS: Lang[] = ["fr", "en"];

export default function LanguageToggle() {
  const { lang, setLang, t } = useCaptions();

  return (
    <div
      role="radiogroup"
      aria-label={t.nav.language}
      className="flex items-center p-0.5 rounded-full bg-base-700/60 border border-slate-700/60"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={lang === l}
          onClick={() => lang !== l && setLang(l)}
          className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors ${
            lang === l ? "bg-accent text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
