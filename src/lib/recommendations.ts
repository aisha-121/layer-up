import type {
  WardrobeItem,
  RecommendationContext,
  OutfitSuggestion,
  Category,
  TempSensitivity,
} from "@/types";

/* map temp to a warmth/layer up (pun intended) rating (1 (light) to 5 (heavy)), 
then adjust for user sensitivity */

function targetWarmth(temp: number, sens: TempSensitivity): number {
  let t = 3;
  if (temp >= 28) t = 1;
  else if (temp >= 20) t = 2;
  else if (temp >= 12) t = 3;
  else if (temp >= 4) t = 4;
  else t = 5;

  if (sens === "hot") t = Math.max(1, t - 1);
  if (sens === "cold") t = Math.min(5, t + 1);
  return t;
}

function rainy(code: number) {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
}
function snowy(code: number) {
  return [71, 73, 75, 77, 85, 86].includes(code);
}

function pickByCategory(
  items: WardrobeItem[],
  cat: Category,
): WardrobeItem[] {
  return items.filter((i) => i.category === cat);
}

function score(
  item: WardrobeItem,
  ctx: RecommendationContext,
  warmth: number,
): number {
  let s = 0;
  // season match
  if (item.seasons.includes(ctx.season)) s += 3;
  // warmth proximity (the closer the better)
  if (item.warmthRating != null) {
    s += 5 - Math.abs(item.warmthRating - warmth);
  } else {
    s += 1;
  }
  // aesthetic boost
  if (
    ctx.aesthetic &&
    item.aesthetics?.some((a) => a.toLowerCase() === ctx.aesthetic!.toLowerCase())
  ) {
    s += 4;
  }
  // give a boost to items that havent been worn recently 
  if (!item.lastWorn) s += 1;
  return s;
}

export function recommendOutfits(
  wardrobe: WardrobeItem[],
  ctx: RecommendationContext,
): OutfitSuggestion {
  const warmth = targetWarmth(ctx.temperature, ctx.sensitivity);
  const rationale: string[] = [];

  rationale.push(
    `${Math.round(ctx.temperature)}°C feels like a warmth ${warmth}/5 day`,
  );
  if (rainy(ctx.weatherCode) || ctx.precipitationProbability >= 50)
    rationale.push("Rain likely — lean toward water-resistant pieces");
  if (snowy(ctx.weatherCode)) rationale.push("Snow — bundle up with layers");
  if (ctx.windSpeed >= 25)
    rationale.push("Windy — skip the loose, flowy silhouettes");
  if (ctx.aesthetic) rationale.push(`Styling for "${ctx.aesthetic}"`);

  const sortBy = (cat: Category) =>
    pickByCategory(wardrobe, cat)
      .map((i) => ({ i, s: score(i, ctx, warmth) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.i)
      .slice(0, 6);

  const needsOuterwear = warmth >= 4 || rainy(ctx.weatherCode) || snowy(ctx.weatherCode);

  return {
    tops: sortBy("top"),
    bottoms: sortBy("bottom"),
    dresses: sortBy("dress"),
    outerwear: needsOuterwear ? sortBy("outerwear") : [],
    shoes: sortBy("shoes"),
    accessories: sortBy("accessories"),
    rationale,
  };
}
