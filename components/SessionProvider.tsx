"use client";

import { SessionProvider } from "next-auth/react";
import type { Lang } from "@/lib/captions";
import { LanguageProvider } from "./LanguageProvider";

const basePath = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/auth`;

export default function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <SessionProvider basePath={basePath}>
      <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
    </SessionProvider>
  );
}
