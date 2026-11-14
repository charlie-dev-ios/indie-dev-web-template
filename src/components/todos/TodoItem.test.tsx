import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Todo } from "@/lib/schemas/todo";

vi.mock("@/app/todos/actions", () => ({
  toggleTodoAction: vi.fn(),
  deleteTodoAction: vi.fn(),
}));

import { TodoItem } from "./TodoItem";

const baseTodo: Todo = {
  id: "1",
  user_id: "u1",
  title: "牛乳を買う",
  completed: false,
  created_at: "2026-06-16T00:00:00Z",
  updated_at: "2026-06-16T00:00:00Z",
};

describe("TodoItem", () => {
  it("未完了の TODO には「完了にする」トグルを表示する", () => {
    render(<TodoItem todo={baseTodo} />);
    const toggle = screen.getByRole("button", { name: "完了にする" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("完了済みの TODO には「未完了に戻す」トグルを表示する", () => {
    render(<TodoItem todo={{ ...baseTodo, completed: true }} />);
    const toggle = screen.getByRole("button", { name: "未完了に戻す" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("操作対象を識別する id / completed を hidden input に持つ", () => {
    const { container } = render(<TodoItem todo={baseTodo} />);
    expect(container.querySelector('input[name="id"]')).toHaveValue("1");
    expect(container.querySelector('input[name="completed"]')).toHaveValue(
      "false",
    );
  });
});
