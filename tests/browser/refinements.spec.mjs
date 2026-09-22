import { test, expect } from "@playwright/test";

for (const width of [1440, 393]) {
  test(`record layout preferences and selection survive view changes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/jobs",
      "/candidates",
      "/talent-pool",
      "/applications",
      "/placements",
      "/tracked-links",
    ]) {
      await page.goto(route);
      const rows = page.getByRole("button", { name: "Rows", exact: true });
      const cards = page.getByRole("button", { name: "Cards", exact: true });
      await rows.click();
      await expect(rows).toHaveAttribute("aria-pressed", "true");
      await page.reload();
      await expect(rows).toHaveAttribute("aria-pressed", "true");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        route,
      ).toBe(false);
      await cards.click();
      await expect(cards).toHaveAttribute("aria-pressed", "true");
      await page.reload();
      await expect(cards).toHaveAttribute("aria-pressed", "true");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        route,
      ).toBe(false);
    }
    await page.goto("/applications?stage=New&screening=Qualified");
    const tick = page.getByRole("checkbox", {
      name: "Select Maya Khalil",
      exact: true,
    });
    const bounds = await tick.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(48);
    expect(bounds.height).toBeGreaterThanOrEqual(48);
    await tick.check();
    await page.getByRole("button", { name: "Rows", exact: true }).click();
    await expect(tick).toBeChecked();
    await expect(page).toHaveURL(/stage=New&screening=Qualified/);
    await tick.focus();
    await page.keyboard.press("Space");
    await expect(tick).not.toBeChecked();
  });
}

test("detail sections support links, keyboard navigation and unsent drafts", async ({
  page,
}) => {
  await page.goto("/applications/a1");
  await expect(
    page.getByRole("heading", { name: "Hiring pipeline", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Team notes", exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("tab", { name: "Overview", exact: true })
    .press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Profile", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Profile at application", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Profile", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Notes & tags", exact: true }).click();
  await page.getByLabel("Add a note", { exact: true }).fill("Unsent team note");
  await page.getByRole("tab", { name: "Messages", exact: true }).click();
  await page.getByLabel("Subject", { exact: true }).fill("Unsent subject");
  await page.getByRole("tab", { name: "Notes & tags", exact: true }).click();
  await expect(page.getByLabel("Add a note", { exact: true })).toHaveValue(
    "Unsent team note",
  );
  await page.getByRole("tab", { name: "Messages", exact: true }).click();
  await expect(page.getByLabel("Subject", { exact: true })).toHaveValue(
    "Unsent subject",
  );
  await page.goto("/candidates/c1?from=a1&tab=notes");
  await expect(
    page.getByRole("tab", { name: "Notes & tags", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByLabel("Add a note", { exact: true })
    .fill("Unsent candidate note");
  await page.getByRole("tab", { name: "Placements", exact: true }).click();
  await expect(page).toHaveURL(/from=a1&tab=placements/);
  await page.getByRole("tab", { name: "Notes & tags", exact: true }).click();
  await expect(page.getByLabel("Add a note", { exact: true })).toHaveValue(
    "Unsent candidate note",
  );
  await page
    .getByRole("link", { name: "Back to application", exact: true })
    .click();
  await expect(page).toHaveURL(/\/applications\/a1$/);
});

test("rich text formats survive draft reload, publishing, editing and public reading", async ({
  page,
}) => {
  await page.goto("/jobs/new");
  await page
    .getByLabel("Job title", { exact: true })
    .fill("Rich text opportunity");
  await page.getByLabel("Closing date", { exact: true }).fill("2026-12-15");
  const editor = page.getByRole("textbox", {
    name: "Job description",
    exact: true,
  });
  await editor.fill("Community leadership");
  await editor.press("ControlOrMeta+A");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await page.getByRole("button", { name: "Italic", exact: true }).click();
  await expect(editor.locator("strong em, em strong")).toHaveText(
    "Community leadership",
  );
  for (const [label, tag] of [
    ["Heading 1", "h2"],
    ["Heading 2", "h3"],
    ["Heading 3", "h4"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(editor.locator(tag)).toHaveText("Community leadership");
    await expect(
      page.getByRole("button", { name: label, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "Heading 3", exact: true }).click();
  await page
    .getByRole("button", { name: "Bulleted list", exact: true })
    .click();
  await expect(editor.locator("ul li")).toHaveText("Community leadership");
  await page
    .getByRole("button", { name: "Numbered list", exact: true })
    .click();
  await expect(editor.locator("ol li")).toHaveText("Community leadership");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor.locator("ul li")).toHaveText("Community leadership");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(editor.locator("ol li")).toHaveText("Community leadership");
  await page.reload();
  await expect(editor.locator("ol li strong em, ol li em strong")).toHaveText(
    "Community leadership",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.locator(".rich-text ol li strong em, .rich-text ol li em strong"),
  ).toHaveText("Community leadership");
  await page.getByRole("button", { name: "Publish job", exact: true }).click();
  await expect(page.locator(".rich-text ol li")).toHaveText(
    "Community leadership",
  );
  const id = new URL(page.url()).pathname.split("/").at(-1);
  await page.getByRole("button", { name: "Edit job", exact: true }).click();
  await expect(editor.locator("ol li")).toHaveText("Community leadership");
  await page.goto(`/welcome?job=${id}`);
  await expect(page.locator(".rich-text ol li")).toHaveText(
    "Community leadership",
  );
});
