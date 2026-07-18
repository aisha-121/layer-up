export const SCHEMA_VERSION = 1;

// auth

export interface AuthUser {
  email: string;
  name: string;
}

export interface StoredUserRecord {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

// profile/preferences

export type TempSensitivity = "hot" | "average" | "cold";
export type Aesthetic = string; 

export interface SavedLocation {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  label?: string; // user-defined nickname e.g. home or work
}

export interface UserProfile {
  email: string;
  schemaVersion: number;
  onboardingComplete: boolean;
  preferences: {
    temperatureSensitivity: TempSensitivity;
    sensitivityNotes: string;
    savedAesthetics: Aesthetic[];
    savedLocations: SavedLocation[];
  };
  createdAt: string;
  updatedAt: string;
}

// wardrobe

export type Category =
  | "top"
  | "bottom"
  | "dress"
  | "outerwear"
  | "shoes"
  | "accessories";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type Occasion = "casual" | "work" | "formal" | "athletic" | "lounge";

export interface WardrobeItem {
  id: string;
  imageRef: string; // indexedDB key for image blob
  category: Category;
  seasons: Season[];
  color?: string; // it is in hex code
  material?: string;
  warmthRating?: 1 | 2 | 3 | 4 | 5;
  occasions?: Occasion[];
  aesthetics?: Aesthetic[];
  dateAdded: string;
  lastWorn: string | null;
  wearCount: number;
}

// ootd

export type ComfortRating = "cold" | "okay" | "hot";
export type WearAgain = "yes" | "no" | "changes";

export interface OOTDLog {
  id: string;
  date: string; // YYYY-MM-DD
  imageRef: string;
  itemsWorn: string[]; // wardrobe item ids
  weather: {
    temp: number;
    weatherCode: number;
    description: string;
    humidity: number;
  } | null;
  aesthetic: Aesthetic | null;
  comfortRating: ComfortRating;
  wouldWearAgain: WearAgain | null;
  notes: string;
}

// saved outfits

export interface SavedOutfit {
  id: string;
  name: string;
  itemIds: string[];
  createdFrom: {
    weather: { temp: number; weatherCode: number } | null;
    aesthetic: Aesthetic | null;
  };
  rating: number; // 0–5
  createdAt: string;
}

// reccommendation context for generating outfit suggestions

export interface RecommendationContext {
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  windSpeed: number;
  uvIndex: number;
  aesthetic: Aesthetic | null;
  season: Season;
  sensitivity: TempSensitivity;
}

export interface OutfitSuggestion {
  tops: WardrobeItem[];
  bottoms: WardrobeItem[];
  dresses: WardrobeItem[];
  outerwear: WardrobeItem[];
  shoes: WardrobeItem[];
  accessories: WardrobeItem[];
  rationale: string[];
}
