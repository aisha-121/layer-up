import * as React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOOTDs, useWardrobe } from "@/hooks/useUserData";
import { useImageURL } from "@/hooks/useImageURL";
import { storeImage } from "@/db/storage";
import { useWeather } from "@/hooks/useWeather";
import { AESTHETICS } from "@/lib/constants";
import type {
  ComfortRating,
  OOTDLog,
  WearAgain,
  WardrobeItem,
} from "@/types";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import { Plus, Camera } from "lucide-react";

export function OOTDPage() {
  const { profile } = useAuth();
  const { logs, add, remove } = useOOTDs();
  const { items, incrementWear } = useWardrobe();
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );

  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const todayLog = dateKey
    ? logs.find((l) => l.date === dateKey)
    : undefined;

  const loggedDates = React.useMemo(
    () => logs.map((l) => new Date(l.date)),
    [logs],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Outfit of the Day
          </h1>
          <p className="text-muted-foreground text-sm">
            Track what you wore and how it felt.
          </p>
        </div>
        <LogOOTDDialog
          open={open}
          setOpen={setOpen}
          wardrobe={items}
          onAdd={(log) => {
            add(log);
            incrementWear(log.itemsWorn, log.date);
          }}
          activeLocation={profile?.preferences.savedLocations[0] ?? null}
          existingDates={logs.map((l) => l.date)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ logged: loggedDates }}
              modifiersClassNames={{
                logged:
                  "bg-primary/15 text-primary font-semibold rounded-md",
              }}
              className="mx-auto"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Pick a date"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayLog ? (
              <OOTDDetails
                log={todayLog}
                wardrobe={items}
                onDelete={() => remove(todayLog.id)}
              />
            ) : (
              <div className="bg-secondary/40 flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
                <p className="text-muted-foreground text-sm">
                  No outfit logged for this day.
                </p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-1 size-4" /> Log OOTD
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OOTDDetails({
  log,
  wardrobe,
  onDelete,
}: {
  log: OOTDLog;
  wardrobe: WardrobeItem[];
  onDelete: () => void;
}) {
  const url = useImageURL(log.imageRef);
  const worn = wardrobe.filter((i) => log.itemsWorn.includes(i.id));
  const comfortLabel: Record<ComfortRating, string> = {
    cold: "🥶 Too cold",
    okay: "🙂 Just right",
    hot: "🥵 Too hot",
  };
  return (
    <div className="space-y-3">
      {url && (
        <img
          src={url}
          alt="Outfit of the day"
          className="w-full rounded-lg object-cover"
          style={{ maxHeight: 360 }}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {log.weather && (
          <Badge variant="secondary">
            {Math.round(log.weather.temp)}° · {log.weather.description}
          </Badge>
        )}
        {log.aesthetic && <Badge variant="secondary">{log.aesthetic}</Badge>}
        <Badge variant="secondary">{comfortLabel[log.comfortRating]}</Badge>
        {log.wouldWearAgain && (
          <Badge variant="outline">
            {log.wouldWearAgain === "yes"
              ? "Wear again ✓"
              : log.wouldWearAgain === "no"
                ? "Skip next time"
                : "With changes"}
          </Badge>
        )}
      </div>
      {worn.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
            Pieces worn
          </p>
          <div className="flex flex-wrap gap-2">
            {worn.map((w) => (
              <Badge key={w.id} variant="outline" className="capitalize">
                {w.category}
                {w.color ? ` · ${w.color}` : ""}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {log.notes && (
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
            Notes
          </p>
          <p className="text-sm">{log.notes}</p>
        </div>
      )}
      <Button variant="ghost" size="sm" onClick={onDelete}>
        Delete log
      </Button>
    </div>
  );
}

function LogOOTDDialog({
  open,
  setOpen,
  wardrobe,
  onAdd,
  activeLocation,
  existingDates,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  wardrobe: WardrobeItem[];
  onAdd: (log: OOTDLog) => void;
  activeLocation: { latitude: number; longitude: number } | null;
  existingDates: string[];
}) {
  const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [worn, setWorn] = React.useState<string[]>([]);
  const [aesthetic, setAesthetic] = React.useState<string | "">("");
  const [comfort, setComfort] = React.useState<ComfortRating>("okay");
  const [again, setAgain] = React.useState<WearAgain>("yes");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const { weather } = useWeather(
    activeLocation?.latitude ?? null,
    activeLocation?.longitude ?? null,
  );

  function reset() {
    setImageBlob(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setDate(format(new Date(), "yyyy-MM-dd"));
    setWorn([]);
    setAesthetic("");
    setComfort("okay");
    setAgain("yes");
    setNotes("");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5 MB).");
      return;
    }
    setImageBlob(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!imageBlob) {
      toast.error("Add a photo of today's outfit.");
      return;
    }
    if (existingDates.includes(date)) {
      toast.error("There's already a log for that date.");
      return;
    }
    setSubmitting(true);
    try {
      const imageRef = await storeImage(imageBlob);
      onAdd({
        id: uuid(),
        date,
        imageRef,
        itemsWorn: worn,
        weather: weather
          ? {
              temp: weather.temperature,
              weatherCode: weather.weatherCode,
              description: weather.description,
              humidity: weather.humidity,
            }
          : null,
        aesthetic: aesthetic || null,
        comfortRating: comfort,
        wouldWearAgain: again,
        notes,
      });
      toast.success("OOTD saved.");
      setOpen(false);
      reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" /> Log OOTD
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] max-w-lg overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Log today's outfit</DialogTitle>
          <DialogDescription>
            Capturing comfort + weather builds your style memory.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60svh] px-6">
          <div className="space-y-5 py-4">
            <label className="border-input bg-secondary/40 hover:bg-secondary flex aspect-[4/5] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
              {preview ? (
                <img src={preview} alt="OOTD" className="size-full object-cover" />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
                  <Camera className="size-6" />
                  Tap to add photo
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={onFile}
              />
            </label>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            {wardrobe.length > 0 && (
              <div className="space-y-2">
                <Label>What did you wear?</Label>
                <ToggleGroup
                  type="multiple"
                  value={worn}
                  onValueChange={(v) => setWorn(v)}
                  variant="outline"
                  className="flex flex-wrap justify-start gap-2"
                >
                  {wardrobe.map((it) => (
                    <ToggleGroupItem
                      key={it.id}
                      value={it.id}
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground capitalize"
                    >
                      {it.category}
                      {it.color ? ` · ${it.color}` : ""}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label>Aesthetic</Label>
              <Select value={aesthetic} onValueChange={(v) => setAesthetic(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="(optional)" />
                </SelectTrigger>
                <SelectContent>
                  {AESTHETICS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.emoji} {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>How did it feel?</Label>
              <RadioGroup
                value={comfort}
                onValueChange={(v) => setComfort(v as ComfortRating)}
                className="grid grid-cols-3 gap-2"
              >
                {(["cold", "okay", "hot"] as ComfortRating[]).map((c) => (
                  <Label
                    key={c}
                    htmlFor={`c-${c}`}
                    className="hover:bg-secondary/60 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium capitalize"
                  >
                    <RadioGroupItem id={`c-${c}`} value={c} />
                    {c}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Wear again?</Label>
              <RadioGroup
                value={again}
                onValueChange={(v) => setAgain(v as WearAgain)}
                className="grid grid-cols-3 gap-2"
              >
                {(
                  [
                    { v: "yes", label: "Yes" },
                    { v: "changes", label: "With changes" },
                    { v: "no", label: "No" },
                  ] as { v: WearAgain; label: string }[]
                ).map((o) => (
                  <Label
                    key={o.v}
                    htmlFor={`a-${o.v}`}
                    className="hover:bg-secondary/60 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium"
                  >
                    <RadioGroupItem id={`a-${o.v}`} value={o.v} />
                    {o.label}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ootd-notes">Notes</Label>
              <Textarea
                id="ootd-notes"
                rows={3}
                placeholder="Mood, occasion, mistakes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="bg-background border-t px-6 py-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : "Save log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
