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

export const PHOTO_DIRECTORY = "/images/photos";
export const PHOTO_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

const MEMORY_TONES: MemoryTone[] = ["rose", "cyan", "amber"];

const MEMORY_CAPTIONS = [
  "Un fragment qui revient doucement sur le papier.",
  "La photo garde ce que la memoire n'a pas range.",
  "Quelques secondes epinglables, assez floues pour respirer.",
];

export function createMemoriesFromPhotoFiles(fileNames: string[]): Memory[] {
  return fileNames.map((fileName, index) => ({
    id: getPhotoId(fileName),
    title: getPhotoTitle(fileName),
    dateLabel: "Pellicule locale",
    location: "public/images/photos",
    caption: MEMORY_CAPTIONS[index % MEMORY_CAPTIONS.length],
    imageUrl: `${PHOTO_DIRECTORY}/${encodeURIComponent(fileName)}`,
    tone: MEMORY_TONES[index % MEMORY_TONES.length],
  }));
}

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
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
