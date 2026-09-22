import { useEffect } from "react";
import { WorkspaceProvider } from "./store";
import { Shell } from "./components/Shell";
import { usePathname } from "./app/router";
import { Dashboard } from "./features/Dashboard";
import { Jobs, JobDetail, JobWizard } from "./features/Jobs";
import { Applications, ApplicationReview } from "./features/Applications";
import { Candidates, CandidateDetail, Placements } from "./features/People";
import {
  Templates,
  TrackedLinks,
  Settings,
  Account,
} from "./features/Workspace";
import { PublicPage } from "./features/Public";
import { Empty, Link } from "./components/PortalUI";
function Router() {
  const location = usePathname();
  const path = location.split("?")[0];
  useEffect(() => {
    const name = path.split("/")[1]?.replaceAll("-", " ") || "Dashboard";
    document.title = `${name.charAt(0).toUpperCase() + name.slice(1)} · SYNC Hub Recruiter`;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [path]);
  let page;
  if (
    [
      "/welcome",
      "/login",
      "/forgot-password",
      "/request-access",
      "/auth/accept-invite",
      "/auth/reset-password",
    ].includes(path)
  )
    return <PublicPage path={path} />;
  if (path === "/" || path === "/dashboard") page = <Dashboard />;
  else if (path === "/jobs/new") page = <JobWizard />;
  else if (path === "/jobs") page = <Jobs />;
  else if (path.startsWith("/jobs/"))
    page = <JobDetail id={path.split("/")[2]} />;
  else if (path === "/applications") page = <Applications />;
  else if (path.startsWith("/applications/"))
    page = <ApplicationReview id={path.split("/")[2]} />;
  else if (path === "/candidates") page = <Candidates />;
  else if (path === "/talent-pool") page = <Candidates saved />;
  else if (path.startsWith("/candidates/"))
    page = <CandidateDetail id={path.split("/")[2]} />;
  else if (path === "/placements") page = <Placements />;
  else if (path === "/templates") page = <Templates />;
  else if (path === "/tracked-links") page = <TrackedLinks />;
  else if (path === "/settings") page = <Settings />;
  else if (path === "/account") page = <Account />;
  else
    page = (
      <Empty
        title="This page isn’t here"
        action={<Link to="/dashboard">Back to your dashboard</Link>}
      />
    );
  return (
    <Shell path={path === "/" ? "/dashboard" : path}>
      <div className="page-enter" key={path}>
        {page}
      </div>
    </Shell>
  );
}
export default function App() {
  return (
    <WorkspaceProvider>
      <Router />
    </WorkspaceProvider>
  );
}
