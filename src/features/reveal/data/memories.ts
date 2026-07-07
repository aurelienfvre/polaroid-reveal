export type MemoryTone = "cyan" | "rose" | "amber";

export type Memory = {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  caption: string;
  imageUrl: string;
  tone: MemoryTone;
};

const LOCAL_PHOTO_FILES = [
  "aurel_gates.png",
  "le_luctecteur.png",
  "shindig.png",
  "remi_barthez.png",
  "axelle_68.png",
  "halloween_dig.png",
  "manu-vs-manu.png",
  "thierry_rigel.png",
  "remih.png",
  "muppet.png",
  "manu_remi.png",
  "max-mat_apple.png",
  "rigelbappe.png",
  "christophe-ma-nez.png",
  "remi_luc.png",
  "dark_maxnu.png",
  "maxkennedy.png",
] as const;

const MEMORY_TONES: MemoryTone[] = ["rose", "cyan", "amber"];

const MEMORY_CAPTIONS = [
  "Un fragment qui revient doucement sur le papier.",
  "La photo garde ce que la memoire n'a pas range.",
  "Quelques secondes epinglables, assez floues pour respirer.",
];

export const MEMORIES: Memory[] = LOCAL_PHOTO_FILES.map((fileName, index) => ({
  id: getPhotoId(fileName),
  title: getPhotoTitle(fileName),
  dateLabel: "Pellicule locale",
  location: "public/images/photos",
  caption: MEMORY_CAPTIONS[index % MEMORY_CAPTIONS.length],
  imageUrl: `/images/photos/${fileName}`,
  tone: MEMORY_TONES[index % MEMORY_TONES.length],
}));

export const REVEAL_FLOW = [
  "Import bibliotheque",
  "Tri sensible local",
  "Reveal 3 photos",
  "Personnalisation Polaroid",
  "Canvas scrapbook",
  "Souvenir imprime",
];

function getPhotoId(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function getPhotoTitle(fileName: string) {
  return getPhotoId(fileName)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
