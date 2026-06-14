import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerClient = vi.hoisted(() =>
  vi.fn((..._args: unknown[]) => ({ mock: "server" })),
);
const cookieStore = vi.hoisted(() => ({
  getAll: vi.fn(() => [{ name: "sb", value: "v" }]),
  set: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({ createServerClient }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

describe("createClient (server)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  it("環境変数と cookie ハンドラを使って createServerClient を呼び出す", async () => {
    const { createClient } = await import("./server");
    await createClient();

    expect(createServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });

  it("getAll は cookieStore.getAll を返す", async () => {
    const { createClient } = await import("./server");
    await createClient();

    const { cookies } = createServerClient.mock.calls[0][2] as {
      cookies: { getAll: () => unknown };
    };
    expect(cookies.getAll()).toEqual([{ name: "sb", value: "v" }]);
  });
});
