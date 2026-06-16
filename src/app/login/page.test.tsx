import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

vi.mock("./actions", () => ({
  signInWithGoogle: vi.fn(),
}));

describe("LoginPage", () => {
  it("見出しを表示する", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("heading", { name: "ログイン" }),
    ).toBeInTheDocument();
  });

  it("Google ログインボタンを表示する", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByRole("button", { name: "Google でログイン" }),
    ).toBeInTheDocument();
  });

  it("error クエリがない場合はエラーメッセージを表示しない", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("error クエリがある場合はエラーメッセージを表示する", async () => {
    render(
      await LoginPage({ searchParams: Promise.resolve({ error: "oauth" }) }),
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
