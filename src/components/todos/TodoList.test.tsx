import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Todo } from "@/lib/schemas/todo";

vi.mock("@/app/todos/actions", () => ({
  toggleTodoAction: vi.fn(),
  deleteTodoAction: vi.fn(),
}));

import { TodoList } from "./TodoList";

const baseTodo: Todo = {
  id: "1",
  user_id: "u1",
  title: "牛乳を買う",
  completed: false,
  created_at: "2026-06-16T00:00:00Z",
  updated_at: "2026-06-16T00:00:00Z",
};

describe("TodoList", () => {
  it("TODO のタイトルを表示する", () => {
    render(<TodoList todos={[baseTodo]} />);
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });

  it("TODO が無いときは空メッセージを表示する", () => {
    render(<TodoList todos={[]} />);
    expect(screen.getByText("TODO はまだありません。")).toBeInTheDocument();
  });

  it("完了済み TODO には取り消し線を付ける", () => {
    render(<TodoList todos={[{ ...baseTodo, completed: true }]} />);
    expect(screen.getByText("牛乳を買う").className).toContain("line-through");
  });

  it("削除ボタンを表示する", () => {
    render(<TodoList todos={[baseTodo]} />);
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });
});
