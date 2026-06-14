import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: (...args: unknown[]) =>
        exchangeCodeForSession(...args),
    },
  })),
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("code をセッションに交換し next へリダイレクトする", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/auth/callback?code=abc&next=/account"),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/account");
  });

  it("next 未指定ならルートへリダイレクトする", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/auth/callback?code=abc"),
    );

    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("code が無い場合は login へエラー付きでリダイレクトする", async () => {
    const { GET } = await import("./route");
    const res = await GET(new Request("http://localhost:3000/auth/callback"));

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe(
      `http://localhost:3000/login?error=${encodeURIComponent("認可コードがありません")}`,
    );
  });

  it("交換に失敗したらエラーメッセージ付きで login へリダイレクトする", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "bad" } });
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/auth/callback?code=bad"),
    );

    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?error=bad",
    );
  });

  it("プロバイダのエラーをそのまま login へ渡す", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      new Request(
        "http://localhost:3000/auth/callback?error=access_denied&error_description=Database+error",
      ),
    );

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe(
      `http://localhost:3000/login?error=${encodeURIComponent("Database error")}`,
    );
  });
});
