import { BrandIcon } from "../components/CatalogueIcon";
import { Checkbox } from "../components/Checkbox";
import { AnimatedRegion } from "../components/AnimatedRegion";
import { ViewToggle } from "../components/ViewToggle";
import { useCollectionView } from "../hooks/useCollectionView";
import { useState, type FormEvent } from "react";
import { Header, Panel, Search, Empty, Link } from "../components/PortalUI";
import { Button, IconButton } from "../components/Button";
import { Icon } from "../components/Icon";
import { TextField, TextArea, SelectField } from "../components/Field";
import { Dialog, ConfirmDialog } from "../components/Dialog";
import { useWorkspace } from "../store";
import { href } from "../app/base";
import { uid, type Template, type TrackedLink } from "../data";
export { Settings, Account } from "./Settings";
export function Templates() {
  const { data, setData, notify } = useWorkspace();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(data.templates[0]?.id || "");
  const [draft, setDraft] = useState<Template | null>(null);
  const [remove, setRemove] = useState<Template | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(true);
  const template =
    data.templates.find((t) => t.id === selected) || data.templates[0];
  const visible = data.templates.filter((t) =>
    `${t.name} ${t.subject}`.toLowerCase().includes(q.toLowerCase()),
  );
  const sample = (text: string) =>
    preview
      ? text
          .replaceAll(/{{\s*candidate_name\s*}}/g, "Maya Khalil")
          .replaceAll(/{{\s*job_title\s*}}/g, "Programme Coordinator")
          .replaceAll(/{{\s*tenant_name\s*}}/g, data.organization.name)
      : text;
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const unknown = [
      ...(draft.body + " " + draft.subject).matchAll(/{{\s*(.*?)\s*}}/g),
    ].some(
      (m) =>
        !["candidate_name", "job_title", "tenant_name"].includes(m[1].trim()),
    );
    if (unknown) {
      setError(
        "Use only candidate_name, job_title or tenant_name inside {{ }}.",
      );
      return;
    }
    const value = { ...draft, id: draft.id || uid() };
    setData((d) => ({
      ...d,
      templates: d.templates.some((t) => t.id === value.id)
        ? d.templates.map((t) => (t.id === value.id ? value : t))
        : [...d.templates, value],
    }));
    setSelected(value.id);
    setDraft(null);
    notify("Template saved");
  };
  return (
    <>
      <Header
        eyebrow="Words that make a difference"
        title="Message templates"
        description="A thoughtful starting point for every conversation."
        actions={
          <Button
            variant="filled"
            icon="add"
            onClick={() => {
              setError("");
              setDraft({ id: "", name: "", subject: "", body: "" });
            }}
          >
            Create template
          </Button>
        }
      />
      <div className="template-layout">
        <div className="stack">
          <Search value={q} onChange={setQ} placeholder="Find a template" />
          <div className="template-list">
            {visible.map((t) => (
              <button
                key={t.id}
                className="template-card"
                aria-pressed={template?.id === t.id}
                onClick={() => setSelected(t.id)}
              >
                <span className="section-icon">
                  <Icon name="description" />
                </span>
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.subject}</small>
                </span>
                <Icon name="chevron_right" size={20} />
              </button>
            ))}
          </div>
          {!visible.length && <Empty title="No matching templates" />}
        </div>
        <AnimatedRegion changeKey={`${template?.id}-${preview}`}>
          {template ? (
            <Panel className="template-preview">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Message preview</p>
                  <h2>{template.name}</h2>
                </div>
                <div className="actions">
                  <IconButton
                    icon="edit"
                    outlined
                    label="Edit template"
                    onClick={() => {
                      setError("");
                      setDraft({ ...template });
                    }}
                  />
                  <IconButton
                    icon="delete"
                    outlined
                    label="Delete template"
                    onClick={() => setRemove(template)}
                  />
                </div>
              </div>
              <Checkbox
                label="Show sample values"
                showLabel
                checked={preview}
                onChange={(e) => setPreview(e.target.checked)}
              />
              <div className="message-paper">
                <div className="message-meta">
                  <span>To</span>
                  <strong>
                    {preview ? "Maya Khalil" : "{{ candidate_name }}"}
                  </strong>
                </div>
                <div className="message-meta">
                  <span>Subject</span>
                  <strong>{sample(template.subject)}</strong>
                </div>
                <p className="preserve">{sample(template.body)}</p>
              </div>
              <div className="notice">
                <Icon name="info" />
                <span>
                  Names and job details are filled in when you use a template on
                  an application.
                </span>
              </div>
              <Button
                variant="outlined"
                icon="add"
                onClick={() => {
                  setError("");
                  setDraft({
                    ...template,
                    id: "",
                    name: `${template.name} · copy`,
                  });
                }}
              >
                Duplicate template
              </Button>
            </Panel>
          ) : (
            <Empty
              title="Start with a few good words"
              description="Create your first template for the messages your team sends often."
            />
          )}
        </AnimatedRegion>
      </div>
      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        headline={draft?.id ? "Edit template" : "Create a template"}
        actions={
          <>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="filled" type="submit" form="template-form">
              Save template
            </Button>
          </>
        }
      >
        {draft && (
          <form id="template-form" className="form-stack" onSubmit={save}>
            <TextField
              label="Template name"
              required
              maxLength={120}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextField
              label="Subject"
              required
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            />
            <TextArea
              label="Message"
              required
              rows={7}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
            <div>
              <p className="meta">Insert a personal detail</p>
              <div className="chips mt">
                {["candidate_name", "job_title", "tenant_name"].map((p) => (
                  <button
                    type="button"
                    className="filter-chip"
                    key={p}
                    onClick={() =>
                      setDraft({ ...draft, body: draft.body + ` {{ ${p} }}` })
                    }
                  >
                    {p.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <p role="alert" className="inline-error">
                {error}
              </p>
            )}
          </form>
        )}
      </Dialog>
      <ConfirmDialog
        open={!!remove}
        onClose={() => setRemove(null)}
        headline="Delete this template?"
        description={`“${remove?.name}” will be removed. Messages already saved on applications will remain.`}
        confirmLabel="Delete template"
        danger
        onConfirm={() => {
          setData((d) => ({
            ...d,
            templates: d.templates.filter((t) => t.id !== remove?.id),
          }));
          notify("Template deleted");
        }}
      />
    </>
  );
}
export function TrackedLinks({
  jobId,
  embedded = false,
}: {
  jobId?: string;
  embedded?: boolean;
}) {
  const [view, setView] = useCollectionView("tracked-links", "rows");
  const { data, setData, notify } = useWorkspace();
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState("All");
  const [draft, setDraft] = useState<TrackedLink | null>(null);
  const [remove, setRemove] = useState<TrackedLink | null>(null);
  const links = data.links.filter(
    (l) =>
      (!jobId || l.jobId === jobId) &&
      (channel === "All" || l.channel === channel) &&
      `${l.label} ${data.jobs.find((j) => j.id === l.jobId)?.title}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const views = links.reduce((n, l) => n + l.views, 0);
  const apps = links.reduce((n, l) => n + l.applications, 0);
  const newLink = () =>
    setDraft({
      id: "",
      label: "",
      jobId: jobId || data.jobs.find((j) => j.status === "Published")?.id || "",
      channel: data.channels[0] || "",
      views: 0,
      applications: 0,
    });
  const address = (l: TrackedLink) =>
    `${window.location.origin}${href(`/welcome?job=${l.jobId}&via=${l.id}`)}`;
  const copy = async (l: TrackedLink) => {
    try {
      await navigator.clipboard.writeText(address(l));
      notify("Preview link copied");
    } catch {
      notify(
        "Could not copy automatically. Open the link and copy the address.",
      );
    }
  };
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft?.jobId || !draft.channel) return;
    const value = { ...draft, id: draft.id || uid() };
    setData((d) => ({
      ...d,
      links: d.links.some((l) => l.id === value.id)
        ? d.links.map((l) => (l.id === value.id ? value : l))
        : [value, ...d.links],
    }));
    setDraft(null);
    notify("Tracked link saved");
  };
  return (
    <>
      {!embedded ? (
        <Header
          eyebrow="Reach the right communities"
          title="Tracked links"
          description="See which channels bring people to your opportunities."
          actions={
            <Button variant="filled" icon="add" onClick={newLink}>
              Create link
            </Button>
          }
        />
      ) : (
        <div className="actions end">
          <Button variant="filled" icon="add" onClick={newLink}>
            Create link
          </Button>
        </div>
      )}
      <div className="link-metrics">
        <div>
          <Icon name="visibility" />
          <strong>{views.toLocaleString()}</strong>
          <span>job views</span>
        </div>
        <div>
          <Icon name="description" />
          <strong>{apps}</strong>
          <span>applications</span>
        </div>
        <div>
          <Icon name="data_usage" />
          <strong>{views ? Math.round((apps / views) * 100) : 0}%</strong>
          <span>conversion</span>
        </div>
      </div>
      <div className="filter-row">
        <Search value={q} onChange={setQ} placeholder="Find a link or job" />
        <SelectField
          label="Channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option>All</option>
          {data.channels.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
      </div>
      <div className="collection-toolbar">
        <span className="meta">{links.length} links</span>
        <ViewToggle label="Tracked links" value={view} onChange={setView} />
      </div>
      <Panel
        className={`table-panel collection-table collection-table--${view}`}
      >
        {links.length ? (
          <table className="data-table links-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Channel</th>
                <th>Views</th>
                <th>Applications</th>
                <th>Conversion</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr
                  key={l.id}
                  style={{ viewTransitionName: `tracked-${l.id}` }}
                >
                  <td className="link-name">
                    <a
                      className="text-link"
                      href={address(l)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.label}
                      <Icon name="arrow_forward" size={16} />
                    </a>
                    <span className="meta">
                      {data.jobs.find((j) => j.id === l.jobId)?.title}
                    </span>
                  </td>
                  <td data-label="Channel">
                    <span className="channel-badge" title={l.channel}>
                      <BrandIcon
                        name={l.channel}
                        logo={data.channelLogos?.[l.channel]}
                      />
                      <span>{l.channel}</span>
                    </span>
                  </td>
                  <td data-label="Views">{l.views}</td>
                  <td data-label="Applications">{l.applications}</td>
                  <td data-label="Conversion">
                    {l.views ? Math.round((l.applications / l.views) * 100) : 0}
                    %
                  </td>
                  <td className="table-actions">
                    <IconButton
                      icon="link"
                      label={`Copy ${l.label}`}
                      onClick={() => void copy(l)}
                    />
                    <IconButton
                      icon="edit"
                      label={`Edit ${l.label}`}
                      onClick={() => setDraft({ ...l })}
                    />
                    <IconButton
                      icon="delete"
                      label={`Delete ${l.label}`}
                      onClick={() => setRemove(l)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty
            title="No tracked links here"
            description="Create a link for a published job, then choose where to share it."
            action={
              <Button variant="tonal" onClick={newLink}>
                Create link
              </Button>
            }
          />
        )}
      </Panel>
      <p className="meta mt">
        Preview links open a sample job page. Traffic figures are illustrative.
      </p>
      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        headline={draft?.id ? "Edit tracked link" : "Create a tracked link"}
        actions={
          <>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button
              form="link-form"
              type="submit"
              variant="filled"
              disabled={
                !data.channels.length ||
                !data.jobs.some((j) => j.status === "Published")
              }
            >
              Save link
            </Button>
          </>
        }
      >
        {draft && (
          <form className="form-stack" id="link-form" onSubmit={save}>
            <TextField
              label="Link label"
              required
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
            <SelectField
              label="Job"
              required
              value={draft.jobId}
              onChange={(e) => setDraft({ ...draft, jobId: e.target.value })}
            >
              <option value="" disabled>
                Choose a job
              </option>
              {data.jobs
                .filter((j) => j.status === "Published" || j.id === draft.jobId)
                .map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
            </SelectField>
            <SelectField
              label="Channel"
              required
              value={draft.channel}
              onChange={(e) => setDraft({ ...draft, channel: e.target.value })}
            >
              <option value="" disabled>
                Choose a channel
              </option>
              {data.channels.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </SelectField>
            <p className="meta">
              Manage your channels in{" "}
              <Link to="/settings?tab=channels" onClick={() => setDraft(null)}>
                Settings
              </Link>
              .
            </p>
          </form>
        )}
      </Dialog>
      <ConfirmDialog
        open={!!remove}
        onClose={() => setRemove(null)}
        headline="Delete this tracked link?"
        description={`“${remove?.label}” and its preview traffic figures will be removed.`}
        confirmLabel="Delete link"
        danger
        onConfirm={() => {
          setData((d) => ({
            ...d,
            links: d.links.filter((l) => l.id !== remove?.id),
          }));
          notify("Tracked link deleted");
        }}
      />
    </>
  );
}
