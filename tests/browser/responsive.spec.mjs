import { test, expect } from "@playwright/test";

for (const width of [320, 393, 768, 1440]) {
  test(`key pages fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.emulateMedia({
      reducedMotion: "reduce",
      colorScheme: width === 393 ? "dark" : "light",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of [
      "/dashboard",
      "/jobs",
      "/jobs/new",
      "/applications",
      "/applications/a1",
      "/candidates",
      "/templates",
      "/settings",
      "/welcome",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow, path).toBe(false);
    }
    if (width < 700) {
      await page.goto("/candidates");
      const filters = page.getByRole("button", { name: /Filter candidates/ });
      await expect(filters).toHaveAttribute("aria-expanded", "false");
      await filters.click();
      await page
        .getByLabel("Role", { exact: true })
        .selectOption("Communications");
      await page
        .getByRole("button", { name: "Find candidates", exact: true })
        .click();
      await expect(page.locator(".candidate-card")).toHaveCount(1);
      await expect(filters).toHaveAttribute("aria-expanded", "false");
      await page
        .getByRole("button", { name: "More destinations", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "Templates", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Message templates", exact: true }),
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}
