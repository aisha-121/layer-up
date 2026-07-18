import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOutfits, useWardrobe } from "@/hooks/useUserData";
import { WardrobeItemTile } from "@/components/app/wardrobe/wardrobe-item";
import { Bookmark, Star, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SavedOutfit } from "@/types";
import { cn } from "@/lib/utils";

export function SavedOutfitsPage() {
  const { outfits, remove, update } = useOutfits();
  const { items } = useWardrobe();
  const [pendingDelete, setPendingDelete] = React.useState<SavedOutfit | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Saved looks
        </h1>
        <p className="text-muted-foreground text-sm">
          {outfits.length} {outfits.length === 1 ? "outfit" : "outfits"}
        </p>
      </div>

      {outfits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <Bookmark className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">
              Save a look from the dashboard and it'll show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {outfits.map((o) => {
            const pieces = items.filter((i) => o.itemIds.includes(i.id));
            return (
              <Card key={o.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{o.name}</CardTitle>
                    <p className="text-muted-foreground text-xs">
                      Saved {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete outfit"
                    onClick={() => setPendingDelete(o)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {o.createdFrom.weather && (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {Math.round(o.createdFrom.weather.temp)}°
                      </Badge>
                      {o.createdFrom.aesthetic && (
                        <Badge variant="secondary">
                          {o.createdFrom.aesthetic}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {pieces.map((p) => (
                      <WardrobeItemTile key={p.id} item={p} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`Rate ${n}`}
                        onClick={() =>
                          update(o.id, { rating: n === o.rating ? 0 : n })
                        }
                      >
                        <Star
                          className={cn(
                            "size-4 transition",
                            n <= o.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this outfit?</AlertDialogTitle>
            <AlertDialogDescription>
              The wardrobe items themselves will stay in your closet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) remove(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
