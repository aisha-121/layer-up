import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { storeImage } from "@/db/storage";
import { CATEGORIES, SEASONS, OCCASIONS, AESTHETICS } from "@/lib/constants";
import type {
  Aesthetic,
  Category,
  Occasion,
  Season,
  WardrobeItem,
} from "@/types";
import { Plus, Camera } from "lucide-react";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";

interface Props {
  trigger?: React.ReactNode;
  onAdd: (item: WardrobeItem) => void;
}

export function AddItemDialog({ trigger, onAdd }: Props) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<Category>("top");
  const [seasons, setSeasons] = React.useState<Season[]>(["spring", "summer"]);
  const [color, setColor] = React.useState("");
  const [material, setMaterial] = React.useState("");
  const [warmth, setWarmth] = React.useState<number>(3);
  const [occasions, setOccasions] = React.useState<Occasion[]>(["casual"]);
  const [aesthetics, setAesthetics] = React.useState<Aesthetic[]>([]);

  function reset() {
    setImageBlob(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setCategory("top");
    setSeasons(["spring", "summer"]);
    setColor("");
    setMaterial("");
    setWarmth(3);
    setOccasions(["casual"]);
    setAesthetics([]);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5 MB).");
      return;
    }
    setImageBlob(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!imageBlob) {
      toast.error("Add an image of the item.");
      return;
    }
    if (seasons.length === 0) {
      toast.error("Pick at least one season.");
      return;
    }
    setSubmitting(true);
    try {
      const imageRef = await storeImage(imageBlob);
      const item: WardrobeItem = {
        id: uuid(),
        imageRef,
        category,
        seasons,
        color: color.trim() || undefined,
        material: material.trim() || undefined,
        warmthRating: warmth as 1 | 2 | 3 | 4 | 5,
        occasions,
        aesthetics,
        dateAdded: new Date().toISOString(),
        lastWorn: null,
        wearCount: 0,
      };
      onAdd(item);
      toast.success("Added to closet.");
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save item");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-1 size-4" /> Add item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] max-w-lg overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add wardrobe item</DialogTitle>
          <DialogDescription>
            A clear photo helps recommendations look right.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60svh] px-6">
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Photo</Label>
              <label className="border-input bg-secondary/40 hover:bg-secondary flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="size-full object-cover"
                  />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger id="cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seasons</Label>
              <ToggleGroup
                type="multiple"
                value={seasons}
                onValueChange={(v) => setSeasons(v as Season[])}
                variant="outline"
                className="flex flex-wrap justify-start gap-2"
              >
                {SEASONS.map((s) => (
                  <ToggleGroupItem
                    key={s.id}
                    value={s.id}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {s.emoji} {s.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="navy"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mat">Material</Label>
                <Input
                  id="mat"
                  placeholder="cotton"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Warmth: {warmth}/5</Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[warmth]}
                onValueChange={(v) => setWarmth(v[0])}
              />
              <p className="text-muted-foreground text-xs">
                1 = very light · 5 = heavy/insulated
              </p>
            </div>

            <div className="space-y-2">
              <Label>Occasions</Label>
              <ToggleGroup
                type="multiple"
                value={occasions}
                onValueChange={(v) => setOccasions(v as Occasion[])}
                variant="outline"
                className="flex flex-wrap justify-start gap-2"
              >
                {OCCASIONS.map((o) => (
                  <ToggleGroupItem
                    key={o.id}
                    value={o.id}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <Label>Aesthetics</Label>
              <ToggleGroup
                type="multiple"
                value={aesthetics}
                onValueChange={(v) => setAesthetics(v as Aesthetic[])}
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
          </div>
        </ScrollArea>
        <DialogFooter className="bg-background border-t px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : "Add to closet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
