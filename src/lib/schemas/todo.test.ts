import { describe, expect, it } from "vitest";
import { createTodoSchema, TODO_TITLE_MAX_LENGTH } from "./todo";

describe("createTodoSchema", () => {
  it("有効なタイトルを受け入れ、前後の空白を除去する", () => {
    const result = createTodoSchema.safeParse({ title: "  牛乳を買う  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("牛乳を買う");
    }
  });

  it("空のタイトルを拒否する", () => {
    const result = createTodoSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("空白のみのタイトルを拒否する", () => {
    const result = createTodoSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("最大文字数を超えるタイトルを拒否する", () => {
    const result = createTodoSchema.safeParse({
      title: "a".repeat(TODO_TITLE_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("文字列以外のタイトルを拒否する", () => {
    const result = createTodoSchema.safeParse({ title: 123 });
    expect(result.success).toBe(false);
  });
});
