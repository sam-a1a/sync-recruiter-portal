import { test, expect } from "@playwright/test";

for (const width of [1440, 393]) {
  test(`CV sections expose flags, equal language badges and keyboard tabs at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/candidates/c10?from=a10&tab=profile");
    await page.getByRole("button", { name: "View CV", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "About", exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Languages", exact: true }),
    ).not.toBeVisible();
    await dialog
      .getByRole("tab", { name: "Overview", exact: true })
      .press("ArrowRight");
    await expect(
      dialog.getByRole("tab", { name: "Experience", exact: true }),
    ).toBeFocused();
    await expect(
      dialog.locator(".experience-entry .section-icon"),
    ).toBeVisible();
    await dialog.getByRole("tab", { name: "Languages", exact: true }).click();
    const flags = dialog.locator(".language-flag");
    expect(await flags.count()).toBeGreaterThan(0);
    await expect
      .poll(() =>
        flags.evaluateAll((imgs) =>
          imgs.every((i) => i.complete && i.naturalWidth > 0),
        ),
      )
      .toBe(true);
    for (const selector of [".language-tag", ".language-row .badge"]) {
      const widths = await dialog
        .locator(selector)
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getBoundingClientRect().width),
        );
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
    }
    expect(
      await dialog
        .locator(".md-dialog__panel")
        .evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(false);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(/from=a10&tab=profile/);
  });
}

test("catalogue pickers search endonyms, prevent duplicates and persist screening choices", async ({
  page,
}) => {
  await page.goto("/jobs/new");
  await page
    .getByLabel("Job title", { exact: true })
    .fill("Catalogue screening role");
  await page.getByLabel("Closing date", { exact: true }).fill("2026-12-15");
  await page
    .getByRole("textbox", { name: "Job description", exact: true })
    .fill("Support community teams.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Add skill", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByRole("searchbox").fill("Excel");
  await dialog.getByRole("button", { name: "Excel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Skill 1: Excel", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add skill", exact: true }).click();
  await dialog.getByRole("searchbox").fill("Excel");
  await expect(
    dialog.getByRole("button", { name: "Excel", exact: true }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Add language", exact: true }).click();
  await dialog.getByRole("searchbox").fill("Español");
  await dialog
    .getByRole("button", { name: "Spanish Español", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Skill 1: Excel", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Language 1: Spanish", exact: true }),
  ).toBeVisible();
  const flag = page.locator(".catalogue-field .language-flag");
  await expect
    .poll(() => flag.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);
});

test("channel websites resolve brand logos and persist through rename", async ({
  page,
}) => {
  await page.goto("/settings?tab=channels");
  await page.getByRole("button", { name: "Add channel", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Professional network");
  await page
    .getByLabel("Channel website (optional)", { exact: true })
    .fill("linkedin.com");
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("Logo from thesvg.org", { exact: true }),
  ).toBeVisible();
  await expect(dialog.locator(".brand-icon")).toHaveAttribute(
    "src",
    /linkedin/,
  );
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await expect(
    page
      .locator(".simple-row")
      .filter({ hasText: "Professional network" })
      .locator(".brand-icon"),
  ).toHaveAttribute("src", /linkedin/);
  await page
    .getByRole("button", { name: "Rename Professional network", exact: true })
    .click();
  await page.getByLabel("Name", { exact: true }).fill("Professional community");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const logos = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("sync-recruiter-preview-v1"))
        .channelLogos,
  );
  expect(logos["Professional network"]).toBeUndefined();
  expect(logos["Professional community"].slug).toBe("linkedin");
});

test("team columns, collection badges and hover labels keep stable geometry", async ({
  page,
}) => {
  await page.goto("/settings");
  for (const selector of [".team-role", ".team-row > .badge"]) {
    const xs = await page
      .locator(selector)
      .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().x));
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(1);
  }
  const before = await page
    .locator(".team-row > .actions")
    .first()
    .boundingBox();
  await page.evaluate(() => {
    const key = "sync-recruiter-preview-v1";
    const s = JSON.parse(localStorage.getItem(key));
    s.team.forEach((m) => (m.status = "Active"));
    localStorage.setItem(key, JSON.stringify(s));
  });
  await page.reload();
  await expect(page.locator(".reminder-space")).toHaveCount(0);
  const after = await page
    .locator(".team-row > .actions")
    .first()
    .boundingBox();
  expect(before.width - after.width).toBeGreaterThan(40);
  for (const [route, selector] of [
    ["/tracked-links", ".channel-badge"],
    ["/placements", 'td[data-label="Confirmation"] .badge'],
  ]) {
    await page.goto(route);
    const widths = await page
      .locator(selector)
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getBoundingClientRect().width),
      );
    expect(widths.length).toBeGreaterThan(1);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  }
  await page.goto("/tracked-links");
  await page.evaluate(() => document.fonts.ready);
  const link = page.locator(".link-name .text-link").first();
  const original = await link.boundingBox();
  await link.hover();
  await page.waitForTimeout(400);
  const hovered = await link.boundingBox();
  expect(Math.abs(hovered.width - original.width)).toBeLessThan(1);
  await page.goto("/templates");
  const checkbox = page.getByRole("checkbox", {
    name: "Show sample values",
    exact: true,
  });
  expect((await checkbox.boundingBox()).height).toBeGreaterThanOrEqual(48);
  await checkbox.check();
  await expect(checkbox).toBeChecked();
});
