export type Kind = "city" | "cave" | "mine" | "crystal" | "temple" | "bunker" | "ice" | "dwellings" | "tomb";

export interface Photo { src: string; thumb: string; author: string; license: string; page: string }
export interface Model3d { title: string; embed: string; page: string; author: string; license: string }
export interface Tour { url: string; provider: string; embeddable: boolean }
export interface Source { url: string; label: string }
export interface StoryParagraph { ru: string; en: string }

export interface Place {
  id: string;
  nameRu: string;
  nameEn: string;
  country: string;
  countryRu: string;
  lat: number;
  lon: number;
  kind: Kind;
  wow: number | null;
  card: string;
  story: StoryParagraph[];
  photos: Photo[];
  models: Model3d[];
  tours: Tour[];
  sources: Source[];
  report: string;
}
