import { expect, test } from "@playwright/test";

test.describe("認証", () => {
  test("ログインページに Google ログインボタンを表示する", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Google でログイン" }),
    ).toBeVisible();
  });

  test("トップページからログインページへ遷移できる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "ログイン" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
