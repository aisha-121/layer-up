import type { Aesthetic, Category, Occasion, Season } from "@/types";

export const AESTHETICS: { id: Aesthetic; label: string}[] = [
  { id: "minimalist", label: "Minimalist" },
  { id: "streetwear", label: "Streetwear" },
  { id: "cottagecore", label: "Cottagecore" },
  { id: "y2k", label: "Y2K" },
  { id: "preppy", label: "Preppy" },
  { id: "academia", label: "Dark Academia" },
  { id: "bohemian", label: "Bohemian" },
  { id: "athleisure", label: "Athleisure" },
  { id: "grunge", label: "Grunge" },
  { id: "romantic", label: "Romantic" },
  { id: "businesscasual", label: "Business Casual" },
  { id: "vintage", label: "Vintage" },
];

export const CATEGORIES: { id: Category; label: string}[] = [
  { id: "top", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "dress", label: "Dresses" },
  { id: "outerwear", label: "Outerwear" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
];

export const SEASONS: { id: Season; label: string}[] = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "work", label: "Work" },
  { id: "formal", label: "Formal" },
  { id: "athletic", label: "Athletic" },
  { id: "lounge", label: "Lounge" },
];
