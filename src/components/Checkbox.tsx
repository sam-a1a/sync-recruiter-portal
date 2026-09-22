import type { InputHTMLAttributes } from "react";
export function Checkbox({
  label,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }) {
  return (
    <label
      className="expressive-checkbox"
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
    </label>
  );
}
