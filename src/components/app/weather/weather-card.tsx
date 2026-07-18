import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";
import type { SavedLocation } from "@/types";

interface Props {
  location: SavedLocation | null;
  onManualTemp?: (temp: number) => void;
}

export function WeatherCard({ location, onManualTemp }: Props) {
  const { weather, loading, error } = useWeather(
    location?.latitude ?? null,
    location?.longitude ?? null,
  );
  const [manual, setManual] = React.useState<number>(20);

  if (!location || error) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {error ? "Weather unavailable" : "No location yet"}
            </p>
            <Badge variant="secondary">Manual</Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Use the slider to set today's temperature so we can still recommend an outfit.
          </p>
          <div className="flex items-center gap-3">
            <Slider
              min={-20}
              max={45}
              step={1}
              value={[manual]}
              onValueChange={(v) => {
                setManual(v[0]);
                onManualTemp?.(v[0]);
              }}
              className="flex-1"
              aria-label="Manual temperature"
            />
            <span className="w-12 text-right text-2xl font-semibold tabular-nums">
              {manual}°
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !weather) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              {location.name}
              {location.admin1 ? `, ${location.admin1}` : ""}
            </p>
            <p className="text-sm font-medium">{weather.description}</p>
          </div>
          <span className="text-4xl" aria-hidden>
            {weather.emoji}
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-semibold tabular-nums">
            {Math.round(weather.temperature)}°
          </span>
          <span className="text-muted-foreground text-sm">
            Feels {Math.round(weather.apparentTemperature)}° · H{" "}
            {Math.round(weather.high)}° · L {Math.round(weather.low)}°
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">💧 {weather.humidity}% humidity</Badge>
          <Badge variant="secondary">
            🌧️ {weather.precipitationProbability ?? 0}% rain
          </Badge>
          <Badge variant="secondary">
            💨 {Math.round(weather.windSpeed)} km/h
          </Badge>
        </div>

        <Separator />

        <div className="flex gap-3 overflow-x-auto pb-1">
          {weather.daily.slice(0, 7).map((d) => {
            const day = new Date(d.date).toLocaleDateString(undefined, {
              weekday: "short",
            });
            return (
              <div
                key={d.date}
                className="flex min-w-[58px] flex-col items-center gap-1 text-xs"
              >
                <span className="text-muted-foreground">{day}</span>
                <span className="text-lg" aria-hidden>
                  <DailyEmoji code={d.weatherCode} />
                </span>
                <span className="font-medium tabular-nums">
                  {Math.round(d.high)}°
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(d.low)}°
                </span>
              </div>
            );
          })}
        </div>

        {onManualTemp && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onManualTemp(weather.temperature)}
          >
            Use this temperature
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DailyEmoji({ code }: { code: number }) {
  const map: Record<number, string> = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌧️", 56: "🌧️", 57: "🌧️",
    61: "🌦️", 63: "🌧️", 65: "🌧️", 66: "🌧️", 67: "🌧️",
    71: "🌨️", 73: "❄️", 75: "❄️", 77: "❄️",
    80: "🌦️", 81: "🌧️", 82: "⛈️",
    85: "🌨️", 86: "❄️",
    95: "⛈️", 96: "⛈️", 99: "⛈️",
  };
  return <span aria-hidden>{map[code] ?? "🌡️"}</span>;
}
