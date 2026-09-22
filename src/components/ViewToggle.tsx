import type { CollectionView } from "../hooks/useCollectionView";

export function ViewToggle({
  value,
  onChange,
  label,
}: {
  value: CollectionView;
  onChange: (value: CollectionView) => void;
  label: string;
}) {
  return (
    <div className="view-toggle" role="group" aria-label={`${label} layout`}>
      {(["cards", "rows"] as const).map((view) => (
        <button
          type="button"
          key={view}
          aria-pressed={value === view}
          onClick={() => onChange(view)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            {view === "cards" ? (
              <>
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
              </>
            ) : (
              <>
                <rect x="3" y="4" width="18" height="6" rx="2" />
                <rect x="3" y="14" width="18" height="6" rx="2" />
              </>
            )}
          </svg>
          <span>{view === "cards" ? "Cards" : "Rows"}</span>
        </button>
      ))}
    </div>
  );
}
