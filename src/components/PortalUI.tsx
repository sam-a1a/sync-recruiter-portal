import {
  useId,
  useRef,
  type ReactNode,
  type AnchorHTMLAttributes,
} from "react";
import { Icon, type IconName } from "./Icon";
import { Button } from "./Button";
import { href } from "../app/base";
import { navigate } from "../app/router";
import { initials } from "../data";
export function Link({
  to,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return (
    <a
      {...props}
      href={href(to)}
      onClick={(e) => {
        props.onClick?.(e);
        if (
          !e.defaultPrevented &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          e.button === 0
        ) {
          e.preventDefault();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
}
export function Header({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </header>
  );
}
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className="badge" data-tone={tone}>
      {children}
    </span>
  );
}
export function Status({ value }: { value: string }) {
  const tone = [
    "Qualified",
    "Published",
    "Confirmed",
    "Active",
    "Hired",
  ].includes(value)
    ? "positive"
    : [
          "New",
          "Interview",
          "Offer",
          "Awaiting confirmation",
          "Invited",
          "Pending",
        ].includes(value)
      ? "accent"
      : ["Rejected", "Not qualified", "Denied", "Error"].includes(value)
        ? "error"
        : "neutral";
  return <Badge tone={tone}>{value}</Badge>;
}
export function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <span
      className={`avatar ${large ? "avatar--large" : ""}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
export function Empty({
  title = "Nothing here yet",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon name="inbox" size={32} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
export function Search({
  value,
  onChange,
  placeholder = "Search",
  label = placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <label className="search-field">
      <Icon name="search" />
      <input
        aria-label={label}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Tabs({
  options,
  value,
  onChange,
  label = "View",
}: {
  options: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const id = useId();
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((option, index) => (
        <button
          className="tab"
          type="button"
          role="tab"
          aria-selected={option.id === value}
          tabIndex={option.id === value ? 0 : -1}
          key={option.id}
          id={`${id}-${option.id}`}
          ref={(el) => {
            if (el) refs.current.set(option.id, el);
            else refs.current.delete(option.id);
          }}
          onClick={() => onChange(option.id)}
          onFocus={(e) =>
            e.currentTarget.scrollIntoView({
              block: "nearest",
              inline: "nearest",
            })
          }
          onKeyDown={(e) => {
            let target: number;
            if (e.key === "ArrowRight") target = (index + 1) % options.length;
            else if (e.key === "ArrowLeft")
              target = (index - 1 + options.length) % options.length;
            else if (e.key === "Home") target = 0;
            else if (e.key === "End") target = options.length - 1;
            else return;
            e.preventDefault();
            onChange(options[target].id);
            refs.current.get(options[target].id)?.focus();
          }}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="tab-count">{option.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
export function Metric({
  label,
  value,
  icon,
  to,
  featured = false,
  note,
}: {
  label: string;
  value: number | string;
  icon: IconName;
  to?: string;
  featured?: boolean;
  note: string;
}) {
  const content = (
    <>
      <span className="metric-label">
        <Icon name={icon} />
        {label}
        <Icon name="arrow_forward" size={18} />
      </span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </>
  );
  return to ? (
    <Link to={to} className={`metric ${featured ? "metric--featured" : ""}`}>
      {content}
    </Link>
  ) : (
    <div className={`metric ${featured ? "metric--featured" : ""}`}>
      {content}
    </div>
  );
}
export function Back({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="back-link">
      <Icon name="arrow_back" size={18} />
      {label}
    </Link>
  );
}
export function Confirm({
  title,
  description,
  onConfirm,
  onCancel,
  action = "Confirm",
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  action?: string;
}) {
  return (
    <div className="confirmation">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="actions">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="filled" onClick={onConfirm}>
          {action}
        </Button>
      </div>
    </div>
  );
}
