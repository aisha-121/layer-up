import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Shirt, Sparkles, Calendar } from "lucide-react";
import { WeatherCard } from "@/components/app/weather/weather-card";
import type { SavedLocation } from "@/types";

const PREVIEW: SavedLocation = {
  id: 5128581,
  name: "New York",
  admin1: "NY",
  country: "USA",
  latitude: 40.7128,
  longitude: -74.006,
};

export function LandingPage() {
  const [previewLoc] = React.useState<SavedLocation>(PREVIEW);

  return (
    <div className="bg-background min-h-svh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex size-8 items-center justify-center overflow-hidden rounded-lg">
            <img
              src="/layer.png"
              alt="Layer Up"
              className="size-full object-cover"
            />
          </div>
          <span className="text-base font-semibold">Layer Up</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:gap-12 md:py-20">
        <div className="flex flex-col justify-center gap-6">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Outfits that match your weather, your wardrobe, and your vibe.
          </h1>
          <p className="text-muted-foreground text-lg">
            Layer Up reads the forecast, browses your closet, and styles a look
            that actually fits how you feel today.
          </p>
          <div className="flex gap-3">
            <Button size="lg" asChild>
              <Link to="/register">Build my closet</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">I have an account</Link>
            </Button>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
            Live preview
          </p>
          <WeatherCard location={previewLoc} />
        </div>
      </section>

      <section className="bg-secondary/40 border-y">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
          <Feature
            icon={Cloud}
            title="Hyper-local weather"
            body="Real-time temperature, rain, wind & UV from Open-Meteo. Save up to three locations."
          />
          <Feature
            icon={Shirt}
            title="Smart wardrobe"
            body="Tag pieces by season, warmth, and aesthetic. We match them to today's conditions."
          />
          <Feature
            icon={Calendar}
            title="OOTD log"
            body="Snap your fit, log how it felt, and build a style memory you can browse like a calendar."
          />
        </div>
      </section>

      <footer className="text-muted-foreground mx-auto max-w-6xl px-6 py-10 text-center text-xs">
        © {new Date().getFullYear()} Layer Up · A weather-aware styling assistant.
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 py-6">
        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-md">
          <Icon className="size-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{body}</p>
      </CardContent>
    </Card>
  );
}
