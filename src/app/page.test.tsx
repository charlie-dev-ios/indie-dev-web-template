import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const getUser = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());
const isSupabaseConfigured = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
  isSupabaseConfigured,
}));

vi.mock("next/navigation", () => ({ redirect }));

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("テンプレートのタイトルを表示する", async () => {
    isSupabaseConfigured.mockReturnValue(false);
    render(await Home());
    expect(
      screen.getByRole("heading", { name: "Indie Dev Web Template" }),
    ).toBeInTheDocument();
  });

  it("Supabase 未設定ならログインリンクを表示する", async () => {
    isSupabaseConfigured.mockReturnValue(false);
    render(await Home());
    expect(screen.getByRole("link", { name: "ログイン" })).toBeInTheDocument();
  });

  it("ログイン済みならログインリンクを出さずアカウントリンクを表示する", async () => {
    isSupabaseConfigured.mockReturnValue(true);
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    render(await Home());

    expect(
      screen.queryByRole("link", { name: "ログイン" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "アカウント" }),
    ).toBeInTheDocument();
  });

  it("未ログインなら login へリダイレクトする", async () => {
    isSupabaseConfigured.mockReturnValue(true);
    getUser.mockResolvedValue({ data: { user: null } });
    await Home();

    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
