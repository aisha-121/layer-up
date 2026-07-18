import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getWardrobe,
  saveWardrobe,
  getOOTDs,
  saveOOTDs,
  getOutfits,
  saveOutfits,
  deleteImage,
} from "@/db/storage";
import type { OOTDLog, SavedOutfit, WardrobeItem } from "@/types";

export function useWardrobe() {
  const { email } = useAuth();
  const [items, setItems] = React.useState<WardrobeItem[]>([]);

  React.useEffect(() => {
    if (!email) return;
    setItems(getWardrobe(email));
  }, [email]);

  const persist = React.useCallback(
    (next: WardrobeItem[]) => {
      if (!email) return;
      setItems(next);
      saveWardrobe(email, next);
    },
    [email],
  );

  return {
    items,
    add: (item: WardrobeItem) => persist([item, ...items]),
    update: (id: string, patch: Partial<WardrobeItem>) =>
      persist(items.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    remove: async (id: string) => {
      const target = items.find((i) => i.id === id);
      if (target?.imageRef) await deleteImage(target.imageRef);
      persist(items.filter((i) => i.id !== id));
    },
    incrementWear: (ids: string[], date: string) =>
      persist(
        items.map((i) =>
          ids.includes(i.id)
            ? { ...i, wearCount: i.wearCount + 1, lastWorn: date }
            : i,
        ),
      ),
  };
}

export function useOOTDs() {
  const { email } = useAuth();
  const [logs, setLogs] = React.useState<OOTDLog[]>([]);

  React.useEffect(() => {
    if (!email) return;
    setLogs(getOOTDs(email));
  }, [email]);

  const persist = React.useCallback(
    (next: OOTDLog[]) => {
      if (!email) return;
      setLogs(next);
      saveOOTDs(email, next);
    },
    [email],
  );

  return {
    logs,
    add: (log: OOTDLog) => persist([log, ...logs]),
    remove: async (id: string) => {
      const target = logs.find((l) => l.id === id);
      if (target?.imageRef) await deleteImage(target.imageRef);
      persist(logs.filter((l) => l.id !== id));
    },
  };
}

export function useOutfits() {
  const { email } = useAuth();
  const [outfits, setOutfits] = React.useState<SavedOutfit[]>([]);

  React.useEffect(() => {
    if (!email) return;
    setOutfits(getOutfits(email));
  }, [email]);

  const persist = React.useCallback(
    (next: SavedOutfit[]) => {
      if (!email) return;
      setOutfits(next);
      saveOutfits(email, next);
    },
    [email],
  );

  return {
    outfits,
    add: (o: SavedOutfit) => persist([o, ...outfits]),
    remove: (id: string) => persist(outfits.filter((o) => o.id !== id)),
    update: (id: string, patch: Partial<SavedOutfit>) =>
      persist(outfits.map((o) => (o.id === id ? { ...o, ...patch } : o))),
  };
}
