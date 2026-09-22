import { useState } from "react";
import {
  Header,
  Panel,
  Tabs,
  Search,
  Link,
  Avatar,
  Status,
  Empty,
  Back,
  Badge,
} from "../components/PortalUI";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { SelectField, TextField, TextArea } from "../components/Field";
import { Dialog, ConfirmDialog } from "../components/Dialog";
import { useWorkspace } from "../store";
import { useQuery } from "../app/router";
import {
  dateLabel,
  stages,
  openStages,
  allowedMoves,
  moveApplication,
  uid,
  type Stage,
  type Note,
} from "../data";
import { ProfileContent, ProfileCV } from "./People";
export function Applications() {
  return (
    <>
      <Header
        eyebrow="Make room for the right people"
        title="Applications"
        description="One place for every conversation and every next step."
      />
      <ApplicationList />
    </>
  );
}
export function ApplicationList({ jobId }: { jobId?: string }) {
  const { data, setData, notify } = useWorkspace();
  const { params, set } = useQuery();
  const stage = params.get("stage") || "Open";
  const screening = params.get("screening") || "All";
  const job = jobId || params.get("job") || "All";
  const q = params.get("q") || "";
  const received = params.get("received") || "All time";
  const [selected, setSelected] = useState<string[]>([]);
  const [now] = useState(() => Date.now());
  const [target, setTarget] = useState<Stage>("Reviewing");
  const [confirm, setConfirm] = useState<"selected" | "sweep" | null>(null);
  const base = data.applications.filter(
    (a) =>
      (job === "All" || a.jobId === job) &&
      (screening === "All" || a.screening === screening) &&
      `${data.candidates.find((c) => c.id === a.candidateId)?.name} ${data.jobs.find((j) => j.id === a.jobId)?.title}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (received === "All time" ||
        new Date(a.date) >= new Date(now - Number(received) * 86400000)),
  );
  const matches = (s: string, a: (typeof base)[number]) =>
    s === "All" ||
    (s === "Open" ? openStages.includes(a.stage) : a.stage === s);
  const list = base.filter((a) => matches(stage, a));
  const selectedApps = list.filter((a) => selected.includes(a.id));
  const choices = (
    ["Reviewing", "Shortlisted", "Interview", "Offer", "Rejected"] as Stage[]
  ).filter((s) =>
    selectedApps.length
      ? selectedApps.every((a) => allowedMoves(a.stage).includes(s))
      : list.some((a) => allowedMoves(a.stage).includes(s)),
  );
  const destination = choices.includes(target) ? target : choices[0];
  const scope = confirm === "selected" ? selectedApps : list;
  const affected = scope.filter(
    (a) => destination && allowedMoves(a.stage).includes(destination),
  );
  const reading = (values: Record<string, string>) => {
    setSelected([]);
    set(values);
  };
  return (
    <div className="application-workspace">
      <Tabs
        label="Pipeline"
        value={stage}
        onChange={(stage) => reading({ stage })}
        options={["Open", ...stages, "All"].map((s) => ({
          id: s,
          label: s,
          count: base.filter((a) => matches(s, a)).length,
        }))}
      />
      <div className="filter-row applications-filters">
        <Search
          value={q}
          onChange={(q) => reading({ q })}
          placeholder="Find an application"
        />
        {!jobId && (
          <SelectField
            label="Job"
            value={job}
            onChange={(e) => reading({ job: e.target.value })}
          >
            <option>All</option>
            {data.jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </SelectField>
        )}
        <SelectField
          label="Screening"
          value={screening}
          onChange={(e) => reading({ screening: e.target.value })}
        >
          {["All", "Qualified", "Not qualified", "Pending", "Error"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </SelectField>
        {!jobId && (
          <SelectField
            label="Received"
            value={received}
            onChange={(e) => reading({ received: e.target.value })}
          >
            <option>All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </SelectField>
        )}
      </div>
      <div className="application-layout">
        <Panel className="table-panel">
          <div className="record-caption">
            <h2>
              {stage === "Open" ? "Open applications" : `${stage} applications`}
            </h2>
            <span className="muted">
              {list.length} {list.length === 1 ? "person" : "people"}
            </span>
          </div>
          {list.length ? (
            <table className="data-table application-table">
              <thead>
                <tr>
                  <th className="selection-cell">
                    <span className="sr-only">Select application</span>
                  </th>
                  <th>Candidate</th>
                  {!jobId && <th>Job</th>}
                  <th>Screening</th>
                  <th>Pipeline</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const c = data.candidates.find(
                    (c) => c.id === a.candidateId,
                  )!;
                  const j = data.jobs.find((j) => j.id === a.jobId)!;
                  const tickable = allowedMoves(a.stage).some(
                    (s) =>
                      [
                        "Reviewing",
                        "Shortlisted",
                        "Interview",
                        "Offer",
                        "Rejected",
                      ].includes(s) &&
                      selectedApps.every(
                        (x) =>
                          x.id === a.id || allowedMoves(x.stage).includes(s),
                      ),
                  );
                  return (
                    <tr key={a.id} data-selected={selected.includes(a.id)}>
                      <td className="selection-cell">
                        <input
                          type="checkbox"
                          aria-label={`Select ${c.name}`}
                          checked={selected.includes(a.id)}
                          disabled={!tickable}
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, a.id]
                                : selected.filter((id) => id !== a.id),
                            )
                          }
                        />
                      </td>
                      <td className="person-cell">
                        <Link
                          to={`/applications/${a.id}`}
                          className="person-link"
                        >
                          <Avatar name={c.name} />
                          <span>
                            <strong>{c.name}</strong>
                            <small>{c.location}</small>
                          </span>
                        </Link>
                      </td>
                      {!jobId && (
                        <td data-label="Job">
                          <Link to={`/jobs/${j.id}`} className="table-job-link">
                            {j.title}
                          </Link>
                        </td>
                      )}
                      <td data-label="Screening">
                        <Status value={a.screening} />
                      </td>
                      <td data-label="Pipeline">
                        <Status value={a.stage} />
                      </td>
                      <td data-label="Received" className="meta">
                        {dateLabel(a.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <Empty
              title="No applications in this view"
              description="Try a broader pipeline, job or screening filter."
              action={
                <Button
                  onClick={() =>
                    reading({
                      stage: "All",
                      screening: "All",
                      q: "",
                      job: "",
                      received: "",
                    })
                  }
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </Panel>
        <aside className="acts-panel panel" id="application-acts">
          <span className="section-icon">
            <Icon name="checklist" />
          </span>
          <h2>
            {selectedApps.length
              ? `${selectedApps.length} selected`
              : "Work through this view"}
          </h2>
          <p className="muted">
            {selectedApps.length
              ? "Move only the applications you have selected."
              : `A sweep reaches all ${list.length} applications in this view. Terminal applications stay unchanged.`}
          </p>
          {choices.length > 0 ? (
            <>
              <SelectField
                label="Move to"
                value={destination}
                onChange={(e) => setTarget(e.target.value as Stage)}
              >
                {choices.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </SelectField>
              <Button
                variant={selectedApps.length ? "filled" : "tonal"}
                onClick={() =>
                  setConfirm(selectedApps.length ? "selected" : "sweep")
                }
              >
                {selectedApps.length ? "Move selected" : "Sweep this view"}
                <Icon name="arrow_forward" size={18} />
              </Button>
              {selectedApps.length > 0 && (
                <Button onClick={() => setSelected([])}>Clear selection</Button>
              )}
            </>
          ) : (
            <p className="meta">No available moves in this view.</p>
          )}
          <div className="note-rule">
            <Icon name="info" size={18} />
            <p>
              Screening is the automated result. The pipeline is your team’s
              decision.
            </p>
          </div>
        </aside>
      </div>
      {selectedApps.length > 0 && (
        <div className="selection-dock">
          <span>{selectedApps.length} selected</span>
          <Button
            variant="filled"
            onClick={() =>
              document.getElementById("application-acts")?.scrollIntoView({
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
                block: "center",
              })
            }
          >
            Review actions <Icon name="arrow_forward" size={18} />
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        headline={`Move ${affected.length} ${affected.length === 1 ? "application" : "applications"} to ${destination}?`}
        description={`${confirm === "selected" ? "Only your selected applications" : "Every matching application that can move"} will be updated in this preview. ${destination === "Rejected" ? "Rejections are scheduled for three days later. No real email is sent." : "No real notifications are sent."}`}
        confirmLabel={`Move ${affected.length}`}
        danger={destination === "Rejected"}
        onConfirm={() => {
          const ids = new Set(affected.map((a) => a.id));
          setData((d) => ({
            ...d,
            applications: d.applications.map((a) =>
              ids.has(a.id) ? moveApplication(a, destination) : a,
            ),
          }));
          setSelected([]);
          notify(
            `${affected.length} applications moved to ${destination} in preview`,
          );
        }}
      />
    </div>
  );
}
export function Notes({
  notes,
  onChange,
}: {
  notes: Note[];
  onChange: (notes: Note[]) => void;
}) {
  const [text, setText] = useState("");
  const { data, notify } = useWorkspace();
  return (
    <Panel title="Team notes">
      <p className="panel-note">Private to your workspace.</p>
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onChange([
            {
              id: uid(),
              text: text.trim(),
              author: data.account.name,
              date: new Date().toISOString(),
            },
            ...notes,
          ]);
          setText("");
          notify("Note saved");
        }}
      >
        <TextArea
          label="Add a note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <Button
          variant="tonal"
          type="submit"
          disabled={!text.trim()}
          icon="add"
        >
          Add note
        </Button>
      </form>
      <div className="notes-list">
        {notes.map((note) => (
          <article className="note" key={note.id}>
            <p className="preserve">{note.text}</p>
            <div className="actions spread">
              <span className="meta">
                {note.author} · {dateLabel(note.date)}
              </span>
              <Button
                small
                onClick={() => {
                  onChange(notes.filter((n) => n.id !== note.id));
                  notify("Note removed");
                }}
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
export function TagsEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const { data } = useWorkspace();
  return (
    <Panel title="Tags">
      <div className="chips">
        {data.tags.map((tag) => (
          <button
            className="filter-chip"
            aria-pressed={tags.includes(tag)}
            key={tag}
            onClick={() =>
              onChange(
                tags.includes(tag)
                  ? tags.filter((t) => t !== tag)
                  : [...tags, tag],
              )
            }
          >
            {tags.includes(tag) && <Icon name="check" size={16} />} {tag}
          </button>
        ))}
      </div>
      {!data.tags.length && (
        <Link to="/settings?tab=tags">Add workspace tags</Link>
      )}
    </Panel>
  );
}
export function ApplicationReview({ id }: { id: string }) {
  const { data, setData, notify } = useWorkspace();
  const app = data.applications.find((a) => a.id === id);
  const [move, setMove] = useState<Stage | null>(null);
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [more, setMore] = useState("");
  const [cv, setCV] = useState(false);
  const [assessment, setAssessment] = useState(false);
  const [template, setTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [send, setSend] = useState(false);
  if (!app)
    return (
      <Empty
        title="Application not found"
        action={<Link to="/applications">Back to applications</Link>}
      />
    );
  const c = data.candidates.find((c) => c.id === app.candidateId)!;
  const job = data.jobs.find((j) => j.id === app.jobId)!;
  const moves = allowedMoves(app.stage);
  const index = stages.indexOf(app.stage);
  const next = stages[index + 1];
  const update = (value: Partial<typeof app>) =>
    setData((d) => ({
      ...d,
      applications: d.applications.map((a) =>
        a.id === id ? { ...a, ...value } : a,
      ),
    }));
  const perform = (stage: Stage) => {
    setData((d) => ({
      ...d,
      applications: d.applications.map((a) =>
        a.id === id ? moveApplication(a, stage, start) : a,
      ),
    }));
    notify(
      stage === "Hired"
        ? "Hire recorded in preview. Awaiting candidate confirmation."
        : stage === "Rejected"
          ? "Rejection recorded for three days from now. No email sent."
          : `Moved to ${stage} in preview`,
    );
    setMove(null);
  };
  const choose = (stage: Stage) => {
    if (stage === "Hired" || stage === "Rejected") setMove(stage);
    else perform(stage);
  };
  const fill = (text: string) =>
    text
      .replaceAll(/{{\s*candidate_name\s*}}/g, c.name)
      .replaceAll(/{{\s*job_title\s*}}/g, job.title)
      .replaceAll(/{{\s*tenant_name\s*}}/g, data.organization.name);
  return (
    <>
      <Back to="/applications" label="Applications" />
      <Header
        eyebrow="Application review · Snapshot"
        title={c.name}
        description={`For ${job.title}`}
        actions={
          <>
            <Button
              variant="outlined"
              icon="description"
              onClick={() => setCV(true)}
            >
              View CV
            </Button>
            <Link
              to={`/candidates/${c.id}?from=${id}`}
              className="md-button md-button--tonal"
            >
              <Icon name="person" />
              Live profile
            </Link>
          </>
        }
      />
      <div className="identity-band">
        <Avatar name={c.name} large />
        <div className="identity-copy">
          <h2>{c.role}</h2>
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
          <span>Applied</span>
          <strong>{dateLabel(app.date)}</strong>
        </div>
      </div>
      <Panel className="pipeline-panel">
        <div className="panel-heading">
          <h2>Hiring pipeline</h2>
          <Status value={app.stage} />
        </div>
        <ol
          className="pipeline-steps"
          tabIndex={0}
          aria-label="Hiring pipeline stages"
        >
          {stages.slice(0, 6).map((s, i) => (
            <li
              key={s}
              data-current={s === app.stage}
              data-complete={index < 6 && i < index}
            >
              <span>
                {index < 6 && i < index ? (
                  <Icon name="check" size={18} />
                ) : (
                  i + 1
                )}
              </span>
              <strong>{s}</strong>
            </li>
          ))}
        </ol>
        {moves.length > 0 ? (
          <div className="pipeline-actions">
            <div className="actions">
              {index > 0 && index < 5 && (
                <Button
                  variant="outlined"
                  icon="arrow_back"
                  onClick={() => choose(stages[index - 1])}
                >
                  {stages[index - 1]}
                </Button>
              )}
              {next && moves.includes(next) && index < 5 && (
                <Button variant="filled" onClick={() => choose(next)}>
                  {next === "Hired" ? "Mark as hired" : `Move to ${next}`}
                  <Icon name="arrow_forward" size={18} />
                </Button>
              )}
              {app.stage === "Rejected" && (
                <Button variant="filled" onClick={() => choose("Reviewing")}>
                  Reopen for review
                </Button>
              )}
            </div>
            <div className="actions">
              <SelectField
                label="More moves"
                value={more}
                onChange={(e) => setMore(e.target.value)}
              >
                <option value="">Choose a move</option>
                {moves.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </SelectField>
              <Button
                variant="outlined"
                disabled={!more}
                onClick={() => {
                  choose(more as Stage);
                  setMore("");
                }}
              >
                Move
              </Button>
            </div>
          </div>
        ) : (
          <p className="muted">
            {app.stage === "Hired"
              ? `Started ${app.startDate ? dateLabel(app.startDate) : "date not recorded"} · ${app.confirmation}`
              : "The candidate withdrew this application. It cannot be moved."}
          </p>
        )}
        {app.rejectionDate && (
          <p className="notice">
            Rejection scheduled for {dateLabel(app.rejectionDate)}. No email is
            sent from this preview.
          </p>
        )}
      </Panel>
      <div className="detail-grid section-space">
        <div className="stack">
          <Panel title="Screening">
            <Status value={app.screening} />
            <p className="mt muted">
              {app.screening === "Qualified"
                ? "This application meets the recorded screening requirements. Review the profile and answers before deciding."
                : app.screening === "Not qualified"
                  ? "The minimum experience requirement was not met. You can still review and move this application."
                  : "The screening result is not ready yet."}
            </p>
          </Panel>
          <ProfileContent candidate={c} snapshot />
          <Panel title="Application answers">
            {job.criteria.questions.map((q, i) => (
              <div className="question-read" key={i}>
                <h3>{q.text}</h3>
                <p>
                  {q.type === "Yes / no"
                    ? "Yes"
                    : "I am interested in contributing to community programmes and bring relevant experience to the team."}
                </p>
              </div>
            ))}
            {!job.criteria.questions.length && (
              <p className="muted">No additional questions were asked.</p>
            )}
          </Panel>
          <Panel title="Match assessment" action={<Badge>Sample</Badge>}>
            <p className="muted">
              An additional perspective to support your judgement. This preview
              shows a sample assessment, not a live AI result.
            </p>
            {assessment ? (
              <div className="assessment-result">
                <div className="assessment-score">
                  82<span>/ 100</span>
                </div>
                <div>
                  <h3>Strong relevant experience</h3>
                  <p className="muted">
                    Relevant programme work and communication skills. Explore
                    technical depth and availability in a conversation.
                  </p>
                  <span className="meta">
                    Illustrative assessment · Review the evidence yourself
                  </span>
                </div>
              </div>
            ) : (
              <Button
                className="mt"
                variant="tonal"
                icon="auto_awesome"
                onClick={() => setAssessment(true)}
              >
                Preview assessment
              </Button>
            )}
          </Panel>
          <Notes notes={app.notes} onChange={(notes) => update({ notes })} />
        </div>
        <div className="stack">
          <TagsEditor tags={app.tags} onChange={(tags) => update({ tags })} />
          <Panel title="Message the applicant">
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                if (subject.trim() && message.trim()) setSend(true);
              }}
            >
              <SelectField
                label="Start from a template"
                value={template}
                onChange={(e) => {
                  setTemplate(e.target.value);
                  const t = data.templates.find((t) => t.id === e.target.value);
                  if (t) {
                    setSubject(fill(t.subject));
                    setMessage(fill(t.body));
                  }
                }}
              >
                <option value="">Write your own</option>
                {data.templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <TextArea
                label="Message"
                required
                value={message}
                rows={6}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="meta">
                Messages are saved locally in this preview. No email is sent.
              </p>
              <Button
                variant="filled"
                type="submit"
                icon="send"
                disabled={!subject.trim() || !message.trim()}
              >
                Preview send
              </Button>
            </form>
            {app.messages.length > 0 && (
              <details className="mt">
                <summary>Saved messages ({app.messages.length})</summary>
                {app.messages.map((m, i) => (
                  <article className="note" key={i}>
                    <strong>{m.subject}</strong>
                    <p className="preserve">{m.body}</p>
                    <span className="meta">
                      {dateLabel(m.date)} · Preview only
                    </span>
                  </article>
                ))}
              </details>
            )}
          </Panel>
          <Panel title="Activity">
            <ol className="activity-list">
              {app.history.map((h, i) => (
                <li key={i}>
                  <span className="activity-dot" />
                  <div>
                    <strong>{h.text}</strong>
                    <span>{dateLabel(h.date)}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="meta mt">Arrived through {app.channel}</p>
          </Panel>
        </div>
      </div>
      <Dialog
        open={move === "Hired"}
        onClose={() => setMove(null)}
        headline={`Mark ${c.name.split(" ")[0]} as hired?`}
        description="A hire becomes a confirmed placement only when the candidate confirms they started."
        actions={
          <>
            <Button onClick={() => setMove(null)}>Cancel</Button>
            <Button
              variant="filled"
              disabled={!start || start > new Date().toISOString().slice(0, 10)}
              onClick={() => perform("Hired")}
            >
              Record hire
            </Button>
          </>
        }
      >
        <TextField
          label="Start date"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          value={start}
          required
          onChange={(e) => setStart(e.target.value)}
        />
        <p className="meta mt">
          The preview records an unconfirmed hire. It does not contact the
          candidate.
        </p>
      </Dialog>
      <ConfirmDialog
        open={move === "Rejected"}
        onClose={() => setMove(null)}
        headline={`Reject ${c.name.split(" ")[0]}’s application?`}
        description="The application will be marked rejected, with notification scheduled for three days later. You can reopen it. This preview sends no email."
        confirmLabel="Reject application"
        danger
        onConfirm={() => perform("Rejected")}
      />
      <ConfirmDialog
        open={send}
        onClose={() => setSend(false)}
        headline="Save this preview message?"
        description={`To ${c.name} · ${c.email}. No real email will be sent.`}
        confirmLabel="Save preview"
        onConfirm={() => {
          update({
            messages: [
              { subject, body: message, date: new Date().toISOString() },
              ...app.messages,
            ],
          });
          setSubject("");
          setMessage("");
          setTemplate("");
          notify("Preview message saved. No email sent.");
        }}
      />
      <ProfileCV candidate={c} open={cv} onClose={() => setCV(false)} />
    </>
  );
}
