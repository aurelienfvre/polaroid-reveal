import { DAILY_REVEAL_LIMIT } from "@/features/reveal/lib/canvasPhotos";
import type {
  ExperiencePhase,
  PanelCopy,
} from "@/features/reveal/types/revealTypes";

export function getPanelCopy(
  phase: ExperiencePhase,
  nextPhotoNumber: number,
): PanelCopy {
  if (phase === "canvas") {
    return {
      eyebrow: "Canvas scrapbook",
      title: "Composer le tableau",
      intro:
        "Les Polaroids du jour deviennent des objets libres : drag and drop sans magnetisme, placement sensible, comme un board liege entre FigJam et carnet de souvenirs.",
    };
  }

  if (phase === "develop") {
    return {
      eyebrow: `Photo ${nextPhotoNumber}/${DAILY_REVEAL_LIMIT}`,
      title: "Developper l'image",
      intro:
        "La photo vient vers toi. Clique-la pour accepter le mouvement sur mobile, puis remue franchement pour la faire apparaitre.",
    };
  }

  return {
    eyebrow: "Polaroid memory lab",
    title: "Sortir un souvenir",
    intro:
      "Le POC pose le script d'experience : appareil, eject photo, zoom reveal, secousse gyroscope, puis canvas geant pour organiser les Polaroids.",
  };
}
