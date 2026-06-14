import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth プロバイダからのコールバックを受け取り、
 * 認可コードをセッションに交換する Route Handler。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // OAuth プロバイダ / Supabase からエラーが返ってきた場合はそのまま表示する。
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) {
    return redirectToLogin(origin, providerError);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return redirectToLogin(origin, error.message);
  }

  return redirectToLogin(origin, "認可コードがありません");
}

function redirectToLogin(origin: string, message: string) {
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(message)}`,
  );
}
