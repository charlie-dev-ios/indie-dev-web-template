import { expect, test } from "@playwright/test";

test.describe("Home", () => {
  test("テンプレートのタイトルを表示する", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Indie Dev Web Template" }),
    ).toBeVisible();
  });
});
