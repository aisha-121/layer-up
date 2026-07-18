import { Card, CardContent } from "@/components/ui/card";
import { useImageURL } from "@/hooks/useImageURL";
import { CATEGORIES } from "@/lib/constants";
import type { WardrobeItem } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  item: WardrobeItem;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function WardrobeItemTile({ item, selected, onClick, className }: Props) {
  const url = useImageURL(item.imageRef);
  const cat = CATEGORIES.find((c) => c.id === item.category);
  return (
    <Card
      onClick={onClick}
      className={cn(
        "overflow-hidden p-0 transition",
        onClick && "cursor-pointer hover:shadow-md",
        selected && "ring-primary ring-2",
        className,
      )}
    >
      <div className="bg-secondary relative aspect-square w-full">
        {url ? (
          <img
            src={url}
            alt={`${cat?.label ?? item.category}`}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl" aria-hidden>
            {cat?.emoji ?? "👕"}
          </div>
        )}
      </div>
      <CardContent className="space-y-1 p-2 text-xs">
        <p className="truncate font-medium">
          {cat?.emoji} {cat?.label}
        </p>
        <p className="text-muted-foreground truncate">
          {item.color ? <span>{item.color} · </span> : null}
          {item.warmthRating ? `Warmth ${item.warmthRating}/5` : "Unrated"}
        </p>
      </CardContent>
    </Card>
  );
}
