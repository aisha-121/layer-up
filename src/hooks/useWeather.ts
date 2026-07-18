import * as React from "react";
import { fetchWeather, type CurrentWeather } from "@/lib/weather";

export function useWeather(lat: number | null, lon: number | null) {
  const [weather, setWeather] = React.useState<CurrentWeather | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (lat == null || lon == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchWeather(lat, lon)
      .then((w) => {
        if (!cancelled) setWeather(w);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Weather error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return { weather, loading, error };
}
