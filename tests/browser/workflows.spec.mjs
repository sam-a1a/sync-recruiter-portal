import { test } from "@playwright/test";
import assert from "node:assert/strict";
test("recruiter workflows persist changes and enforce lifecycle rules", async ({
  page: p,
}) => {
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const go = async (route) => {
    await p.goto(route);
    await p.waitForTimeout(450);
  };
  const state = () =>
    p.evaluate(() =>
      JSON.parse(localStorage.getItem("sync-recruiter-preview-v1")),
    );
  const close = async () => {
    await p.waitForTimeout(350);
    assert.equal(await p.locator("dialog[open]").count(), 0);
  };
  await go("/jobs/new");
  await p
    .getByLabel("Job title", { exact: true })
    .fill("Community Partnerships Lead");
  await p
    .getByLabel("Job description", { exact: true })
    .fill(
      "Lead inclusive community partnerships and support field teams across Syria.",
    );
  await p.getByLabel("Closing date", { exact: true }).fill("2026-12-15");
  await p.getByRole("button", { name: "Continue", exact: true }).click();
  await p.getByRole("button", { name: "Add skill", exact: true }).click();
  await p
    .getByLabel("Skill 1", { exact: true })
    .selectOption("Community engagement");
  await p.getByRole("button", { name: "Add language", exact: true }).click();
  await p.getByRole("button", { name: "Add question", exact: true }).click();
  await p
    .getByLabel("Question", { exact: true })
    .fill("Can you travel to field sites?");
  await p.getByRole("button", { name: "Continue", exact: true }).click();
  await p.reload();
  assert(
    await p
      .getByRole("heading", { name: "Everything in one place" })
      .isVisible(),
  );
  await p.getByRole("button", { name: "Publish job", exact: true }).click();
  assert(
    await p
      .getByRole("heading", {
        name: "Community Partnerships Lead",
        exact: true,
      })
      .isVisible(),
  );
  let s = await state();
  assert.equal(s.jobs[0].criteria.questions.length, 1);
  assert.equal(s.jobs[0].status, "Published");
  console.log("PASS job wizard, screening, draft persistence, publish");
  await go("/jobs/j5");
  await p.getByRole("button", { name: "Edit job", exact: true }).click();
  await p.getByRole("button", { name: "Continue", exact: true }).click();
  await p.getByRole("button", { name: "Continue", exact: true }).click();
  await p.getByRole("button", { name: "Save changes", exact: true }).click();
  s = await state();
  assert.equal(s.jobs.find((j) => j.id === "j5").status, "Draft");
  console.log("PASS editing preserves draft status");
  await go("/applications/a1");
  await p
    .getByRole("button", { name: "Move to Reviewing", exact: true })
    .click();
  await p.getByRole("tab", { name: "Notes & tags", exact: true }).click();
  await p
    .getByLabel("Add a note", { exact: true })
    .fill("QA: Discuss partnership experience.");
  await p.getByRole("button", { name: "Add note", exact: true }).click();
  await p
    .getByRole("button", { name: "Future opportunity", exact: true })
    .click();
  await p.getByRole("tab", { name: "Messages", exact: true }).click();
  await p
    .getByLabel("Start from a template", { exact: true })
    .selectOption("t1");
  assert(
    (await p.getByLabel("Message", { exact: true }).inputValue()).includes(
      "Maya Khalil",
    ),
  );
  await p.getByRole("button", { name: "Preview send", exact: true }).click();
  await p.getByRole("button", { name: "Save preview", exact: true }).click();
  await close();
  await p.getByRole("tab", { name: "Overview", exact: true }).click();
  await p.getByLabel("More moves", { exact: true }).selectOption("Rejected");
  await p.getByRole("button", { name: "Move", exact: true }).click();
  await p
    .getByRole("button", { name: "Reject application", exact: true })
    .click();
  await close();
  s = await state();
  let a = s.applications.find((a) => a.id === "a1");
  assert.equal(a.stage, "Rejected");
  assert(a.rejectionDate);
  assert.equal(a.messages.length, 1);
  assert.equal(a.notes.length, 2);
  assert(a.tags.includes("Future opportunity"));
  await p
    .getByRole("button", { name: "Reopen for review", exact: true })
    .click();
  await p.getByLabel("More moves", { exact: true }).selectOption("Hired");
  await p.getByRole("button", { name: "Move", exact: true }).click();
  await p.getByLabel("Start date", { exact: true }).fill("2026-09-20");
  await p.getByRole("button", { name: "Record hire", exact: true }).click();
  await close();
  s = await state();
  a = s.applications.find((a) => a.id === "a1");
  assert.equal(a.stage, "Hired");
  assert.equal(a.confirmation, "Awaiting confirmation");
  assert.equal(await p.getByLabel("More moves", { exact: true }).count(), 0);
  console.log(
    "PASS application notes, tags, message, rejection, reopen, hire claim and terminal state",
  );
  await go("/applications?stage=New");
  await p.getByLabel("Select Omar Nasser", { exact: true }).check();
  await p.getByLabel("Select Tarek Hamdan", { exact: true }).check();
  await p.getByRole("button", { name: "Move selected", exact: true }).click();
  await p.getByRole("button", { name: "Move 2", exact: true }).click();
  await close();
  s = await state();
  assert.equal(s.applications.find((a) => a.id === "a2").stage, "Reviewing");
  assert.equal(s.applications.find((a) => a.id === "a6").stage, "Reviewing");
  console.log("PASS selected application move");
  await go("/candidates");
  await p.getByLabel("Role", { exact: true }).selectOption("Communications");
  await p.getByRole("button", { name: "Find candidates", exact: true }).click();
  assert.equal(await p.locator(".candidate-card").count(), 1);
  await p.getByRole("link", { name: "Nour Faris", exact: true }).click();
  await p.getByRole("tab", { name: "Notes & tags", exact: true }).click();
  await p.getByLabel("Add a note", { exact: true }).fill("QA: Keep in touch.");
  await p.getByRole("button", { name: "Add note", exact: true }).click();
  await go("/talent-pool");
  await p
    .getByRole("button", {
      name: "Remove Nour Faris from talent pool",
      exact: true,
    })
    .click();
  await p
    .getByRole("button", { name: "Remove from pool", exact: true })
    .click();
  await close();
  s = await state();
  assert.equal(s.candidates.find((c) => c.id === "c8").saved, false);
  assert.equal(s.candidates.find((c) => c.id === "c8").notes.length, 1);
  console.log("PASS candidate filters, notes, pool removal preserves notes");
  await go("/templates");
  await p.getByRole("button", { name: "Create template", exact: true }).click();
  await p.getByLabel("Template name", { exact: true }).fill("QA follow-up");
  await p
    .getByLabel("Subject", { exact: true })
    .fill("Hello {{ candidate_name }}");
  await p
    .getByLabel("Message", { exact: true })
    .fill("Thank you for applying for {{ job_title }}.");
  await p.getByRole("button", { name: "Save template", exact: true }).click();
  await close();
  assert(
    await p
      .getByRole("heading", { name: "QA follow-up", exact: true })
      .isVisible(),
  );
  await p.getByRole("button", { name: "Edit template", exact: true }).click();
  await p
    .getByLabel("Template name", { exact: true })
    .fill("QA follow-up edited");
  await p.getByRole("button", { name: "Save template", exact: true }).click();
  await close();
  await p.getByRole("button", { name: "Delete template", exact: true }).click();
  await p
    .getByRole("dialog")
    .getByRole("button", { name: "Delete template", exact: true })
    .click();
  await close();
  assert(
    !(await state()).templates.some((t) => t.name.includes("QA follow-up")),
  );
  console.log("PASS template create/edit/delete");
  await go("/settings");
  await p.getByRole("button", { name: "Invite teammate", exact: true }).click();
  await p.getByLabel("Full name", { exact: true }).fill("Preview Colleague");
  await p
    .getByLabel("Email address", { exact: true })
    .fill("colleague@example.org");
  await p.getByRole("button", { name: "Add invitation", exact: true }).click();
  await close();
  s = await state();
  assert(
    s.team.some(
      (m) => m.email === "colleague@example.org" && m.status === "Invited",
    ),
  );
  console.log("PASS team invitation");
  await go("/settings?tab=channels");
  await p.getByRole("button", { name: "Add channel", exact: true }).click();
  await p.getByLabel("Name", { exact: true }).fill("Partner event");
  await p.getByRole("button", { name: "Save", exact: true }).click();
  await close();
  await go("/tracked-links");
  await p.getByRole("button", { name: "Create link", exact: true }).click();
  await p.getByLabel("Link label", { exact: true }).fill("QA partnership link");
  await p
    .getByLabel("Channel", { exact: true })
    .last()
    .selectOption("Partner event");
  await p.getByRole("button", { name: "Save link", exact: true }).click();
  await close();
  s = await state();
  assert(
    s.links.some(
      (l) => l.label === "QA partnership link" && l.channel === "Partner event",
    ),
  );
  await go("/settings?tab=channels");
  assert(
    await p
      .getByRole("button", { name: "Delete Partner event", exact: true })
      .isDisabled(),
  );
  console.log("PASS channel/link creation and in-use deletion protection");
  await go("/account");
  await p.getByLabel("Color theme", { exact: true }).selectOption("dark");
  await p.reload();
  assert.equal(await p.locator("html").getAttribute("data-theme"), "dark");
  await p.getByLabel("Contrast", { exact: true }).selectOption("high");
  await p.waitForFunction(
    () => document.documentElement.dataset.contrast === "high",
  );
  await p.getByLabel("Contrast", { exact: true }).selectOption("standard");
  console.log("PASS persisted theme and contrast");
  await go("/jobs");
  await p.getByRole("tab", { name: /^All / }).press("ArrowRight");
  assert.equal(
    await p
      .getByRole("tab", { name: /^Published / })
      .getAttribute("aria-selected"),
    "true",
  );
  assert(
    await p
      .getByRole("tab", { name: /^Published / })
      .evaluate((el) => el === document.activeElement),
  );
  await p.getByRole("button", { name: "Design preview", exact: true }).click();
  assert(
    await p
      .getByRole("dialog", { name: "A workspace you can explore" })
      .isVisible(),
  );
  await p.keyboard.press("Escape");
  await close();
  assert.deepEqual(errors, []);
  console.log("PASS keyboard tabs, named dialog, Escape, no runtime errors");
});
