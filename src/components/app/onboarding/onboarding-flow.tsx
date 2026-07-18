import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/contexts/AuthContext";
import { LocationManager } from "@/components/app/weather/location-manager";
import type { SavedLocation, TempSensitivity } from "@/types";
import { AESTHETICS } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const STEPS = ["Location", "Comfort", "Aesthetic", "Welcome"] as const;

export function OnboardingFlow() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);

  const [locations, setLocations] = React.useState<SavedLocation[]>(
    profile?.preferences.savedLocations ?? [],
  );
  const [activeLoc, setActiveLoc] = React.useState<number | null>(
    locations[0]?.id ?? null,
  );
  const [sensitivity, setSensitivity] = React.useState<TempSensitivity>(
    profile?.preferences.temperatureSensitivity ?? "average",
  );
  const [notes, setNotes] = React.useState(
    profile?.preferences.sensitivityNotes ?? "",
  );
  const [aesthetics, setAesthetics] = React.useState<string[]>(
    profile?.preferences.savedAesthetics ?? [],
  );

  const progress = ((step + 1) / STEPS.length) * 100;

  function next() {
    if (step === 0 && locations.length === 0) {
      toast.error("Add at least one location to continue.");
      return;
    }
    if (step === 2 && aesthetics.length === 0) {
      toast.error("Pick at least one aesthetic.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function finish() {
    updateProfile((p) => ({
      ...p,
      onboardingComplete: true,
      preferences: {
        ...p.preferences,
        temperatureSensitivity: sensitivity,
        sensitivityNotes: notes,
        savedAesthetics: aesthetics,
        savedLocations: locations,
      },
    }));
    toast.success("Closet ready!");
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Step {step + 1} of {STEPS.length}
          </p>
          <Progress value={progress} className="my-1" />
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>{descriptionFor(step)}</CardDescription>
        </CardHeader>

        <CardContent className="min-h-[260px] space-y-4">
          {step === 0 && (
            <div className="space-y-3">
              <Label>Where do you live?</Label>
              <LocationManager
                locations={locations}
                activeId={activeLoc}
                onSelect={(id) => setActiveLoc(id)}
                onAdd={(l) => {
                  setLocations((prev) => [...prev, l]);
                  setActiveLoc(l.id);
                }}
                onRemove={(id) => {
                  setLocations((prev) => prev.filter((l) => l.id !== id));
                  if (activeLoc === id) setActiveLoc(null);
                }}
                max={3}
              />
              <p className="text-muted-foreground text-xs">
                We'll fetch real-time forecasts for these places. You can manage
                them later in Settings.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>How does your body run?</Label>
                <RadioGroup
                  value={sensitivity}
                  onValueChange={(v) => setSensitivity(v as TempSensitivity)}
                  className="grid gap-2 md:grid-cols-3"
                >
                  {(
                    [
                      { v: "hot", label: "Runs warm", emoji: "🥵" },
                      { v: "average", label: "Average", emoji: "🙂" },
                      { v: "cold", label: "Runs cold", emoji: "🥶" },
                    ] as { v: TempSensitivity; label: string; emoji: string }[]
                  ).map((o) => (
                    <Label
                      key={o.v}
                      htmlFor={`sens-${o.v}`}
                      className="hover:bg-secondary/60 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition"
                    >
                      <RadioGroupItem id={`sens-${o.v}`} value={o.v} />
                      <span className="text-xl" aria-hidden>
                        {o.emoji}
                      </span>
                      <span className="text-sm font-medium">{o.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Anything else? <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. cold hands always, hate sweaters indoors…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>Pick the styles that fit your vibe</Label>
              <ToggleGroup
                type="multiple"
                value={aesthetics}
                onValueChange={(v) => setAesthetics(v)}
                className="flex flex-wrap justify-start gap-2"
                variant="outline"
              >
                {AESTHETICS.map((a) => (
                  <ToggleGroupItem
                    key={a.id}
                    value={a.id}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-1"
                  >
                    <span aria-hidden>{a.emoji}</span>
                    {a.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-muted-foreground text-xs">
                Selected {aesthetics.length}. Pick as many as you like.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
                <Check className="size-7" />
              </div>
              <div>
                <p className="font-semibold">You're all set!</p>
                <p className="text-muted-foreground text-sm">
                  Next: add a few wardrobe pieces and we'll start styling.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="mr-1 size-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Next <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button onClick={finish}>Open my dashboard</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function descriptionFor(step: number) {
  switch (step) {
    case 0:
      return "Add up to 3 places. We'll only call the weather API for these.";
    case 1:
      return "Helps us nudge recommendations warmer or lighter for you.";
    case 2:
      return "We'll prioritize wardrobe items tagged with these vibes.";
    default:
      return "Let's start dressing for the weather.";
  }
}
