import { useState, type ReactNode } from "react";
import { Link, Avatar } from "./PortalUI";
import { Icon, type IconName } from "./Icon";
import { IconButton, Button } from "./Button";
import { Dialog } from "./Dialog";
import { asset } from "../app/base";
import { navigate } from "../app/router";
import { useTheme } from "../theme/useTheme";
import { useWorkspace } from "../store";
const destinations: {
  path: string;
  label: string;
  icon: IconName;
  group: string;
}[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    group: "Workspace",
  },
  { path: "/jobs", label: "Jobs", icon: "work", group: "Workspace" },
  {
    path: "/applications",
    label: "Applications",
    icon: "inbox",
    group: "Workspace",
  },
  {
    path: "/placements",
    label: "Placements",
    icon: "check_box",
    group: "Workspace",
  },
  { path: "/candidates", label: "Candidates", icon: "group", group: "People" },
  {
    path: "/talent-pool",
    label: "Talent pool",
    icon: "bookmark",
    group: "People",
  },
  {
    path: "/templates",
    label: "Templates",
    icon: "description",
    group: "Tools",
  },
  {
    path: "/tracked-links",
    label: "Tracked links",
    icon: "link",
    group: "Tools",
  },
  { path: "/settings", label: "Settings", icon: "settings", group: "Tools" },
];
export function Shell({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  const { data } = useWorkspace();
  const { resolvedTheme, setMode } = useTheme();
  const [more, setMore] = useState(false);
  const [about, setAbout] = useState(false);
  const active = destinations.find(
    (item) => path === item.path || path.startsWith(item.path + "/"),
  );
  const count = data.applications.filter((a) => a.stage === "New").length;
  const item = (destination: (typeof destinations)[number]) => (
    <Link
      key={destination.path}
      to={destination.path}
      className="navigation-item"
      aria-current={active?.path === destination.path ? "page" : undefined}
      onClick={() => setMore(false)}
      title={destination.label}
    >
      <span className="navigation-icon">
        <Icon name={destination.icon} />
      </span>
      <span className="navigation-label">{destination.label}</span>
      {destination.path === "/applications" && count > 0 && (
        <span className="navigation-count">{count}</span>
      )}
    </Link>
  );
  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <img src={asset("logo.png")} alt="" />
          <span>
            SYNC Hub<small>Recruiter portal</small>
          </span>
        </Link>
        <Button
          variant="filled"
          icon="add"
          className="new-job-button"
          onClick={() => navigate("/jobs/new")}
        >
          Create job
        </Button>
        <nav aria-label="Workspace">
          {["Workspace", "People", "Tools"].map((group) => (
            <div className="navigation-group" key={group}>
              <p className="navigation-group-label">{group}</p>
              {destinations.filter((d) => d.group === group).map(item)}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="workspace-monogram">OB</span>
          <span>
            {data.organization.name}
            <small>Recruiter workspace</small>
          </span>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="topbar-location">
            <img
              className="mobile-brand"
              src={asset("logo.png")}
              alt="SYNC Hub"
            />
            <span>{active?.label || "Account"}</span>
            <span className="topbar-divider">/</span>
            <span className="topbar-org">{data.organization.name}</span>
          </div>
          <div className="topbar-tools">
            <button className="preview-badge" onClick={() => setAbout(true)}>
              Design preview
            </button>
            <IconButton
              icon={resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
              label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              onClick={() =>
                setMode(resolvedTheme === "dark" ? "light" : "dark")
              }
            />
            <Link
              className="account-button"
              to="/account"
              aria-label="Your account"
            >
              <Avatar name={data.account.name} />
            </Link>
          </div>
        </header>
        <main id="main" className="workspace-main" tabIndex={-1}>
          {children}
        </main>
        <footer className="workspace-footer">
          <span>SYNC Hub · Recruiter workspace</span>
          <Link to="/welcome">
            About SYNC Hub <Icon name="arrow_forward" size={16} />
          </Link>
        </footer>
      </div>
      <nav className="mobile-navigation" aria-label="Mobile workspace">
        {destinations
          .filter((d) =>
            ["/dashboard", "/jobs", "/applications", "/candidates"].includes(
              d.path,
            ),
          )
          .map(item)}
        <button
          className="navigation-item"
          aria-label="More destinations"
          aria-expanded={more}
          onClick={() => setMore(true)}
        >
          <span className="navigation-icon">
            <Icon name="more_vert" />
          </span>
          <span className="navigation-label">More</span>
        </button>
      </nav>
      <Dialog
        open={more}
        onClose={() => setMore(false)}
        headline="Your workspace"
        actions={<Button onClick={() => setMore(false)}>Close</Button>}
      >
        <nav className="more-navigation" aria-label="More destinations">
          {destinations
            .filter(
              (d) =>
                ![
                  "/dashboard",
                  "/jobs",
                  "/applications",
                  "/candidates",
                ].includes(d.path),
            )
            .map(item)}
          <Link
            to="/account"
            className="navigation-item"
            onClick={() => setMore(false)}
          >
            <Icon name="account_circle" />
            Your account
          </Link>
        </nav>
      </Dialog>
      <Dialog
        open={about}
        onClose={() => setAbout(false)}
        headline="A workspace you can explore"
        description="This interactive design uses fictional people and organizations."
        actions={
          <Button variant="filled" onClick={() => setAbout(false)}>
            Got it
          </Button>
        }
      >
        <p>
          Try creating a job, reviewing applications or saving candidates. Your
          changes stay in this browser. Emails, AI services and production
          records are not connected.
        </p>
        <p className="mt">You can restore the sample workspace in Settings.</p>
      </Dialog>
    </div>
  );
}
