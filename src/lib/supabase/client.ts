import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ（Client Component）用の Supabase クライアントを生成する。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
