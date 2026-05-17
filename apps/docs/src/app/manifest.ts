import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Matos UI",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/logo-black-fiv.png",
        sizes: "500x500",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
