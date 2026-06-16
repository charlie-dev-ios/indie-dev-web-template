import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase の環境変数が設定されているかを判定する。
 * 未設定（テンプレートのフォーク直後など）では認証処理をスキップし、
 * アプリがそのまま起動できるようにするためのガードに使う。
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * サーバー（Server Component / Route Handler / Server Action）用の
 * Supabase クライアントを生成する。Cookie 経由でセッションを読み書きする。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Component から呼ばれた場合 set は失敗するため握りつぶす。
          // セッション更新は middleware 側で行われるため問題ない。
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // noop
          }
        },
      },
    },
  );
}
