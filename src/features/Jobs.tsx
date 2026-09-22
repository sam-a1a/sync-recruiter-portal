import { useState } from "react";
import {
  Header,
  Panel,
  Link,
  Tabs,
  Search,
  Status,
  Empty,
  Back,
  Badge,
} from "../components/PortalUI";
import { Button, IconButton } from "../components/Button";
import {
  TextField,
  TextArea as TextAreaField,
  SelectField,
} from "../components/Field";
import { ConfirmDialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { useWorkspace } from "../store";
import { navigate, useQuery } from "../app/router";
import {
  dateLabel,
  locations,
  skills,
  emptyCriteria,
  uid,
  moveApplication,
  openStages,
  type Job,
  type Criteria,
} from "../data";
import { ApplicationList } from "./Applications";
import { TrackedLinks } from "./Workspace";
export function Jobs() {
  const { data } = useWorkspace();
  const { params, set } = useQuery();
  const status = params.get("status") || "All";
  const q = params.get("q") || "";
  const sort = params.get("sort") || "newest";
  const jobs = data.jobs
    .filter(
      (j) =>
        (status === "All" || j.status === status) &&
        `${j.title} ${j.location} ${j.department}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title)
        : sort === "applications"
          ? data.applications.filter((x) => x.jobId === b.id).length -
            data.applications.filter((x) => x.jobId === a.id).length
          : b.created.localeCompare(a.created),
    );
  return (
    <>
      <Header
        eyebrow="Build your team"
        title="Jobs"
        description="From the first draft to the right person."
        actions={
          <Button
            variant="filled"
            icon="add"
            onClick={() => navigate("/jobs/new")}
          >
            Create job
          </Button>
        }
      />
      <div className="toolbar">
        <Tabs
          label="Job status"
          value={status}
          onChange={(status) => set({ status })}
          options={["All", "Published", "Draft", "Closed", "Archived"].map(
            (s) => ({
              id: s,
              label: s,
              count: data.jobs.filter((j) => s === "All" || j.status === s)
                .length,
            }),
          )}
        />
      </div>
      <div className="filter-row">
        <Search
          value={q}
          onChange={(q) => set({ q })}
          placeholder="Search jobs or locations"
        />
        <SelectField
          label="Sort by"
          value={sort}
          onChange={(e) => set({ sort: e.target.value })}
        >
          <option value="newest">Newest first</option>
          <option value="name">Job title</option>
          <option value="applications">Most applications</option>
        </SelectField>
      </div>
      <div className="jobs-grid">
        {jobs.map((j) => {
          const applications = data.applications.filter(
            (a) => a.jobId === j.id,
          );
          const waiting = applications.filter((a) => a.stage === "New").length;
          return (
            <article className="job-card" key={j.id}>
              <div className="job-card-top">
                <span className="job-symbol">
                  <Icon name="work" />
                </span>
                <Status value={j.status} />
              </div>
              <Link to={`/jobs/${j.id}`} className="job-card-title">
                <h2>{j.title}</h2>
              </Link>
              <p className="muted">{j.department}</p>
              <div className="job-card-facts">
                <span>
                  <Icon name="location_on" size={18} />
                  {j.location} · {j.mode}
                </span>
                <span>
                  <Icon name="schedule" size={18} />
                  {j.type}
                </span>
              </div>
              <div className="job-card-counts">
                <Link to={`/jobs/${j.id}?tab=applications`}>
                  <strong>{applications.length}</strong>
                  <span>applications</span>
                </Link>
                <Link to={`/jobs/${j.id}?tab=applications&stage=New`}>
                  <strong>{waiting}</strong>
                  <span>to review</span>
                </Link>
              </div>
              <div className="job-card-foot">
                <span className="meta">Closes {dateLabel(j.closing)}</span>
                <Link
                  className="circle-link"
                  to={`/jobs/${j.id}`}
                  aria-label={`Open ${j.title}`}
                >
                  <Icon name="arrow_forward" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {!jobs.length && (
        <Empty
          title="No jobs in this view"
          description="Try a different status or search."
          action={
            <Button onClick={() => set({ q: "", status: "All" })}>
              Clear filters
            </Button>
          }
        />
      )}
    </>
  );
}
export function JobDetail({ id }: { id: string }) {
  const { data, setData, notify } = useWorkspace();
  const { params, set } = useQuery();
  const job = data.jobs.find((j) => j.id === id);
  const [change, setChange] = useState<Job["status"] | null>(null);
  if (!job)
    return (
      <Empty
        title="Job not found"
        action={<Link to="/jobs">Back to jobs</Link>}
      />
    );
  const tab = params.get("tab") || "details";
  const applications = data.applications.filter((a) => a.jobId === id);
  const ending = applications.filter((a) =>
    openStages.includes(a.stage),
  ).length;
  return (
    <>
      <Back to="/jobs" label="Jobs" />
      <Header
        eyebrow={job.department}
        title={job.title}
        description={`${job.location} · ${job.mode} · ${job.type}`}
        actions={
          <>
            <Status value={job.status} />
            {job.status !== "Archived" && (
              <Button
                variant="outlined"
                icon="edit"
                onClick={() => navigate(`/jobs/new?edit=${job.id}`)}
              >
                Edit job
              </Button>
            )}
          </>
        }
      />
      <Tabs
        label="Job sections"
        value={tab}
        onChange={(tab) => set({ tab })}
        options={[
          { id: "details", label: "Details" },
          {
            id: "applications",
            label: "Applications",
            count: applications.length,
          },
          { id: "screening", label: "Screening" },
          { id: "links", label: "Tracked links" },
        ]}
      />
      <div className="section-space">
        {tab === "details" ? (
          <div className="detail-grid">
            <Panel title="About this role">
              <p className="prose preserve">{job.description}</p>
            </Panel>
            <div className="stack">
              <Panel title="Job details">
                <dl className="facts">
                  <div>
                    <dt>Closing date</dt>
                    <dd>{dateLabel(job.closing)}</dd>
                  </div>
                  <div>
                    <dt>Employment</dt>
                    <dd>{job.type}</dd>
                  </div>
                  <div>
                    <dt>Work arrangement</dt>
                    <dd>{job.mode}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{job.location}</dd>
                  </div>
                </dl>
              </Panel>
              <Panel title="Manage this job">
                <p className="muted">
                  {job.status === "Published"
                    ? "This role is open for applications."
                    : job.status === "Draft"
                      ? "Your draft is ready when you are."
                      : "This role is no longer accepting applications."}
                </p>
                <div className="stack mt">
                  {job.status === "Draft" && (
                    <Button
                      variant="filled"
                      onClick={() => setChange("Published")}
                    >
                      Publish job
                    </Button>
                  )}
                  {job.status === "Closed" && (
                    <Button
                      variant="filled"
                      onClick={() => setChange("Published")}
                    >
                      Reopen job
                    </Button>
                  )}
                  {job.status === "Published" && (
                    <Button variant="tonal" onClick={() => setChange("Closed")}>
                      Close job
                    </Button>
                  )}
                  {job.status !== "Archived" && (
                    <Button
                      variant="outlined"
                      onClick={() => setChange("Archived")}
                    >
                      Archive job
                    </Button>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        ) : tab === "applications" ? (
          <ApplicationList jobId={id} />
        ) : tab === "screening" ? (
          <CriteriaRead criteria={job.criteria} />
        ) : (
          <TrackedLinks jobId={id} embedded />
        )}
      </div>
      <ConfirmDialog
        open={change !== null}
        onClose={() => setChange(null)}
        headline={`${change === "Published" ? "Publish" : change === "Closed" ? "Close" : "Archive"} this job?`}
        description={
          change === "Archived"
            ? `${ending} open applications will be rejected in this preview. Hired and withdrawn applications remain unchanged.`
            : change === "Closed"
              ? "New applications will stop. You can continue reviewing existing applications."
              : "The job becomes available in your preview workspace."
        }
        confirmLabel={
          change === "Published"
            ? "Publish job"
            : change === "Closed"
              ? "Close job"
              : "Archive job"
        }
        danger={change === "Archived"}
        onConfirm={() => {
          setData((d) => ({
            ...d,
            jobs: d.jobs.map((j) =>
              j.id === id ? { ...j, status: change! } : j,
            ),
            applications:
              change === "Archived"
                ? d.applications.map((a) =>
                    a.jobId === id && openStages.includes(a.stage)
                      ? moveApplication(a, "Rejected")
                      : a,
                  )
                : d.applications,
          }));
          notify(`Job ${change?.toLowerCase()} in preview`);
        }}
      />
    </>
  );
}
export function CriteriaRead({ criteria }: { criteria: Criteria }) {
  return (
    <div className="detail-grid">
      <div className="stack">
        <Panel title="Skills">
          <div className="record-list">
            {criteria.skills.map((s) => (
              <div className="simple-row" key={s.name}>
                <span>{s.name}</span>
                <Badge>{s.importance}</Badge>
              </div>
            ))}
          </div>
          {!criteria.skills.length && (
            <p className="muted">No skill requirements.</p>
          )}
        </Panel>
        <Panel title="Application questions">
          {criteria.questions.map((q, i) => (
            <div className="question-read" key={i}>
              <p>
                <span className="step-number">{i + 1}</span>
                <strong>{q.text}</strong>
              </p>
              <span className="meta">
                {q.type} · {q.required ? "Required" : "Optional"}
                {q.answer !== "Any" ? ` · Passing answer: ${q.answer}` : ""}
              </span>
            </div>
          ))}
          {!criteria.questions.length && (
            <p className="muted">No additional questions.</p>
          )}
        </Panel>
      </div>
      <div className="stack">
        <Panel title="Experience">
          <strong className="large-number">{criteria.years}</strong>
          <p className="muted">minimum years of experience</p>
        </Panel>
        <Panel title="Languages">
          {criteria.languages.map((l) => (
            <div className="simple-row" key={l.name}>
              <span>{l.name}</span>
              <Badge>{l.proficiency}</Badge>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
const blankJob: Job = {
  id: "",
  title: "",
  department: "",
  location: "Damascus",
  mode: "On-site",
  type: "Full time",
  status: "Draft",
  closing: "",
  description: "",
  created: "",
  criteria: structuredClone(emptyCriteria),
};
export function JobWizard() {
  const { data, setData, notify } = useWorkspace();
  const { params, set } = useQuery();
  const edit = params.get("edit");
  const existing = data.jobs.find((j) => j.id === edit);
  const [draft, setDraft] = useState<Job>(() => {
    if (existing) return structuredClone(existing);
    try {
      return (
        JSON.parse(localStorage.getItem("recruiter-job-draft") || "null") ||
        structuredClone(blankJob)
      );
    } catch {
      return structuredClone(blankJob);
    }
  });
  const [error, setError] = useState("");
  const step = Number(params.get("step") || 0);
  const detailsReady = !!(
    draft.title.trim() &&
    draft.description.trim() &&
    draft.closing
  );
  const current = detailsReady
    ? Math.min(2, Math.max(0, Number.isFinite(step) ? step : 0))
    : 0;
  const update = (next: Partial<Job>) => {
    setDraft((d) => {
      const value = { ...d, ...next };
      if (!edit)
        try {
          localStorage.setItem("recruiter-job-draft", JSON.stringify(value));
        } catch {
          /* Session draft stays usable. */
        }
      return value;
    });
  };
  const criteria = (next: Partial<Criteria>) =>
    update({ criteria: { ...draft.criteria, ...next } });
  const validDetails = () => {
    if (!draft.title.trim() || !draft.description.trim() || !draft.closing) {
      setError(
        "Add a job title, description and closing date before continuing.",
      );
      return false;
    }
    return true;
  };
  const go = (next: number) => {
    if (next > 0 && !validDetails()) return;
    if (next === 2 && draft.criteria.questions.some((q) => !q.text.trim())) {
      setError("Write each question or remove the empty question.");
      return;
    }
    setError("");
    set({ step: String(next) });
  };
  const save = (status: Job["status"]) => {
    if (!validDetails()) {
      set({ step: "0" });
      return;
    }
    const job = {
      ...draft,
      title: draft.title.trim(),
      id: edit || uid(),
      status,
      created: existing?.created || new Date().toISOString(),
    };
    setData((d) => ({
      ...d,
      jobs: edit
        ? d.jobs.map((j) => (j.id === edit ? job : j))
        : [job, ...d.jobs],
    }));
    if (!edit) localStorage.removeItem("recruiter-job-draft");
    notify(`${status === "Draft" ? "Draft saved" : "Job saved"} in preview`);
    navigate(`/jobs/${job.id}`);
  };
  return (
    <div className="wizard">
      <Back
        to={edit ? `/jobs/${edit}` : "/jobs"}
        label={edit ? "Back to job" : "Jobs"}
      />
      <Header
        eyebrow={edit ? "Make it yours" : "A new opportunity"}
        title={edit ? "Edit job" : "Create a job"}
        description="A clear role. A thoughtful process. The right people."
      />
      <ol className="wizard-steps">
        {["Details", "Screening", "Review"].map((label, i) => (
          <li key={label}>
            <button
              className={i === current ? "active" : ""}
              onClick={() => go(i)}
              aria-current={current === i ? "step" : undefined}
            >
              <span>
                {i < current ? <Icon name="check" size={18} /> : i + 1}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ol>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <Panel
        title={
          [
            "Tell people about the role",
            "Set your screening criteria",
            "Everything in one place",
          ][current]
        }
      >
        {current === 0 ? (
          <div className="form-stack">
            <div className="form-grid">
              <TextField
                label="Job title"
                value={draft.title}
                required
                onChange={(e) => update({ title: e.target.value })}
              />
              <TextField
                label="Team or department"
                value={draft.department}
                onChange={(e) => update({ department: e.target.value })}
              />
            </div>
            <TextAreaField
              label="Job description"
              value={draft.description}
              rows={8}
              required
              onChange={(e) => update({ description: e.target.value })}
            />
            <div className="form-grid">
              <SelectField
                label="Location"
                value={draft.location}
                onChange={(e) => update({ location: e.target.value })}
              >
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </SelectField>
              <SelectField
                label="Work arrangement"
                value={draft.mode}
                onChange={(e) => update({ mode: e.target.value })}
              >
                {["On-site", "Hybrid", "Remote"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </SelectField>
              <SelectField
                label="Employment type"
                value={draft.type}
                onChange={(e) => update({ type: e.target.value })}
              >
                {[
                  "Full time",
                  "Part time",
                  "Contract",
                  "Temporary",
                  "Internship",
                  "Volunteer",
                ].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </SelectField>
              <TextField
                label="Closing date"
                type="date"
                required
                value={draft.closing}
                onChange={(e) => update({ closing: e.target.value })}
              />
            </div>
          </div>
        ) : current === 1 ? (
          <div className="form-stack">
            <p className="muted">
              Choose what matters. Screening supports your review; it never
              makes the hiring decision.
            </p>
            <TextField
              label="Minimum years of experience"
              type="number"
              min="0"
              max="99"
              step="0.5"
              value={draft.criteria.years}
              onChange={(e) => criteria({ years: Number(e.target.value) })}
            />
            <fieldset className="form-section">
              <legend>Skills</legend>
              {draft.criteria.skills.map((s, i) => (
                <div className="criteria-row" key={i}>
                  <SelectField
                    label={`Skill ${i + 1}`}
                    value={s.name}
                    onChange={(e) =>
                      criteria({
                        skills: draft.criteria.skills.map((x, n) =>
                          i === n ? { ...x, name: e.target.value } : x,
                        ),
                      })
                    }
                  >
                    {skills
                      .filter(
                        (name) =>
                          name === s.name ||
                          !draft.criteria.skills.some((x) => x.name === name),
                      )
                      .map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                  </SelectField>
                  <SelectField
                    label="Importance"
                    value={s.importance}
                    onChange={(e) =>
                      criteria({
                        skills: draft.criteria.skills.map((x, n) =>
                          i === n ? { ...x, importance: e.target.value } : x,
                        ),
                      })
                    }
                  >
                    {["Required", "Preferred", "Optional"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </SelectField>
                  <IconButton
                    icon="close"
                    label={`Remove skill ${i + 1}`}
                    onClick={() =>
                      criteria({
                        skills: draft.criteria.skills.filter((_, n) => n !== i),
                      })
                    }
                  />
                </div>
              ))}
              <Button
                variant="tonal"
                icon="add"
                disabled={draft.criteria.skills.length >= skills.length}
                onClick={() =>
                  criteria({
                    skills: [
                      ...draft.criteria.skills,
                      {
                        name: skills.find(
                          (s) =>
                            !draft.criteria.skills.some((x) => x.name === s),
                        )!,
                        importance: "Required",
                      },
                    ],
                  })
                }
              >
                Add skill
              </Button>
            </fieldset>
            <fieldset className="form-section">
              <legend>Languages</legend>
              {draft.criteria.languages.map((l, i) => (
                <div className="criteria-row" key={i}>
                  <SelectField
                    label={`Language ${i + 1}`}
                    value={l.name}
                    onChange={(e) =>
                      criteria({
                        languages: draft.criteria.languages.map((x, n) =>
                          i === n ? { ...x, name: e.target.value } : x,
                        ),
                      })
                    }
                  >
                    {["Arabic", "English", "French", "Kurdish"]
                      .filter(
                        (name) =>
                          name === l.name ||
                          !draft.criteria.languages.some(
                            (x) => x.name === name,
                          ),
                      )
                      .map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                  </SelectField>
                  <SelectField
                    label="Minimum proficiency"
                    value={l.proficiency}
                    onChange={(e) =>
                      criteria({
                        languages: draft.criteria.languages.map((x, n) =>
                          i === n ? { ...x, proficiency: e.target.value } : x,
                        ),
                      })
                    }
                  >
                    {[
                      "Beginner",
                      "Intermediate",
                      "Advanced",
                      "Fluent",
                      "Native",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </SelectField>
                  <IconButton
                    icon="close"
                    label={`Remove language ${i + 1}`}
                    onClick={() =>
                      criteria({
                        languages: draft.criteria.languages.filter(
                          (_, n) => n !== i,
                        ),
                      })
                    }
                  />
                </div>
              ))}
              <Button
                variant="tonal"
                icon="add"
                disabled={draft.criteria.languages.length >= 4}
                onClick={() =>
                  criteria({
                    languages: [
                      ...draft.criteria.languages,
                      {
                        name: ["Arabic", "English", "French", "Kurdish"].find(
                          (name) =>
                            !draft.criteria.languages.some(
                              (l) => l.name === name,
                            ),
                        )!,
                        proficiency: "Fluent",
                      },
                    ],
                  })
                }
              >
                Add language
              </Button>
            </fieldset>
            <fieldset className="form-section">
              <legend>Application questions</legend>
              {draft.criteria.questions.map((q, i) => (
                <div className="question-editor" key={i}>
                  <div className="actions spread">
                    <strong>Question {i + 1}</strong>
                    <IconButton
                      icon="delete"
                      label={`Remove question ${i + 1}`}
                      onClick={() =>
                        criteria({
                          questions: draft.criteria.questions.filter(
                            (_, n) => n !== i,
                          ),
                        })
                      }
                    />
                  </div>
                  <TextField
                    label="Question"
                    required
                    value={q.text}
                    onChange={(e) =>
                      criteria({
                        questions: draft.criteria.questions.map((x, n) =>
                          i === n ? { ...x, text: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <div className="form-grid">
                    <SelectField
                      label="Answer type"
                      value={q.type}
                      onChange={(e) =>
                        criteria({
                          questions: draft.criteria.questions.map((x, n) =>
                            i === n ? { ...x, type: e.target.value } : x,
                          ),
                        })
                      }
                    >
                      <option>Yes / no</option>
                      <option>Short answer</option>
                    </SelectField>
                    {q.type === "Yes / no" && (
                      <SelectField
                        label="Passing answer"
                        value={q.answer}
                        onChange={(e) =>
                          criteria({
                            questions: draft.criteria.questions.map((x, n) =>
                              i === n ? { ...x, answer: e.target.value } : x,
                            ),
                          })
                        }
                      >
                        <option>Any</option>
                        <option>Yes</option>
                        <option>No</option>
                      </SelectField>
                    )}
                  </div>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) =>
                        criteria({
                          questions: draft.criteria.questions.map((x, n) =>
                            i === n ? { ...x, required: e.target.checked } : x,
                          ),
                        })
                      }
                    />
                    Required to apply
                  </label>
                </div>
              ))}
              <Button
                variant="tonal"
                icon="add"
                onClick={() =>
                  criteria({
                    questions: [
                      ...draft.criteria.questions,
                      {
                        text: "",
                        type: "Yes / no",
                        required: true,
                        answer: "Any",
                      },
                    ],
                  })
                }
              >
                Add question
              </Button>
            </fieldset>
          </div>
        ) : (
          <div className="form-stack">
            <div>
              <h2>{draft.title}</h2>
              <p className="muted">
                {draft.location} · {draft.mode} · {draft.type}
              </p>
            </div>
            <p className="preserve prose">{draft.description}</p>
            <div className="notice">
              <Icon name="checklist" />
              <span>
                {draft.criteria.years} years’ experience ·{" "}
                {draft.criteria.skills.length} skills ·{" "}
                {draft.criteria.languages.length} languages ·{" "}
                {draft.criteria.questions.length} questions
              </span>
            </div>
            <p>Closes {draft.closing ? dateLabel(draft.closing) : "Not set"}</p>
            <p className="muted">
              This creates a job in your preview workspace. It will not appear
              on the public job board.
            </p>
          </div>
        )}
      </Panel>
      <div className="wizard-actions">
        <Button onClick={() => navigate(edit ? `/jobs/${edit}` : "/jobs")}>
          Cancel
        </Button>
        <div className="actions">
          {current > 0 && (
            <Button
              variant="outlined"
              icon="arrow_back"
              onClick={() => go(current - 1)}
            >
              Back
            </Button>
          )}
          {current < 2 ? (
            <Button
              variant="filled"
              onClick={() => {
                if (
                  current === 1 &&
                  draft.criteria.questions.some((q) => !q.text.trim())
                ) {
                  setError("Write each question or remove the empty question.");
                  return;
                }
                go(current + 1);
              }}
            >
              Continue <Icon name="arrow_forward" size={18} />
            </Button>
          ) : (
            <>
              {!existing && (
                <Button variant="outlined" onClick={() => save("Draft")}>
                  Save draft
                </Button>
              )}
              <Button
                variant="filled"
                icon="check"
                onClick={() => save(existing?.status || "Published")}
              >
                {edit ? "Save changes" : "Publish job"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
