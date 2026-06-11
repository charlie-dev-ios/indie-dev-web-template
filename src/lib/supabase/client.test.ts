import { beforeEach, describe, expect, it, vi } from "vitest";

const createBrowserClient = vi.hoisted(() =>
  vi.fn((..._args: unknown[]) => ({ mock: "browser" })),
);

vi.mock("@supabase/ssr", () => ({ createBrowserClient }));

describe("createClient (browser)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  it("環境変数を使って createBrowserClient を呼び出す", async () => {
    const { createClient } = await import("./client");
    createClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );
  });
});
