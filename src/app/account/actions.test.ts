import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.fn();
const redirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signOut: (...args: unknown[]) => signOut(...args) },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

describe("signOut action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Supabase からサインアウトして login へリダイレクトする", async () => {
    signOut.mockResolvedValue({ error: null });
    const { signOutAction } = await import("./actions");
    await signOutAction();

    expect(signOut).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
