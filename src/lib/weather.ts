// Open-Meteo weather + geocoding service

const CACHE_PREFIX = "layerup_weather_";
const CACHE_MS = 30 * 60 * 1000;

export interface GeocodeResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
  isDay: boolean;
  description: string;
  emoji: string;
  high: number;
  low: number;
  hourly: { time: string; temperature: number; weatherCode: number }[];
  daily: {
    date: string;
    high: number;
    low: number;
    weatherCode: number;
    precipitationProbability: number;
  }[];
  fetchedAt: number;
}

// WMO weather code → label + emoji
const WMO: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Rime fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Heavy drizzle", emoji: "🌧️" },
  56: { label: "Freezing drizzle", emoji: "🌧️" },
  57: { label: "Freezing drizzle", emoji: "🌧️" },
  61: { label: "Light rain", emoji: "🌦️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "🌧️" },
  66: { label: "Freezing rain", emoji: "🌧️" },
  67: { label: "Freezing rain", emoji: "🌧️" },
  71: { label: "Light snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  77: { label: "Snow grains", emoji: "❄️" },
  80: { label: "Rain showers", emoji: "🌦️" },
  81: { label: "Heavy showers", emoji: "🌧️" },
  82: { label: "Violent showers", emoji: "⛈️" },
  85: { label: "Snow showers", emoji: "🌨️" },
  86: { label: "Heavy snow showers", emoji: "❄️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm w/ hail", emoji: "⛈️" },
  99: { label: "Severe thunderstorm", emoji: "⛈️" },
};

export function describeWeather(code: number): { label: string; emoji: string } {
  return WMO[code] ?? { label: "Unknown", emoji: "🌡️" };
}

export async function searchLocations(q: string): Promise<GeocodeResult[]> {
  if (q.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Location search failed");
  const data = await res.json();
  return (data.results ?? []) as GeocodeResult[];
}

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<CurrentWeather> {
  const cacheKey = `${CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
  try {
    const cached = JSON.parse(
      localStorage.getItem(cacheKey) ?? "null",
    ) as CurrentWeather | null;
    if (cached && Date.now() - cached.fetchedAt < CACHE_MS) return cached;
  } catch {
    // ignore
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
    `&forecast_days=7&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather request failed");
  const data = await res.json();

  const code = data.current.weather_code as number;
  const desc = describeWeather(code);

  const hourly = (data.hourly?.time ?? [])
    .slice(0, 12)
    .map((t: string, i: number) => ({
      time: t,
      temperature: data.hourly.temperature_2m[i] as number,
      weatherCode: data.hourly.weather_code[i] as number,
    }));

  const daily = (data.daily?.time ?? []).map((d: string, i: number) => ({
    date: d,
    high: data.daily.temperature_2m_max[i] as number,
    low: data.daily.temperature_2m_min[i] as number,
    weatherCode: data.daily.weather_code[i] as number,
    precipitationProbability: data.daily.precipitation_probability_max[i] as number,
  }));

  // current-hour precipitation probability
  const nowIso = data.current.time as string;
  const idx = (data.hourly?.time ?? []).indexOf(nowIso);
  const pp =
    idx >= 0 ? (data.hourly.precipitation_probability[idx] as number) : 0;

  const out: CurrentWeather = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    precipitationProbability: pp ?? 0,
    weatherCode: code,
    windSpeed: data.current.wind_speed_10m,
    uvIndex: daily[0]?.uv_index_max ?? 0,
    isDay: data.current.is_day === 1,
    description: desc.label,
    emoji: desc.emoji,
    high: daily[0]?.high ?? data.current.temperature_2m,
    low: daily[0]?.low ?? data.current.temperature_2m,
    hourly,
    daily,
    fetchedAt: Date.now(),
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(out));
  } catch {
  }
  return out;
}

export function seasonForDate(d = new Date()): "spring" | "summer" | "autumn" | "winter" {
  const m = d.getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}
