import {
  Header,
  Metric,
  Panel,
  Link,
  Avatar,
  Status,
  Empty,
} from "../components/PortalUI";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { navigate } from "../app/router";
import { useWorkspace } from "../store";
import { dateLabel } from "../data";
export function Dashboard() {
  const { data } = useWorkspace();
  const waiting = data.applications.filter((a) => a.stage === "New");
  const published = data.jobs.filter((j) => j.status === "Published");
  const channelData = data.channels
    .map((channel) => {
      const links = data.links.filter((l) => l.channel === channel);
      return {
        name: channel,
        views: links.reduce((n, l) => n + l.views, 0),
        applications: links.reduce((n, l) => n + l.applications, 0),
      };
    })
    .sort((a, b) => b.views - a.views);
  const max = Math.max(1, ...channelData.map((c) => c.views));
  return (
    <>
      <Header
        eyebrow={new Intl.DateTimeFormat("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(new Date())}
        title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${data.account.name.split(" ")[0]}.`}
        description="A little clarity for the work ahead."
        actions={
          <Button
            variant="tonal"
            icon="add"
            onClick={() => navigate("/jobs/new")}
          >
            Create job
          </Button>
        }
      />
      <div className="metrics">
        <Metric
          label="Awaiting review"
          value={waiting.length}
          icon="inbox"
          to="/applications?stage=New"
          featured
          note="Your next conversations start here"
        />
        <Metric
          label="Open jobs"
          value={published.length}
          icon="work"
          to="/jobs?status=Published"
          note="Opportunities you’re building"
        />
        <Metric
          label="Applications"
          value={data.applications.length}
          icon="description"
          to="/applications?stage=All"
          note="Across all your roles"
        />
        <Metric
          label="Qualified"
          value={
            data.applications.filter((a) => a.screening === "Qualified").length
          }
          icon="checklist"
          to="/applications?stage=All&screening=Qualified"
          note="Met the screening requirements"
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Ready for your review"
          action={
            <Link className="text-link" to="/applications?stage=New">
              View all <Icon name="arrow_forward" size={18} />
            </Link>
          }
          className="review-panel"
        >
          <p className="panel-note">
            Fresh applications. A person behind every one.
          </p>
          <div className="record-list">
            {waiting.slice(0, 4).map((a) => {
              const c = data.candidates.find((c) => c.id === a.candidateId)!;
              const job = data.jobs.find((j) => j.id === a.jobId)!;
              return (
                <Link
                  className="review-row"
                  key={a.id}
                  to={`/applications/${a.id}`}
                >
                  <Avatar name={c.name} />
                  <div className="record-primary">
                    <strong>{c.name}</strong>
                    <span>{job.title}</span>
                  </div>
                  <div className="record-trailing">
                    <Status value={a.screening} />
                    <span className="meta">{dateLabel(a.date)}</span>
                  </div>
                  <Icon name="arrow_forward" size={20} />
                </Link>
              );
            })}
            {waiting.length === 0 && (
              <Empty
                title="You’re all caught up"
                description="There are no new applications waiting for review."
              />
            )}
          </div>
          <div className="panel-bottom">
            <Icon name="info" size={18} />
            <span>
              Screening supports your decision. It doesn’t replace it.
            </span>
          </div>
        </Panel>
        <Panel
          title="Your hiring pipeline"
          action={<Icon name="data_usage" />}
          className="pipeline-summary"
        >
          <p className="panel-note">Where your open conversations stand.</p>
          {["New", "Reviewing", "Shortlisted", "Interview", "Offer"].map(
            (s, i) => {
              const count = data.applications.filter(
                (a) => a.stage === s,
              ).length;
              return (
                <Link
                  to={`/applications?stage=${s}`}
                  className="pipeline-summary-row"
                  key={s}
                >
                  <span className="pipeline-dot" data-step={i} />
                  <span>{s}</span>
                  <span className="pipeline-mini-track">
                    <span style={{ width: `${Math.max(count * 22, 8)}%` }} />
                  </span>
                  <strong>{count}</strong>
                </Link>
              );
            },
          )}
          <div className="pipeline-summary-footer">
            <Icon name="check_box" />
            <div>
              <strong>
                {
                  data.applications.filter(
                    (a) => a.confirmation === "Confirmed",
                  ).length
                }{" "}
                confirmed placement
              </strong>
              <span>Good work, finding its people.</span>
            </div>
          </div>
        </Panel>
        <Panel
          title="Open opportunities"
          action={
            <Link className="text-link" to="/jobs">
              All jobs <Icon name="arrow_forward" size={18} />
            </Link>
          }
        >
          <div className="record-list">
            {published.slice(0, 3).map((j) => (
              <Link to={`/jobs/${j.id}`} className="job-summary-row" key={j.id}>
                <span className="job-symbol">
                  <Icon name="work" />
                </span>
                <div className="record-primary">
                  <strong>{j.title}</strong>
                  <span>
                    {j.location} · {j.mode}
                  </span>
                </div>
                <div className="record-trailing">
                  <strong>
                    {data.applications.filter((a) => a.jobId === j.id).length}
                  </strong>
                  <span className="meta">applications</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel
          title="Where people find you"
          action={
            <Link className="text-link" to="/tracked-links">
              Details <Icon name="arrow_forward" size={18} />
            </Link>
          }
        >
          <p className="panel-note">
            Job views and applications from your tracked links.
          </p>
          <div className="channel-chart">
            {channelData.map((c, i) => (
              <div className="channel-chart-row" key={c.name}>
                <div>
                  <span>{c.name}</span>
                  <strong>
                    {c.views}
                    <small> views</small>
                  </strong>
                </div>
                <div className="channel-bar-track">
                  <span
                    data-tone={i % 2}
                    style={{ width: `${(c.views / max) * 100}%` }}
                  />
                </div>
                <p>
                  {c.applications} applications ·{" "}
                  {c.views ? Math.round((c.applications / c.views) * 100) : 0}%
                  conversion
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
