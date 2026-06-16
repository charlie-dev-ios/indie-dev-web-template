import { expect, test } from "@playwright/test";

test.describe("TODO", () => {
  test("トップページから TODO へのリンクを表示する", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "TODO" })).toBeVisible();
  });
});
