import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tomoni Japanese Language Center",
    short_name: "Tomoni Japanese",
    description: "Learn Japanese in Sri Lanka with Tomoni Japanese Language Center. JLPT N5/N4/N3, JFT-Basic, and Study in Japan Pathways.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#dc2626",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
