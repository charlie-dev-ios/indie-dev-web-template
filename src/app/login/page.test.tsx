import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const getUser = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());
const isSupabaseConfigured = vi.hoisted(() => vi.fn(() => false));

vi.mock("./actions", () => ({
  signInWithGoogle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
  isSupabaseConfigured,
}));

vi.mock("next/navigation", () => ({ redirect }));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSupabaseConfigured.mockReturnValue(false);
  });

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

  it("ログイン済みならトップ画面へリダイレクトする", async () => {
    isSupabaseConfigured.mockReturnValue(true);
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    await LoginPage({ searchParams: Promise.resolve({}) });

    expect(redirect).toHaveBeenCalledWith("/");
  });
});
