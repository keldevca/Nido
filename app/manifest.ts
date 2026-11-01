import type { MetadataRoute } from "next";
import { getCaptions } from "@/lib/lang";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const t = await getCaptions();

  return {
    name: t.app.name,
    short_name: "Nido",
    description: t.app.description,
    start_url: `${basePath}/courses`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#f97316",
    lang: t.locale,
    icons: [
      {
        src: `${basePath}/icon`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: `${basePath}/apple-icon`,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
