import * as React from "react";
import { getImageURL } from "@/db/storage";

export function useImageURL(id: string | null | undefined): string | null {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let revoked: string | null = null;
    if (!id) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    getImageURL(id).then((u) => {
      if (cancelled) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      revoked = u;
      setUrl(u);
    });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [id]);
  return url;
}
