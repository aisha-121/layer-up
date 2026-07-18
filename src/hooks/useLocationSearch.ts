import * as React from "react";
import { useDebounced } from "./useDebounced";
import { searchLocations, type GeocodeResult } from "@/lib/weather";

export function useLocationSearch(query: string) {
  const debounced = useDebounced(query.trim(), 300);
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchLocations(debounced)
      .then((r) => {
        if (!cancelled) setResults(r);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return { results, loading };
}
