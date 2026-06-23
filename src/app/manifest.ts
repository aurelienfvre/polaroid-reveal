import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Polaroid Reveal",
    short_name: "Reveal",
    description:
      "Une experience intime pour raviver des souvenirs Polaroid numerises.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ed",
    theme_color: "#f7f4ed",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
