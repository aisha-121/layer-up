import * as React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WeatherCard } from "@/components/app/weather/weather-card";
import { LocationManager } from "@/components/app/weather/location-manager";
import { WardrobeItemTile } from "@/components/app/wardrobe/wardrobe-item";
import { useAuth } from "@/contexts/AuthContext";
import { useWardrobe, useOutfits } from "@/hooks/useUserData";
import { useWeather } from "@/hooks/useWeather";
import { recommendOutfits } from "@/lib/recommendations";
import { seasonForDate } from "@/lib/weather";
import { v4 as uuid } from "uuid";
import { Sparkles, RefreshCw, Bookmark, Plus } from "lucide-react";
import type { Aesthetic, SavedLocation } from "@/types";
import { toast } from "sonner";

export function DashboardPage() {
  const { profile, updateProfile } = useAuth();
  const { items: wardrobe } = useWardrobe();
  const { add: addOutfit } = useOutfits();
  const locations = profile?.preferences.savedLocations ?? [];
  const [activeId, setActiveId] = React.useState<number | null>(
    locations[0]?.id ?? null,
  );
  const active =
    locations.find((l) => l.id === activeId) ?? locations[0] ?? null;
  const { weather } = useWeather(active?.latitude ?? null, active?.longitude ?? null);
  const [manualTemp, setManualTemp] = React.useState<number | null>(null);
  const [aesthetic, setAesthetic] = React.useState<Aesthetic | null>(
    profile?.preferences.savedAesthetics[0] ?? null,
  );
  const [seed, setSeed] = React.useState(0); 

  const ctxTemp = manualTemp ?? weather?.temperature ?? 20;
  const ctxCode = weather?.weatherCode ?? 1;

  const suggestions = React.useMemo(() => {
    return recommendOutfits(wardrobe, {
      temperature: ctxTemp,
      weatherCode: ctxCode,
      precipitationProbability: weather?.precipitationProbability ?? 0,
      windSpeed: weather?.windSpeed ?? 0,
      uvIndex: weather?.uvIndex ?? 0,
      aesthetic,
      season: seasonForDate(),
      sensitivity: profile?.preferences.temperatureSensitivity ?? "average",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardrobe, ctxTemp, ctxCode, aesthetic, profile?.preferences.temperatureSensitivity, seed]);

  const [pickedTop, setPickedTop] = React.useState<string | null>(null);
  const [pickedBottom, setPickedBottom] = React.useState<string | null>(null);
  const [pickedOuter, setPickedOuter] = React.useState<string | null>(null);
  const [pickedShoes, setPickedShoes] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPickedTop(suggestions.tops[0]?.id ?? null);
    setPickedBottom(suggestions.bottoms[0]?.id ?? null);
    setPickedOuter(suggestions.outerwear[0]?.id ?? null);
    setPickedShoes(suggestions.shoes[0]?.id ?? null);
  }, [suggestions]);

  function saveLook() {
    const ids = [pickedTop, pickedBottom, pickedOuter, pickedShoes].filter(
      Boolean,
    ) as string[];
    if (ids.length === 0) {
      toast.error("Pick at least one piece first.");
      return;
    }
    addOutfit({
      id: uuid(),
      name: `${aesthetic ?? "Today"} · ${Math.round(ctxTemp)}°`,
      itemIds: ids,
      createdFrom: {
        weather: weather ? { temp: weather.temperature, weatherCode: weather.weatherCode } : null,
        aesthetic,
      },
      rating: 0,
      createdAt: new Date().toISOString(),
    });
    toast.success("Outfit saved.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {greeting()},{" "}
          <span className="text-foreground font-medium">
            {profile?.email.split("@")[0]}
          </span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Here it today's {" "}
          <span className="text-foreground font-medium">
             outlook.
          </span>
        </p>
      </div>

      <div className="space-y-3">
        <LocationManager
          locations={locations}
          activeId={active?.id ?? null}
          onSelect={(id) => setActiveId(id)}
          onAdd={(l) => {
            updateProfile((p) => ({
              ...p,
              preferences: {
                ...p.preferences,
                savedLocations: [...p.preferences.savedLocations, l].slice(0, 3),
              },
            }));
            setActiveId(l.id);
          }}
          onRemove={(id) =>
            updateProfile((p) => ({
              ...p,
              preferences: {
                ...p.preferences,
                savedLocations: p.preferences.savedLocations.filter(
                  (l: SavedLocation) => l.id !== id,
                ),
              },
            }))
          }
        />
        <WeatherCard
          location={active}
          onManualTemp={(t) => setManualTemp(t)}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4" /> Recommendations
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {suggestions.rationale.join(" · ")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSeed((s) => s + 1)}
              aria-label="Shuffle"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button onClick={saveLook}>
              <Bookmark className="mr-1 size-4" /> Save look
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {(profile?.preferences.savedAesthetics.length ?? 0) > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs">Vibe:</span>
              <ToggleGroup
                type="single"
                value={aesthetic ?? ""}
                onValueChange={(v) => setAesthetic(v || null)}
                variant="outline"
                size="sm"
              >
                {profile!.preferences.savedAesthetics.map((a) => (
                  <ToggleGroupItem
                    key={a}
                    value={a}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground capitalize"
                  >
                    {a}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {wardrobe.length === 0 ? (
            <div className="bg-secondary/40 flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
              <p className="text-muted-foreground text-sm">
                Your closet is empty — add a few pieces to start getting recommendations.
              </p>
              <Button asChild>
                <Link to="/wardrobe">
                  <Plus className="mr-1 size-4" /> Add wardrobe
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <Row
                title="Tops"
                items={suggestions.tops}
                pickedId={pickedTop}
                onPick={setPickedTop}
              />
              <Row
                title="Bottoms"
                items={suggestions.bottoms}
                pickedId={pickedBottom}
                onPick={setPickedBottom}
              />
              {suggestions.outerwear.length > 0 && (
                <Row
                  title="Outerwear"
                  items={suggestions.outerwear}
                  pickedId={pickedOuter}
                  onPick={setPickedOuter}
                />
              )}
              <Row
                title="Shoes"
                items={suggestions.shoes}
                pickedId={pickedShoes}
                onPick={setPickedShoes}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  title,
  items,
  pickedId,
  onPick,
}: {
  title: string;
  items: import("@/types").WardrobeItem[];
  pickedId: string | null;
  onPick: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Skeleton className="bg-secondary/60 flex h-24 w-full items-center justify-center text-xs">
          <span className="text-muted-foreground">No matching {title.toLowerCase()} yet.</span>
        </Skeleton>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-[10px]">
          {items.length} match
        </Badge>
      </div>
      <ScrollArea>
        <div className="flex gap-3 pb-3">
          {items.map((it) => (
            <WardrobeItemTile
              key={it.id}
              item={it}
              selected={pickedId === it.id}
              onClick={() => onPick(it.id)}
              className="w-32 shrink-0"
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Separator />
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
