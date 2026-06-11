import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithOAuth = vi.fn();
const redirect = vi.fn();
const getHeader = vi.fn(() => "http://localhost:3000");

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signInWithOAuth: (...args: unknown[]) => signInWithOAuth(...args) },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({ get: getHeader })),
}));

describe("signInWithGoogle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Google プロバイダで callback URL を指定して OAuth を開始する", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.com/oauth" },
      error: null,
    });
    const { signInWithGoogle } = await import("./actions");
    await signInWithGoogle();

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
  });

  it("OAuth が返した URL へリダイレクトする", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.com/oauth" },
      error: null,
    });
    const { signInWithGoogle } = await import("./actions");
    await signInWithGoogle();

    expect(redirect).toHaveBeenCalledWith("https://accounts.google.com/oauth");
  });

  it("エラー時は login ページにエラー付きでリダイレクトする", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: { message: "boom" },
    });
    const { signInWithGoogle } = await import("./actions");
    await signInWithGoogle();

    expect(redirect).toHaveBeenCalledWith("/login?error=oauth");
  });
});
