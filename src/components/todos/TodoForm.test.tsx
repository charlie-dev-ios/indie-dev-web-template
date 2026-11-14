import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/todos/actions", () => ({
  createTodoAction: vi.fn(async () => ({})),
}));

import { TodoForm } from "./TodoForm";

describe("TodoForm", () => {
  it("入力欄と追加ボタンを表示する", () => {
    render(<TodoForm />);
    expect(screen.getByLabelText("TODO のタイトル")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });
});
