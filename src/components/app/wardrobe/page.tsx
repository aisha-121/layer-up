import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddItemDialog } from "@/components/app/wardrobe/add-item";
import { WardrobeItemTile } from "@/components/app/wardrobe/wardrobe-item";
import { useWardrobe } from "@/hooks/useUserData";
import { CATEGORIES, SEASONS } from "@/lib/constants";
import type { Category, Season, WardrobeItem } from "@/types";
import { Trash2, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WardrobePage() {
  const { items, add, remove } = useWardrobe();
  const [tab, setTab] = React.useState<"all" | Season>("all");
  const [catFilter, setCatFilter] = React.useState<Category[]>([]);
  const [pendingDelete, setPendingDelete] = React.useState<WardrobeItem | null>(
    null,
  );

  const filtered = items.filter((it) => {
    const seasonOK = tab === "all" || it.seasons.includes(tab);
    const catOK = catFilter.length === 0 || catFilter.includes(it.category);
    return seasonOK && catOK;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Wardrobe
          </h1>
          <p className="text-muted-foreground text-sm">
            {items.length} {items.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-1 size-4" />
                Filter
                {catFilter.length > 0 && ` · ${catFilter.length}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CATEGORIES.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={catFilter.includes(c.id)}
                  onCheckedChange={(checked) =>
                    setCatFilter((prev) =>
                      checked ? [...prev, c.id] : prev.filter((x) => x !== c.id),
                    )
                  }
                >
                  {c.emoji} {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddItemDialog onAdd={add} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full md:w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          {SEASONS.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              <span className="mr-1" aria-hidden>
                {s.emoji}
              </span>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <p className="text-muted-foreground text-sm">
                  No pieces here yet.
                </p>
                <AddItemDialog onAdd={add} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((it) => (
                <div key={it.id} className="group relative">
                  <WardrobeItemTile item={it} />
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label="Delete item"
                    className="absolute right-2 top-2 size-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => setPendingDelete(it)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              The image will be deleted from your device. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDelete) await remove(pendingDelete.id);
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
