import { animateLayout } from "../app/animateLayout";
import { useState } from "react";
export type CollectionView = "cards" | "rows";

/** A presentation preference: independent from the list's filters and selection. */
export function useCollectionView(
  collection: string,
  fallback: CollectionView = "cards",
) {
  const key = `sync-recruiter-view-${collection}`;
  const [view, setView] = useState<CollectionView>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === "cards" || saved === "rows") return saved;
    } catch {
      /* The view still works for this session. */
    }
    return fallback;
  });
  return [
    view,
    (next: CollectionView) => {
      if (next === view) return;
      animateLayout(() => setView(next));
      try {
        localStorage.setItem(key, next);
      } catch {
        /* Optional persistence. */
      }
    },
  ] as const;
}
