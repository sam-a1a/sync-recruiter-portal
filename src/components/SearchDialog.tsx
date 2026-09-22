import { useState, type ReactNode } from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Empty } from "./PortalUI";
export type SearchOption = {
  id: string;
  label: string;
  keywords?: string;
  leading?: ReactNode;
  trailing?: string;
  taken?: boolean;
};
export function SearchDialog({
  title,
  placeholder,
  options,
  onPick,
  onClose,
}: {
  title: string;
  placeholder: string;
  options: SearchOption[];
  onPick: (value: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = options.filter((option) =>
    `${option.label} ${option.keywords || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <Dialog
      open
      onClose={onClose}
      headline={title}
      actions={<Button onClick={onClose}>Cancel</Button>}
    >
      <div className="catalogue-picker">
        <label className="search-field">
          <Icon name="search" />
          <input
            autoFocus
            type="search"
            aria-label={placeholder}
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="meta" role="status">
          {results.length} options · Already chosen entries are checked
        </p>
        <ul className="catalogue-results">
          {results.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                disabled={option.taken}
                onClick={() => {
                  onPick(option.id);
                  onClose();
                }}
              >
                <span className="catalogue-leading">{option.leading}</span>
                <span className="catalogue-name">{option.label}</span>
                {option.trailing && (
                  <span className="meta" dir="auto">
                    {option.trailing}
                  </span>
                )}
                {option.taken && <Icon name="check" size={20} />}
              </button>
            </li>
          ))}
          {!results.length && (
            <li>
              <Empty
                title="No matches"
                description="Try another name or spelling."
              />
            </li>
          )}
        </ul>
      </div>
    </Dialog>
  );
}
