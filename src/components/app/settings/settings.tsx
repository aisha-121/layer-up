import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { LocationManager } from "@/components/app/weather/location-manager";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { exportAllData } from "@/db/storage";
import { AESTHETICS } from "@/lib/constants";
import type { TempSensitivity } from "@/types";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const { profile, email, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!profile) return null;

  async function onExport() {
    if (!email) return;
    const json = await exportAllData(email);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `layerup-export-${email}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">{profile.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
              <SelectTrigger id="theme" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Tip: press <kbd className="bg-secondary rounded px-1">d</kbd> anywhere to toggle.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <LocationManager
            locations={profile.preferences.savedLocations}
            activeId={profile.preferences.savedLocations[0]?.id ?? null}
            onSelect={() => {}}
            onAdd={(l) =>
              updateProfile((p) => ({
                ...p,
                preferences: {
                  ...p.preferences,
                  savedLocations: [...p.preferences.savedLocations, l].slice(0, 3),
                },
              }))
            }
            onRemove={(id) =>
              updateProfile((p) => ({
                ...p,
                preferences: {
                  ...p.preferences,
                  savedLocations: p.preferences.savedLocations.filter(
                    (l) => l.id !== id,
                  ),
                },
              }))
            }
            max={3}
          />
          <p className="text-muted-foreground text-xs">
            Up to 3. The first one is used by default.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comfort preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Temperature sensitivity</Label>
            <RadioGroup
              value={profile.preferences.temperatureSensitivity}
              onValueChange={(v) =>
                updateProfile((p) => ({
                  ...p,
                  preferences: {
                    ...p.preferences,
                    temperatureSensitivity: v as TempSensitivity,
                  },
                }))
              }
              className="grid gap-2 md:grid-cols-3"
            >
              {(["hot", "average", "cold"] as TempSensitivity[]).map((v) => (
                <Label
                  key={v}
                  htmlFor={`s-${v}`}
                  className="hover:bg-secondary/60 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm capitalize"
                >
                  <RadioGroupItem id={`s-${v}`} value={v} />
                  Runs {v}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={profile.preferences.sensitivityNotes}
              onChange={(e) =>
                updateProfile((p) => ({
                  ...p,
                  preferences: { ...p.preferences, sensitivityNotes: e.target.value },
                }))
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Saved aesthetics</Label>
            <ToggleGroup
              type="multiple"
              value={profile.preferences.savedAesthetics}
              onValueChange={(v) =>
                updateProfile((p) => ({
                  ...p,
                  preferences: { ...p.preferences, savedAesthetics: v },
                }))
              }
              variant="outline"
              className="flex flex-wrap justify-start gap-2"
            >
              {AESTHETICS.map((a) => (
                <ToggleGroupItem
                  key={a.id}
                  value={a.id}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {a.emoji} {a.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={onExport} variant="outline">
            <Download className="mr-1 size-4" /> Export data (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
