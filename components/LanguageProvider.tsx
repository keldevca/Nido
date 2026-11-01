"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, captions, type Lang } from "@/lib/captions";
import { apiPath } from "@/lib/api";

const LanguageContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "fr",
  setLang: () => {},
});

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const [lang, setLangState] = useState(initialLang);

  function setLang(next: Lang) {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    setLangState(next);
    router.refresh();
    fetch(apiPath("/api/push/lang"), { method: "POST" }).catch(() => {});
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useCaptions() {
  const { lang, setLang } = useContext(LanguageContext);
  const t = captions[lang];
  const label = (value: string) => t.values[value] ?? value;
  return { lang, setLang, t, label };
}
