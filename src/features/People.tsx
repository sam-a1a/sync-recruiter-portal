import { useState } from "react";
import {
  Header,
  Panel,
  Tabs,
  Link,
  Avatar,
  Badge,
  Status,
  Empty,
  Back,
  Search,
} from "../components/PortalUI";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { SelectField, TextField, TextArea } from "../components/Field";
import { Dialog, ConfirmDialog } from "../components/Dialog";
import { useWorkspace } from "../store";
import { useQuery } from "../app/router";
import { dateLabel, roles, locations, skills, type Candidate } from "../data";
import { Notes, TagsEditor } from "./Applications";
export function Candidates({ saved = false }: { saved?: boolean }) {
  const { data, setData, notify } = useWorkspace();
  const { params, set } = useQuery();
  const tab = params.get("tab") || "filter";
  const q = params.get("q") || "";
  const [words, setWords] = useState(q);
  const [filtersOpen, setFiltersOpen] = useState(
    () => window.matchMedia("(min-width: 761px)").matches,
  );
  const [filters, setFilters] = useState({
    role: params.get("role") || "",
    location: params.get("location") || "",
    years: params.get("years") || "",
    skill: params.get("skill") || "",
    language: params.get("language") || "",
  });
  const [drop, setDrop] = useState<Candidate | null>(null);
  const order = params.get("sort") || "newest";
  const list = data.candidates
    .filter(
      (c) =>
        (!saved || c.saved) &&
        (!saved ||
          `${c.name} ${c.role}`.toLowerCase().includes(q.toLowerCase())) &&
        (!params.get("role") || c.role === params.get("role")) &&
        (!params.get("location") || c.location === params.get("location")) &&
        (!params.get("years") || c.years >= Number(params.get("years"))) &&
        (!params.get("skill") || c.skills.includes(params.get("skill")!)) &&
        (!params.get("language") ||
          c.languages.includes(params.get("language")!)),
    )
    .sort((a, b) =>
      order === "name"
        ? a.name.localeCompare(b.name)
        : order === "experience"
          ? b.years - a.years
          : order === "experience-asc"
            ? a.years - b.years
            : saved
              ? (b.savedAt || "").localeCompare(a.savedAt || "")
              : 0,
    );
  const results =
    tab === "search" && !saved
      ? q
        ? list
            .slice()
            .sort((a, b) => {
              const terms = q
                .toLowerCase()
                .split(/\W+/)
                .filter((x) => x.length > 3);
              const score = (c: Candidate) =>
                terms.filter((t) =>
                  `${c.role} ${c.skills.join(" ")} ${c.about}`
                    .toLowerCase()
                    .includes(t),
                ).length;
              return score(b) - score(a);
            })
            .slice(0, 6)
        : []
      : list;
  const clear = () => {
    set({ role: "", location: "", years: "", skill: "", language: "", q: "" });
    setFilters({ role: "", location: "", years: "", skill: "", language: "" });
    setWords("");
  };
  const toggle = (c: Candidate) => {
    if (c.saved && saved) {
      setDrop(c);
      return;
    }
    setData((d) => ({
      ...d,
      candidates: d.candidates.map((x) =>
        x.id === c.id
          ? {
              ...x,
              saved: !x.saved,
              savedAt: x.saved ? undefined : new Date().toISOString(),
            }
          : x,
      ),
    }));
    notify(c.saved ? "Removed from talent pool" : "Saved to talent pool");
  };
  return (
    <>
      <Header
        eyebrow={
          saved
            ? "Good people, worth remembering"
            : "Look beyond the application"
        }
        title={saved ? "Talent pool" : "Candidates"}
        description={
          saved
            ? "Keep promising people close for the right opportunity."
            : "Find experience, potential and a shared sense of purpose."
        }
        actions={
          saved ? (
            <Link to="/candidates" className="md-button md-button--filled">
              <Icon name="add" />
              Find candidates
            </Link>
          ) : undefined
        }
      />
      {!saved && (
        <Tabs
          value={tab}
          onChange={(tab) => set({ tab })}
          label="Candidate search"
          options={[
            { id: "filter", label: "Filter" },
            { id: "search", label: "AI Search" },
          ]}
        />
      )}
      <div className="section-space">
        {saved ? (
          <div className="filter-row">
            <Search
              value={q}
              onChange={(q) => set({ q })}
              placeholder="Search your talent pool"
            />
            <SelectField
              label="Sort by"
              value={order}
              onChange={(e) => set({ sort: e.target.value })}
            >
              <option value="newest">Recently saved</option>
              <option value="name">Name A–Z</option>
              <option value="experience">Most experience</option>
            </SelectField>
          </div>
        ) : (
          <Panel className="candidate-filters">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                set({ ...filters, q: tab === "search" ? words : "" });
                if (window.matchMedia("(max-width: 760px)").matches)
                  setFiltersOpen(false);
              }}
            >
              {tab === "search" && (
                <>
                  <div className="notice">
                    <Icon name="auto_awesome" />
                    <span>
                      Explore the AI search layout using sample matches. This
                      preview uses local keyword matching, not a live AI
                      service. Use Filter for exact criteria.
                    </span>
                  </div>
                  <TextArea
                    label="Describe the person you’re looking for"
                    placeholder="A programme coordinator with community engagement and safeguarding experience…"
                    value={words}
                    onChange={(e) => setWords(e.target.value)}
                    rows={3}
                  />
                </>
              )}
              <button
                type="button"
                className="filter-disclosure"
                aria-expanded={filtersOpen}
                aria-controls="candidate-filters"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <Icon name="filter_list" />
                <span>Filter candidates</span>
                <span className="meta">
                  {Object.values(filters).filter(Boolean).length || "Any"}{" "}
                  criteria
                </span>
                <Icon name={filtersOpen ? "expand_less" : "expand_more"} />
              </button>
              <div
                className={`candidate-filter-grid ${filtersOpen ? "" : "filters-collapsed"}`}
                id="candidate-filters"
              >
                <SelectField
                  label="Role"
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value })
                  }
                >
                  <option value="">Any role</option>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectField>
                <SelectField
                  label="Location"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                >
                  <option value="">Any location</option>
                  {locations.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectField>
                <TextField
                  label="Minimum experience"
                  type="number"
                  min="0"
                  max="99"
                  placeholder="Years"
                  value={filters.years}
                  onChange={(e) =>
                    setFilters({ ...filters, years: e.target.value })
                  }
                />
                <SelectField
                  label="Skill"
                  value={filters.skill}
                  onChange={(e) =>
                    setFilters({ ...filters, skill: e.target.value })
                  }
                >
                  <option value="">Any skill</option>
                  {skills.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectField>
                <SelectField
                  label="Language"
                  value={filters.language}
                  onChange={(e) =>
                    setFilters({ ...filters, language: e.target.value })
                  }
                >
                  <option value="">Any language</option>
                  <option>Arabic</option>
                  <option>English</option>
                </SelectField>
              </div>
              <div className="actions end">
                <Button onClick={clear}>Clear</Button>
                <Button
                  variant="filled"
                  type="submit"
                  icon="search"
                  disabled={tab === "search" && !words.trim()}
                >
                  {tab === "search" ? "Explore matches" : "Find candidates"}
                </Button>
              </div>
            </form>
          </Panel>
        )}
      </div>
      <div className="results-heading">
        <h2>
          {saved
            ? `${results.length} saved candidates`
            : tab === "search"
              ? q
                ? "Sample matches"
                : "Start with the person you have in mind"
              : `${results.length} candidates`}
        </h2>
        {!saved && tab === "filter" && (
          <SelectField
            label="Sort by"
            value={order}
            onChange={(e) => set({ sort: e.target.value })}
          >
            <option value="newest">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="experience">Most experience</option>
            <option value="experience-asc">Least experience</option>
          </SelectField>
        )}
      </div>
      <div className="candidate-grid">
        {results.map((c) => (
          <article className="candidate-card" key={c.id}>
            <div className="candidate-card-heading">
              <Avatar name={c.name} large />
              <button
                className="save-button"
                aria-label={`${c.saved ? "Remove" : "Save"} ${c.name} ${c.saved ? "from" : "to"} talent pool`}
                aria-pressed={c.saved}
                onClick={() => toggle(c)}
              >
                <Icon name="bookmark" />
              </button>
            </div>
            <Link
              to={`/candidates/${c.id}?from=${saved ? "talent-pool" : "candidates"}`}
              className="candidate-name"
            >
              <h2>{c.name}</h2>
            </Link>
            <p className="muted">{c.role}</p>
            <div className="candidate-facts">
              <span>
                <Icon name="location_on" size={18} />
                {c.location}
              </span>
              <span>
                <Icon name="work" size={18} />
                {c.years} years
              </span>
            </div>
            <div className="chips">
              {c.skills.slice(0, 3).map((s) => (
                <span className="skill-chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <div className="candidate-card-foot">
              <span className="meta">{c.languages.join(" · ")}</span>
              <Link
                to={`/candidates/${c.id}?from=${saved ? "talent-pool" : "candidates"}`}
                className="circle-link"
                aria-label={`View ${c.name}`}
              >
                <Icon name="arrow_forward" />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!results.length && (
        <Empty
          title={
            tab === "search" && !q && !saved
              ? "Experience the search"
              : "No candidates found"
          }
          description={
            tab === "search" && !q && !saved
              ? "Describe a role above to explore the sample profiles."
              : "Try removing a filter, or discover people outside your saved pool."
          }
          action={
            saved ? (
              <Link to="/candidates" className="text-link">
                Find candidates <Icon name="arrow_forward" />
              </Link>
            ) : (
              <Button onClick={clear}>Clear filters</Button>
            )
          }
        />
      )}
      <ConfirmDialog
        open={!!drop}
        onClose={() => setDrop(null)}
        headline={`Remove ${drop?.name} from your pool?`}
        description="Your team notes and tags will remain. You can save this candidate again later."
        confirmLabel="Remove from pool"
        onConfirm={() => {
          setData((d) => ({
            ...d,
            candidates: d.candidates.map((c) =>
              c.id === drop?.id ? { ...c, saved: false } : c,
            ),
          }));
          notify("Removed from talent pool");
        }}
      />
    </>
  );
}
export function ProfileContent({
  candidate: c,
  snapshot = false,
}: {
  candidate: Candidate;
  snapshot?: boolean;
}) {
  return (
    <Panel title={snapshot ? "Profile at application" : "Profile"}>
      <p className="panel-note">
        {snapshot
          ? "A snapshot of the profile when this application was submitted."
          : "The candidate’s current profile."}
      </p>
      <h3>About</h3>
      <p className="prose mt">{c.about}</p>
      <div className="profile-section">
        <h3>Experience</h3>
        <div className="experience-entry">
          <span className="section-icon">
            <Icon name="work" />
          </span>
          <div>
            <strong>{c.role} professional</strong>
            <p className="muted">Community programmes · {c.location}</p>
            <span className="meta">
              {c.years} years of relevant experience · Sample profile
            </span>
          </div>
        </div>
      </div>
      <div className="profile-section">
        <h3>Skills</h3>
        <div className="chips mt">
          {c.skills.map((s) => (
            <span className="skill-chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="profile-section">
        <h3>Languages</h3>
        {c.languages.map((l, i) => (
          <div className="simple-row" key={l}>
            <span>{l}</span>
            <Badge>{i === 0 ? "Native" : "Advanced"}</Badge>
          </div>
        ))}
      </div>
      <div className="profile-section">
        <h3>Education</h3>
        <p className="mt">Bachelor’s degree</p>
        <p className="muted">Sample education record</p>
      </div>
    </Panel>
  );
}
export function ProfileCV({
  candidate: c,
  open,
  onClose,
}: {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      headline={`${c.name} · CV`}
      description="Fictional sample résumé"
      actions={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="filled"
            icon="download"
            onClick={() => {
              const text = `${c.name}\n${c.role}\n${c.location} · ${c.email}\n\n${c.about}\n\nSkills: ${c.skills.join(", ")}\nLanguages: ${c.languages.join(", ")}\n\nFictional profile from the SYNC Hub design preview.`;
              const url = URL.createObjectURL(
                new Blob([text], { type: "text/plain" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = `${c.name.replaceAll(" ", "-")}-sample-profile.txt`;
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Download profile
          </Button>
        </>
      }
    >
      <ProfileContent candidate={c} />
    </Dialog>
  );
}
export function CandidateDetail({ id }: { id: string }) {
  const { data, setData, notify } = useWorkspace();
  const { params } = useQuery();
  const [cv, setCV] = useState(false);
  const c = data.candidates.find((c) => c.id === id);
  if (!c)
    return (
      <Empty
        title="Candidate not found"
        action={<Link to="/candidates">Back to candidates</Link>}
      />
    );
  const from = params.get("from");
  const back = from?.startsWith("a")
    ? `/applications/${from}`
    : from === "talent-pool"
      ? "/talent-pool"
      : "/candidates";
  const update = (value: Partial<Candidate>) =>
    setData((d) => ({
      ...d,
      candidates: d.candidates.map((c) =>
        c.id === id ? { ...c, ...value } : c,
      ),
    }));
  const placements = data.applications.filter(
    (a) => a.candidateId === id && a.stage === "Hired",
  );
  return (
    <>
      <Back
        to={back}
        label={
          from?.startsWith("a")
            ? "Back to application"
            : from === "talent-pool"
              ? "Talent pool"
              : "Candidates"
        }
      />
      <Header
        eyebrow="Live candidate profile"
        title={c.name}
        description={c.role}
        actions={
          <>
            <Button
              variant="outlined"
              icon="description"
              onClick={() => setCV(true)}
            >
              View CV
            </Button>
            <Button
              variant={c.saved ? "tonal" : "filled"}
              icon={c.saved ? "check" : "bookmark"}
              onClick={() => {
                update({
                  saved: !c.saved,
                  savedAt: c.saved ? undefined : new Date().toISOString(),
                });
                notify(
                  c.saved ? "Removed from talent pool" : "Saved to talent pool",
                );
              }}
            >
              {c.saved ? "Saved to pool" : "Save to pool"}
            </Button>
          </>
        }
      />
      <div className="identity-band">
        <Avatar name={c.name} large />
        <div className="identity-copy">
          <h2>{c.name}</h2>
          <p>{c.email}</p>
        </div>
        <div className="identity-fact">
          <span>Location</span>
          <strong>{c.location}</strong>
        </div>
        <div className="identity-fact">
          <span>Experience</span>
          <strong>{c.years} years</strong>
        </div>
        <div className="identity-fact">
          <span>Languages</span>
          <strong>{c.languages.join(" · ")}</strong>
        </div>
      </div>
      <div className="detail-grid section-space">
        <div className="stack">
          <ProfileContent candidate={c} />
          <Notes notes={c.notes} onChange={(notes) => update({ notes })} />
        </div>
        <div className="stack">
          <Panel title="Talent pool">
            <div className="pool-state">
              <Icon name={c.saved ? "bookmark" : "person"} size={32} />
              <h3>
                {c.saved ? "A person to keep in mind" : "Keep this connection"}
              </h3>
              <p className="muted">
                {c.saved
                  ? "Saved for opportunities with your team."
                  : "Save this profile so it is easy to find when the right opportunity comes along."}
              </p>
              <Button
                variant="tonal"
                onClick={() =>
                  update({
                    saved: !c.saved,
                    savedAt: c.saved ? undefined : new Date().toISOString(),
                  })
                }
              >
                {c.saved ? "Remove from pool" : "Save candidate"}
              </Button>
            </div>
          </Panel>
          <TagsEditor tags={c.tags} onChange={(tags) => update({ tags })} />
          <Panel title="Placements">
            {placements.length ? (
              placements.map((a) => (
                <Link
                  key={a.id}
                  className="placement-summary"
                  to={`/applications/${a.id}`}
                >
                  <strong>
                    {data.jobs.find((j) => j.id === a.jobId)?.title}
                  </strong>
                  <Status value={a.confirmation || "Awaiting confirmation"} />
                </Link>
              ))
            ) : (
              <p className="muted">
                No placements recorded with your workspace.
              </p>
            )}
          </Panel>
        </div>
      </div>
      <ProfileCV candidate={c} open={cv} onClose={() => setCV(false)} />
    </>
  );
}
export function Placements() {
  const { data } = useWorkspace();
  const { params, set } = useQuery();
  const tab = params.get("tab") || "All";
  const job = params.get("job") || "All";
  const all = data.applications.filter(
    (a) => a.stage === "Hired" && (job === "All" || a.jobId === job),
  );
  const list = all.filter((a) => tab === "All" || a.confirmation === tab);
  return (
    <>
      <Header
        eyebrow="Where a conversation leads"
        title="Placements"
        description="A hire becomes a placement when the candidate confirms they started."
      />
      <div className="placement-metrics">
        <Link to="/placements?tab=Confirmed" className="placement-highlight">
          <Icon name="check_box" size={32} />
          <strong>
            {all.filter((a) => a.confirmation === "Confirmed").length}
          </strong>
          <span>confirmed placement</span>
        </Link>
        <div className="placement-explanation">
          <h2>Every start matters.</h2>
          <p>
            Track your team’s hire claims separately from confirmed placements.
            Candidates make the final confirmation.
          </p>
        </div>
      </div>
      <div className="filter-row">
        <Tabs
          label="Hire claims"
          value={tab}
          onChange={(tab) => set({ tab })}
          options={["All", "Confirmed", "Awaiting confirmation", "Denied"].map(
            (s) => ({
              id: s,
              label: s,
              count: all.filter((a) => s === "All" || a.confirmation === s)
                .length,
            }),
          )}
        />
        <SelectField
          label="Job"
          value={job}
          onChange={(e) => set({ job: e.target.value })}
        >
          <option>All</option>
          {data.jobs
            .filter((j) =>
              data.applications.some(
                (a) => a.jobId === j.id && a.stage === "Hired",
              ),
            )
            .map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
        </SelectField>
      </div>
      <Panel className="table-panel">
        {list.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Start date</th>
                <th>Confirmation</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const c = data.candidates.find((c) => c.id === a.candidateId)!;
                return (
                  <tr key={a.id}>
                    <td className="person-cell">
                      <Link
                        className="person-link"
                        to={`/applications/${a.id}`}
                      >
                        <Avatar name={c.name} />
                        <strong>{c.name}</strong>
                      </Link>
                    </td>
                    <td data-label="Job">
                      {data.jobs.find((j) => j.id === a.jobId)?.title}
                    </td>
                    <td data-label="Start date">
                      {a.startDate ? dateLabel(a.startDate) : "Not recorded"}
                    </td>
                    <td data-label="Confirmation">
                      <Status
                        value={a.confirmation || "Awaiting confirmation"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <Empty
            title="No hire claims in this view"
            action={
              <Button onClick={() => set({ tab: "All", job: "All" })}>
                Clear filters
              </Button>
            }
          />
        )}
      </Panel>
    </>
  );
}
