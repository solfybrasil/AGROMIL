import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agromil Marketplace",
    short_name: "Agromil",
    description: "Marketplace de produtos agropecuários de Itu-SP",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#1b4332",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
