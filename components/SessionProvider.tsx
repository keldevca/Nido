"use client";

import { SessionProvider } from "next-auth/react";

const basePath = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/auth`;

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
}
