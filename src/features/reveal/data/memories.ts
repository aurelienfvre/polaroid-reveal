export type MemoryTone = "cyan" | "rose" | "amber";

export type Memory = {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  caption: string;
  tone: MemoryTone;
};

export const MEMORIES: Memory[] = [
  {
    id: "summer-1998",
    title: "Dimanche chez mamie",
    dateLabel: "Aout 1998",
    location: "Lille",
    caption: "Une lumiere douce, une nappe trop grande, trois rires flous.",
    tone: "rose",
  },
  {
    id: "road-2004",
    title: "Route de nuit",
    dateLabel: "Juillet 2004",
    location: "Cote belge",
    caption: "La mer est hors champ, mais on entend encore les vitres ouvertes.",
    tone: "cyan",
  },
  {
    id: "garden-2011",
    title: "Apres l'orage",
    dateLabel: "Mai 2011",
    location: "Jardin familial",
    caption: "Papier humide, ciel lave, souvenir presque revenu.",
    tone: "amber",
  },
];

export const REVEAL_FLOW = [
  "Import bibliotheque",
  "Tri sensible local",
  "Reveal 3 photos",
  "Personnalisation Polaroid",
  "Canvas scrapbook",
  "Souvenir imprime",
];
