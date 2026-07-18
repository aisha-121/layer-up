import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { Plus, MapPin, X } from "lucide-react";
import type { SavedLocation } from "@/types";
import { toast } from "sonner";

interface Props {
  locations: SavedLocation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onAdd: (loc: SavedLocation) => void;
  onRemove?: (id: number) => void;
  max?: number;
}

export function LocationManager({
  locations,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  max = 3,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { results, loading } = useLocationSearch(query);

  const atMax = locations.length >= max;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {locations.map((l) => (
        <Badge
          key={l.id}
          variant={l.id === activeId ? "default" : "secondary"}
          className="cursor-pointer gap-1 px-2.5 py-1"
          onClick={() => onSelect(l.id)}
        >
          <MapPin className="size-3" />
          {l.label || l.name}
          {onRemove && (
            <button
              type="button"
              aria-label={`Remove ${l.name}`}
              className="hover:bg-foreground/10 ml-1 rounded-full p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(l.id);
              }}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={atMax}
            className="h-7 gap-1"
          >
            <Plus className="size-3" />
            {atMax ? `Max ${max} locations` : "Add location"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search city…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && (
                <div className="text-muted-foreground p-3 text-xs">
                  Searching…
                </div>
              )}
              {!loading && query.length >= 2 && results.length === 0 && (
                <CommandEmpty>No matches.</CommandEmpty>
              )}
              {results.length > 0 && (
                <CommandGroup heading="Results">
                  {results.map((r) => (
                    <CommandItem
                      key={`${r.id}-${r.latitude}`}
                      value={`${r.name}-${r.id}`}
                      onSelect={() => {
                        if (locations.some((x) => x.id === r.id)) {
                          toast.info("Location already added.");
                          return;
                        }
                        onAdd({
                          id: r.id,
                          name: r.name,
                          country: r.country,
                          admin1: r.admin1,
                          latitude: r.latitude,
                          longitude: r.longitude,
                        });
                        setQuery("");
                        setOpen(false);
                      }}
                    >
                      <MapPin className="mr-2 size-3" />
                      <span>
                        {r.name}
                        {r.admin1 ? `, ${r.admin1}` : ""}, {r.country}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
