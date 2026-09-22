import { RichText } from "../components/RichText";
import { useState, type FormEvent } from "react";
import { Button, IconButton } from "../components/Button";
import { TextField, PasswordField, TextArea } from "../components/Field";
import { Link, Badge } from "../components/PortalUI";
import { Icon } from "../components/Icon";
import { asset } from "../app/base";
import { navigate, useQuery } from "../app/router";
import { useTheme } from "../theme/useTheme";
import { useWorkspace } from "../store";
export function PublicPage({ path }: { path: string }) {
  const { resolvedTheme, setMode } = useTheme();
  const { data } = useWorkspace();
  const { params } = useQuery();
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const job = data.jobs.find((j) => j.id === params.get("job"));
  const reset = path === "/forgot-password";
  const request = path === "/request-access";
  const newPassword = path.includes("/auth/");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (path === "/login") {
      navigate("/dashboard");
      return;
    }
    if (newPassword && (password.length < 8 || password !== again)) {
      setError("Use at least 8 characters and make sure both passwords match.");
      return;
    }
    setError("");
    setDone(true);
  };
  return (
    <div className="public-page">
      <header className="public-header">
        <Link to="/welcome" className="brand">
          <img src={asset("logo.png")} alt="" />
          <span>
            SYNC Hub<small>For teams that make a difference</small>
          </span>
        </Link>
        <div className="actions">
          <IconButton
            icon={resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
            label="Toggle theme"
            onClick={() => setMode(resolvedTheme === "dark" ? "light" : "dark")}
          />
          <Link to="/dashboard" className="md-button md-button--tonal">
            Open workspace <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </header>
      {path === "/welcome" ? (
        job ? (
          <main className="public-job">
            <Badge>Sample job page</Badge>
            <h1>{job.title}</h1>
            <p className="public-subtitle">
              {data.organization.name} · {job.location} · {job.mode}
            </p>
            <div className="panel">
              <RichText value={job.description} />
            </div>
            <p className="muted mt">
              This is a preview of a shared opportunity. Applications are not
              collected here.
            </p>
            <Link
              to={`/jobs/${job.id}`}
              className="md-button md-button--filled mt"
            >
              Review in workspace
            </Link>
          </main>
        ) : (
          <main className="landing">
            <div className="landing-copy">
              <span className="eyebrow">People. Purpose. Possibility.</span>
              <h1>
                Better teams.
                <br />
                <em>
                  Stronger
                  <br />
                  communities.
                </em>
              </h1>
              <p>
                Find the people who believe in your work. Bring your jobs,
                candidates and hiring conversations together in one thoughtful
                workspace.
              </p>
              <div className="actions">
                <Link
                  to="/request-access"
                  className="md-button md-button--filled"
                >
                  Request access <Icon name="arrow_forward" />
                </Link>
                <Link to="/login" className="md-button md-button--outlined">
                  Sign in
                </Link>
              </div>
              <span className="meta">
                Hiring for a better tomorrow, together.
              </span>
            </div>
            <div className="landing-panels">
              <section className="landing-statement">
                <Icon name="group" size={40} />
                <h2>
                  Good work starts
                  <br />
                  with good people.
                </h2>
                <p>Make space for what matters in your hiring.</p>
              </section>
              <div className="landing-feature">
                <Icon name="work" />
                <div>
                  <h3>One clear process</h3>
                  <p>
                    Publish roles and guide every application from hello to
                    hired.
                  </p>
                </div>
              </div>
              <div className="landing-feature">
                <Icon name="bookmark" />
                <div>
                  <h3>Connections that last</h3>
                  <p>
                    Build a talent pool for the opportunities still to come.
                  </p>
                </div>
              </div>
              <div className="landing-feature">
                <Icon name="data_usage" />
                <div>
                  <h3>Progress you can see</h3>
                  <p>
                    Understand your reach and celebrate confirmed placements.
                  </p>
                </div>
              </div>
            </div>
          </main>
        )
      ) : (
        <main className="auth-layout">
          <section className="auth-copy">
            <span className="eyebrow">SYNC Hub · Recruiter portal</span>
            <h1>
              {request
                ? "Great teams start with a conversation."
                : "A little purpose.\nA lot of possibility."}
            </h1>
            <p>
              A calmer space to find the people who will move your work forward.
            </p>
            <img src={asset("logo.png")} alt="" />
          </section>
          <section className="auth-form-panel">
            <Badge>Design preview</Badge>
            {done ? (
              <div className="form-stack">
                <span className="success-mark">
                  <Icon name="check" size={32} />
                </span>
                <h2>
                  {request
                    ? "Your request is ready"
                    : reset
                      ? "Check your email — preview"
                      : "You’re ready to go"}
                </h2>
                <p className="muted">
                  {request
                    ? "In the connected portal, your request would reach the SYNC team. This preview has not sent or submitted your details."
                    : reset
                      ? "The connected portal sends reset instructions when an account exists. No email was sent from this preview."
                      : "The form has been validated. No account was created and no password was changed."}
                </p>
                <Link to="/dashboard" className="md-button md-button--filled">
                  Explore the workspace <Icon name="arrow_forward" />
                </Link>
              </div>
            ) : (
              <>
                <h2>
                  {request
                    ? "Request access"
                    : reset
                      ? "Forgot your password?"
                      : newPassword
                        ? "Set your password"
                        : "Welcome back."}
                </h2>
                <p className="muted">
                  {request
                    ? "Tell us a little about your organization."
                    : reset
                      ? "Enter your work email to preview the reset flow."
                      : newPassword
                        ? "Use a sample password to explore this form."
                        : "Explore the recruiter workspace with sample details."}
                </p>
                <form className="form-stack" onSubmit={submit}>
                  {request && (
                    <>
                      <TextField label="Organization name" required />
                      <TextField label="Your full name" required />
                    </>
                  )}
                  {!newPassword && (
                    <TextField
                      label="Work email"
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.org"
                    />
                  )}
                  {path === "/login" && (
                    <PasswordField
                      label="Password"
                      required
                      autoComplete="current-password"
                      help="Use sample details. No credentials are sent or stored."
                    />
                  )}
                  {newPassword && (
                    <>
                      <PasswordField
                        label="New password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <PasswordField
                        label="Confirm password"
                        required
                        value={again}
                        onChange={(e) => setAgain(e.target.value)}
                      />
                    </>
                  )}
                  {request && (
                    <TextArea label="What does your team need?" rows={3} />
                  )}{" "}
                  {error && (
                    <p className="inline-error" role="alert">
                      {error}
                    </p>
                  )}
                  <Button variant="filled" type="submit">
                    {request
                      ? "Preview request"
                      : reset
                        ? "Preview reset"
                        : newPassword
                          ? "Continue"
                          : "Open preview"}
                    <Icon name="arrow_forward" />
                  </Button>
                  {path === "/login" ? (
                    <Link className="text-link" to="/forgot-password">
                      Forgot your password?
                    </Link>
                  ) : (
                    <Link className="text-link" to="/login">
                      Back to sign in
                    </Link>
                  )}
                </form>
                {path === "/login" && (
                  <p className="meta mt">
                    New to SYNC Hub?{" "}
                    <Link className="inline-link" to="/request-access">
                      Request access
                    </Link>
                  </p>
                )}
              </>
            )}
          </section>
        </main>
      )}
      <footer className="public-footer">
        <span>SYNC Hub · Purpose brings us together.</span>
        <a
          href="https://sam-a1a.github.io/sync-candidate-portal/"
          target="_blank"
          rel="noreferrer"
        >
          Looking for work? Visit the candidate portal{" "}
          <Icon name="arrow_forward" size={16} />
        </a>
      </footer>
    </div>
  );
}
