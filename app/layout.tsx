import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/SessionProvider";
import { getCaptions, getLang } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCaptions();
  return {
    title: "Nido",
    description: t.app.tagline,
    applicationName: "Nido",
    appleWebApp: {
      capable: true,
      title: "Nido",
      statusBarStyle: "black-translucent",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();

  return (
    <html lang={lang}>
      <body>
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
