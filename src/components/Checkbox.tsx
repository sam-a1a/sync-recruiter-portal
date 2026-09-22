import type { InputHTMLAttributes } from "react";
export function Checkbox({
  label,
  showLabel = false,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  showLabel?: boolean;
}) {
  return (
    <label
      className={`expressive-checkbox ${showLabel ? "expressive-checkbox--labelled" : ""}`}
      title={props.disabled ? `${label} — no compatible move available` : label}
    >
      <input {...props} type="checkbox" aria-label={label} />
      <span className="checkbox-state" aria-hidden="true">
        <span className="checkbox-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </span>
      </span>
      {showLabel && <span className="checkbox-label">{label}</span>}
    </label>
  );
}
