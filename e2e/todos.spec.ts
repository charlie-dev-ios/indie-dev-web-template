import { expect, test } from "@playwright/test";

test.describe("TODO", () => {
  test("未認証で /todos にアクセスするとログインページへリダイレクトする", async ({
    page,
  }) => {
    await page.goto("/todos");
    await expect(page).toHaveURL(/\/login/);
  });
});
