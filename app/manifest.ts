import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return {
    name: "Nido — Courses & Tâches",
    short_name: "Nido",
    description: "Liste de courses et tâches partagées",
    start_url: `${basePath}/courses`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#f97316",
    lang: "fr-CA",
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
