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

export const MEMORIES: Memory[] = [
  {
    id: "summer-1998",
    title: "Dimanche chez mamie",
    dateLabel: "Aout 1998",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
    location: "Lille",
    caption: "Une lumiere douce, une nappe trop grande, trois rires flous.",
    tone: "rose",
  },
  {
    id: "road-2004",
    title: "Route de nuit",
    dateLabel: "Juillet 2004",
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82",
    location: "Cote belge",
    caption: "La mer est hors champ, mais on entend encore les vitres ouvertes.",
    tone: "cyan",
  },
  {
    id: "garden-2011",
    title: "Apres l'orage",
    dateLabel: "Mai 2011",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=82",
    location: "Jardin familial",
    caption: "Papier humide, ciel lave, souvenir presque revenu.",
    tone: "amber",
  },
  {
    id: "forest-2001",
    title: "Sous-bois d'automne",
    dateLabel: "Octobre 2001",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=82",
    location: "Ardennes",
    caption: "Les feuilles collaient aux chaussures, personne ne voulait rentrer.",
    tone: "amber",
  },
  {
    id: "lake-2007",
    title: "Lac silencieux",
    dateLabel: "Aout 2007",
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=82",
    location: "Annecy",
    caption: "Une pause trop calme, presque une respiration dans l'album.",
    tone: "cyan",
  },
  {
    id: "beach-1999",
    title: "Serviette rouge",
    dateLabel: "Juin 1999",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82",
    location: "Atlantique",
    caption: "Du sable dans le sac, le soleil deja imprime sur la peau.",
    tone: "rose",
  },
  {
    id: "window-2009",
    title: "Fenetre ouverte",
    dateLabel: "Mars 2009",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=82",
    location: "Maison bleue",
    caption: "La lumiere entrait comme si elle connaissait l'endroit.",
    tone: "cyan",
  },
  {
    id: "mountain-2013",
    title: "Dernier virage",
    dateLabel: "Fevrier 2013",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=82",
    location: "Alpes",
    caption: "On avait froid, mais la photo a garde seulement le grand air.",
    tone: "amber",
  },
  {
    id: "city-2006",
    title: "Neons apres minuit",
    dateLabel: "Novembre 2006",
    imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=82",
    location: "Bruxelles",
    caption: "La ville brillait trop fort pour dire qu'on etait fatigues.",
    tone: "rose",
  },
  {
    id: "field-2015",
    title: "Champ long",
    dateLabel: "Avril 2015",
    imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=82",
    location: "Somme",
    caption: "Une ligne d'horizon, trois silhouettes, rien a ranger.",
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
