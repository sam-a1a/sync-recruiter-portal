import { BrandIcon } from "../components/CatalogueIcon";
import { findBrand, defaultBrand, type BrandLogo } from "../catalogues/brands";
import { AnimatedRegion } from "../components/AnimatedRegion";
import { useState, useEffect, type FormEvent } from "react";
import {
  Header,
  Panel,
  Tabs,
  Avatar,
  Status,
  Empty,
  Link,
} from "../components/PortalUI";
import { Button, IconButton } from "../components/Button";
import { Icon } from "../components/Icon";
import {
  TextField,
  TextArea,
  SelectField,
  PasswordField,
} from "../components/Field";
import { Dialog, ConfirmDialog } from "../components/Dialog";
import { useWorkspace } from "../store";
import { useQuery, navigate } from "../app/router";
import { useTheme } from "../theme/useTheme";
import { uid, seed, type Member } from "../data";
export function Settings() {
  const { data, setData, notify, reset } = useWorkspace();
  const { params, set } = useQuery();
  const tab = params.get("tab") || "team";
  const [draft, setDraft] = useState<Member | null>(null);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState<Member | null>(null);
  const [vocab, setVocab] = useState<{
    kind: "tags" | "channels";
    old: string;
    name: string;
    website?: string;
  } | null>(null);
  const [deleteVocab, setDeleteVocab] = useState<{
    kind: "tags" | "channels";
    name: string;
  } | null>(null);
  const [organization, setOrganization] = useState({ ...data.organization });
  const [restoring, setRestoring] = useState(false);
  const saveMember = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (
      data.team.some(
        (m) =>
          m.id !== draft.id &&
          m.email.toLowerCase() === draft.email.toLowerCase(),
      )
    ) {
      setError("A teammate with this email is already in your workspace.");
      return;
    }
    const value = { ...draft, id: draft.id || uid() };
    setData((d) => ({
      ...d,
      team: d.team.some((m) => m.id === value.id)
        ? d.team.map((m) => (m.id === value.id ? value : m))
        : [...d.team, value],
    }));
    setDraft(null);
    notify(
      draft.id
        ? "Teammate updated"
        : "Invitation added to the preview. No email sent.",
    );
  };
  const [savingVocab, setSavingVocab] = useState(false);
  const saveVocab = async (e: FormEvent) => {
    e.preventDefault();
    if (!vocab) return;
    const name = vocab.name.trim();
    if (
      !name ||
      name.toLowerCase() === "direct" ||
      data[vocab.kind].some(
        (s) => s !== vocab.old && s.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setError("Choose a unique name. “Direct” is reserved.");
      return;
    }
    setSavingVocab(true);
    let logo: BrandLogo | undefined;
    if (vocab.kind === "channels") {
      try {
        logo = await findBrand(name, vocab.website);
      } catch {
        logo = defaultBrand(name);
      }
    }
    const channelLogos = { ...data.channelLogos };
    if (vocab.kind === "channels") {
      delete channelLogos[vocab.old];
      if (logo) channelLogos[name] = logo;
    }
    setData((d) => ({
      ...d,
      channelLogos,
      [vocab.kind]: vocab.old
        ? d[vocab.kind].map((s) => (s === vocab.old ? name : s))
        : [...d[vocab.kind], name],
      links:
        vocab.kind === "channels"
          ? d.links.map((l) =>
              l.channel === vocab.old ? { ...l, channel: name } : l,
            )
          : d.links,
      candidates:
        vocab.kind === "tags"
          ? d.candidates.map((c) => ({
              ...c,
              tags: c.tags.map((t) => (t === vocab.old ? name : t)),
            }))
          : d.candidates,
      applications:
        vocab.kind === "tags"
          ? d.applications.map((a) => ({
              ...a,
              tags: a.tags.map((t) => (t === vocab.old ? name : t)),
            }))
          : d.applications,
    }));
    setVocab(null);
    setSavingVocab(false);
    notify("Workspace vocabulary saved");
  };
  return (
    <>
      <Header
        eyebrow="A workspace that works for you"
        title="Settings"
        description="Your people, your shared vocabulary, your organization."
      />
      <Tabs
        label="Settings"
        value={tab}
        onChange={(tab) => set({ tab })}
        options={[
          { id: "team", label: "Team" },
          { id: "tags", label: "Tags" },
          { id: "channels", label: "Channels" },
          { id: "tenant", label: "Organization" },
        ]}
      />
      <AnimatedRegion changeKey={tab} className="section-space">
        {tab === "team" ? (
          <Panel
            title="The people behind the work"
            action={
              <Button
                variant="filled"
                icon="add"
                onClick={() => {
                  setError("");
                  setDraft({
                    id: "",
                    name: "",
                    email: "",
                    role: "Recruiter",
                    status: "Invited",
                  });
                }}
              >
                Invite teammate
              </Button>
            }
          >
            <p className="panel-note">
              Admins manage the workspace. Recruiters manage hiring.
            </p>
            <div
              className="team-list"
              data-has-reminders={data.team.some((m) => m.status === "Invited")}
            >
              {data.team.map((m) => (
                <div className="team-row" key={m.id}>
                  <Avatar name={m.name} />
                  <div className="record-primary">
                    <strong>
                      {m.name}
                      {m.id === "me" ? " (you)" : ""}
                    </strong>
                    <span>{m.email}</span>
                  </div>
                  <span className="team-role">{m.role}</span>
                  <Status value={m.status} />
                  <div className="actions">
                    {m.status === "Invited" && (
                      <IconButton
                        icon="replay"
                        label={`Resend invitation to ${m.name}`}
                        onClick={() =>
                          notify(
                            "Invitation reminder recorded in preview. No email sent.",
                          )
                        }
                      />
                    )}
                    {m.status !== "Invited" &&
                      data.team.some(
                        (person) => person.status === "Invited",
                      ) && (
                        <span className="reminder-space" aria-hidden="true" />
                      )}
                    <IconButton
                      icon="edit"
                      label={`Edit ${m.name}`}
                      disabled={m.id === "me"}
                      onClick={() => {
                        setError("");
                        setDraft({ ...m });
                      }}
                    />
                    <IconButton
                      icon="delete"
                      label={`Remove ${m.name}`}
                      disabled={m.id === "me"}
                      onClick={() => setRemove(m)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : tab === "tags" || tab === "channels" ? (
          <Panel
            title={
              tab === "tags"
                ? "A shared language for talent"
                : "Where you share opportunities"
            }
            action={
              <Button
                variant="filled"
                icon="add"
                onClick={() => {
                  setError("");
                  setVocab({ kind: tab, old: "", name: "" });
                }}
              >
                Add {tab === "tags" ? "tag" : "channel"}
              </Button>
            }
          >
            <p className="panel-note">
              {tab === "tags"
                ? "Tags help your team keep context across candidates and applications."
                : "Use a consistent channel name to understand where your applicants come from."}
            </p>
            <div className="vocabulary-list">
              {data[tab].map((name) => {
                const count =
                  tab === "tags"
                    ? data.candidates.filter((c) => c.tags.includes(name))
                        .length +
                      data.applications.filter((a) => a.tags.includes(name))
                        .length
                    : data.links.filter((l) => l.channel === name).length;
                return (
                  <div className="simple-row" key={name}>
                    <div className="actions">
                      <span className="section-icon">
                        {tab === "channels" ? (
                          <BrandIcon
                            name={name}
                            logo={data.channelLogos?.[name]}
                          />
                        ) : (
                          <Icon name="bookmark" />
                        )}
                      </span>
                      <div>
                        <strong>{name}</strong>
                        <p className="meta">
                          {count} {tab === "tags" ? "records" : "tracked links"}
                        </p>
                      </div>
                    </div>
                    <div className="actions">
                      <IconButton
                        icon="edit"
                        label={`Rename ${name}`}
                        onClick={() => {
                          setError("");
                          setVocab({
                            kind: tab,
                            old: name,
                            name,
                            website: data.channelLogos?.[name]?.website,
                          });
                        }}
                      />
                      <IconButton
                        icon="delete"
                        label={`Delete ${name}`}
                        disabled={tab === "channels" && count > 0}
                        title={
                          tab === "channels" && count > 0
                            ? "Remove its tracked links before deleting this channel"
                            : undefined
                        }
                        onClick={() => setDeleteVocab({ kind: tab, name })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {!data[tab].length && <Empty title={`No ${tab} yet`} />}
            <p className="meta mt">
              {tab === "channels"
                ? "Channels used by tracked links cannot be deleted. Rename them or remove their links first."
                : "Deleting a tag also removes it from the records that use it."}
            </p>
          </Panel>
        ) : (
          <div className="settings-layout">
            <Panel title="Organization details">
              <form
                className="form-stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  setData((d) => ({ ...d, organization }));
                  notify("Organization details saved");
                }}
              >
                <div className="organization-mark">
                  <span>OB</span>
                  <div>
                    <strong>{organization.name}</strong>
                    <p className="meta">Your recruiter workspace</p>
                  </div>
                </div>
                <TextField
                  label="Organization name"
                  value={organization.name}
                  required
                  onChange={(e) =>
                    setOrganization({ ...organization, name: e.target.value })
                  }
                />
                <TextField
                  label="Website"
                  type="url"
                  value={organization.website}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      website: e.target.value,
                    })
                  }
                />
                <TextArea
                  label="About your organization"
                  value={organization.description}
                  rows={5}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      description: e.target.value,
                    })
                  }
                />
                <div className="actions end">
                  <Button type="submit" variant="filled">
                    Save changes
                  </Button>
                </div>
              </form>
            </Panel>
            <div className="stack">
              <Panel title="Your preview workspace">
                <p className="muted">
                  Everything here uses fictional records. Changes are saved in
                  this browser, so you can keep exploring where you left off.
                </p>
                <p className="muted mt">
                  Restore the original sample jobs, people and settings at any
                  time.
                </p>
                <Button
                  className="mt"
                  variant="outlined"
                  icon="replay"
                  onClick={() => setRestoring(true)}
                >
                  Reset preview
                </Button>
              </Panel>
              <Panel title="Your account">
                <p className="muted">
                  Manage your name, appearance and personal preferences.
                </p>
                <Link to="/account" className="text-link mt">
                  Account settings <Icon name="arrow_forward" size={18} />
                </Link>
              </Panel>
            </div>
          </div>
        )}
      </AnimatedRegion>
      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        headline={draft?.id ? "Edit teammate" : "Invite a teammate"}
        description="Invitations in this design preview stay in your browser."
        actions={
          <>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="filled" type="submit" form="member-form">
              {draft?.id ? "Save changes" : "Add invitation"}
            </Button>
          </>
        }
      >
        {draft && (
          <form className="form-stack" id="member-form" onSubmit={saveMember}>
            <TextField
              label="Full name"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextField
              label="Email address"
              type="email"
              required
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
            <SelectField
              label="Role"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            >
              <option>Recruiter</option>
              <option>Admin</option>
            </SelectField>
            {draft.id && (
              <SelectField
                label="Access"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                <option>Active</option>
                <option>Suspended</option>
                <option>Invited</option>
              </SelectField>
            )}
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </Dialog>
      <ConfirmDialog
        open={!!remove}
        onClose={() => setRemove(null)}
        headline={`Remove ${remove?.name}?`}
        description="They will leave the preview workspace. Their existing notes remain."
        confirmLabel="Remove teammate"
        danger
        onConfirm={() => {
          setData((d) => ({
            ...d,
            team: d.team.filter((m) => m.id !== remove?.id),
          }));
          notify("Teammate removed");
        }}
      />
      <Dialog
        open={!!vocab}
        onClose={() => setVocab(null)}
        headline={
          vocab?.old
            ? "Rename entry"
            : `Add ${vocab?.kind === "tags" ? "tag" : "channel"}`
        }
        actions={
          <>
            <Button onClick={() => setVocab(null)}>Cancel</Button>
            <Button
              variant="filled"
              form="vocab-form"
              type="submit"
              disabled={savingVocab}
            >
              {savingVocab ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        {vocab && (
          <form id="vocab-form" className="form-stack" onSubmit={saveVocab}>
            <TextField
              label="Name"
              required
              maxLength={60}
              value={vocab.name}
              onChange={(e) => setVocab({ ...vocab, name: e.target.value })}
            />
            {vocab.kind === "channels" && (
              <>
                <TextField
                  label="Channel website (optional)"
                  placeholder="linkedin.com"
                  value={vocab.website || ""}
                  onChange={(e) =>
                    setVocab({ ...vocab, website: e.target.value })
                  }
                />
                <ChannelLogoPreview
                  name={vocab.name}
                  website={vocab.website || ""}
                />
              </>
            )}
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </Dialog>
      <ConfirmDialog
        open={!!deleteVocab}
        onClose={() => setDeleteVocab(null)}
        headline={`Delete “${deleteVocab?.name}”?`}
        description="This removes the entry from your workspace and from records using it."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (!deleteVocab) return;
          setData((d) => ({
            ...d,
            [deleteVocab.kind]: d[deleteVocab.kind].filter(
              (x) => x !== deleteVocab.name,
            ),
            channelLogos:
              deleteVocab.kind === "channels"
                ? Object.fromEntries(
                    Object.entries(d.channelLogos || {}).filter(
                      ([name]) => name !== deleteVocab.name,
                    ),
                  )
                : d.channelLogos,
            candidates:
              deleteVocab.kind === "tags"
                ? d.candidates.map((c) => ({
                    ...c,
                    tags: c.tags.filter((t) => t !== deleteVocab.name),
                  }))
                : d.candidates,
            applications:
              deleteVocab.kind === "tags"
                ? d.applications.map((a) => ({
                    ...a,
                    tags: a.tags.filter((t) => t !== deleteVocab.name),
                  }))
                : d.applications,
          }));
          notify("Entry deleted");
        }}
      />
      <ConfirmDialog
        open={restoring}
        onClose={() => setRestoring(false)}
        headline="Restore the sample workspace?"
        description="This removes your local preview changes and brings back the original fictional data."
        confirmLabel="Reset preview"
        danger
        onConfirm={() => {
          reset();
          setOrganization({ ...seed.organization });
        }}
      />
    </>
  );
}
export function Account() {
  const { data, setData, notify } = useWorkspace();
  const { mode, setMode, contrast, setContrast } = useTheme();
  const [name, setName] = useState(data.account.name);
  const [email, setEmail] = useState(data.account.email);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <Header
        eyebrow="Your space within the workspace"
        title="Account"
        description="Personal details and a view that feels right."
      />
      <div className="settings-layout">
        <div className="stack">
          <Panel title="Your profile">
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                setData((d) => ({
                  ...d,
                  account: { name, email },
                  team: d.team.map((m) =>
                    m.id === "me" ? { ...m, name, email } : m,
                  ),
                }));
                notify("Profile saved in preview");
              }}
            >
              <div className="actions">
                <Avatar name={name} large />
                <div>
                  <h3>{name}</h3>
                  <p className="muted">Workspace admin</p>
                </div>
              </div>
              <TextField
                label="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="actions end">
                <Button type="submit" variant="filled">
                  Save profile
                </Button>
              </div>
            </form>
          </Panel>
          <Panel title="Password">
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                if (password.length < 8 || password !== confirm) {
                  setError(
                    "Use at least 8 characters and make sure both passwords match.",
                  );
                  return;
                }
                setError("");
                setPassword("");
                setConfirm("");
                notify(
                  "Password form validated. No account password was changed.",
                );
              }}
            >
              <p className="muted">
                Try the password flow with a sample password. This preview does
                not store passwords or update a real account.
              </p>
              <PasswordField
                label="New password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordField
                label="Confirm password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && (
                <p className="inline-error" role="alert">
                  {error}
                </p>
              )}
              <Button variant="outlined" type="submit">
                Preview password change
              </Button>
            </form>
          </Panel>
        </div>
        <div className="stack">
          <Panel title="Appearance">
            <div className="form-stack">
              <SelectField
                label="Color theme"
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
              >
                <option value="system">Use device setting</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </SelectField>
              <SelectField
                label="Contrast"
                value={contrast}
                onChange={(e) => setContrast(e.target.value as typeof contrast)}
              >
                <option value="system">Use device setting</option>
                <option value="standard">Standard</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </SelectField>
              <p className="meta">
                Animations follow your device’s reduced-motion setting.
              </p>
            </div>
          </Panel>
          <Panel title="Session">
            <p className="muted">
              Signing out returns to the preview sign-in screen. Your local
              workspace stays saved.
            </p>
            <Button
              className="mt"
              variant="outlined"
              icon="logout"
              onClick={() => navigate("/login")}
            >
              Sign out
            </Button>
          </Panel>
        </div>
      </div>
    </>
  );
}

function ChannelLogoPreview({
  name,
  website,
}: {
  name: string;
  website: string;
}) {
  const [result, setResult] = useState<{
    key: string;
    logo?: BrandLogo;
    failed?: boolean;
  }>();
  const key = `${name}|${website}`;
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      findBrand(name, website)
        .then((logo) => {
          if (current) setResult({ key, logo });
        })
        .catch(() => {
          if (current) setResult({ key, failed: true });
        });
    }, 300);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [name, website, key]);
  const logo = result?.key === key ? result.logo : undefined;
  return (
    <div className="channel-logo-preview">
      <span className="section-icon">
        <BrandIcon name={name} logo={logo} />
      </span>
      <div>
        <strong>{logo?.title || "Channel logo"}</strong>
        <p className="meta" role="status">
          {!name && !website
            ? "Enter a name or website to find its logo."
            : result?.key !== key
              ? "Finding logo…"
              : logo
                ? "Logo from thesvg.org"
                : result.failed
                  ? "Logo catalogue unavailable. You can still save this channel."
                  : "No matching logo. A link icon will be used."}
        </p>
      </div>
    </div>
  );
}
