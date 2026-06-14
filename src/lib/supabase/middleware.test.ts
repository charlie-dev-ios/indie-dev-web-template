import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.hoisted(() => vi.fn());
const nextResponse = vi.hoisted(() => ({
  type: "next",
  cookies: { set: vi.fn() },
}));
const redirectResponse = vi.hoisted(() => ({ type: "redirect" }));
const nextFn = vi.hoisted(() => vi.fn((..._args: unknown[]) => nextResponse));
const redirectFn = vi.hoisted(() =>
  vi.fn((..._args: unknown[]) => redirectResponse),
);

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser } })),
}));

vi.mock("next/server", () => ({
  NextResponse: { next: nextFn, redirect: redirectFn },
}));

function makeRequest(pathname: string) {
  const url = { pathname, clone: () => ({ pathname }) };
  return {
    cookies: { getAll: () => [], set: vi.fn() },
    nextUrl: { ...url, clone: () => ({ pathname }) },
  } as unknown as Parameters<typeof import("./middleware").updateSession>[0];
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  it("未認証で保護ルートにアクセスすると login へリダイレクトする", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import("./middleware");
    const res = await updateSession(makeRequest("/account"));

    expect(redirectFn).toHaveBeenCalled();
    expect(res).toBe(redirectResponse);
  });

  it("認証済みなら保護ルートでもそのまま通す", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const { updateSession } = await import("./middleware");
    const res = await updateSession(makeRequest("/account"));

    expect(redirectFn).not.toHaveBeenCalled();
    expect(res).toBe(nextResponse);
  });

  it("非保護ルートは未認証でもそのまま通す", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import("./middleware");
    const res = await updateSession(makeRequest("/"));

    expect(redirectFn).not.toHaveBeenCalled();
    expect(res).toBe(nextResponse);
  });

  it("Supabase 環境変数が未設定なら認証処理をスキップしてそのまま通す", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { updateSession } = await import("./middleware");
    const res = await updateSession(makeRequest("/account"));

    expect(getUser).not.toHaveBeenCalled();
    expect(redirectFn).not.toHaveBeenCalled();
    expect(res).toBe(nextResponse);
  });

  it("getUser が例外を投げても throw せずそのまま通す", async () => {
    getUser.mockRejectedValue(new Error("boom"));
    const { updateSession } = await import("./middleware");
    const res = await updateSession(makeRequest("/"));

    expect(res).toBe(nextResponse);
  });
});
