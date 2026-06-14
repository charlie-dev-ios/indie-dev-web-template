import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/** 認証が必要なパスのプレフィックス。 */
const PROTECTED_PREFIXES = ["/account"];

/**
 * リクエストごとに Supabase セッションを更新する。
 * 未認証ユーザーが保護ルートへアクセスした場合は login へリダイレクトする。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase 未設定（フォーク直後など）では認証処理をスキップし、
  // テンプレートがそのまま起動できるようにする。
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    });

    // getUser() を呼ぶことでセッションの更新（トークンのリフレッシュ）が行われる。
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    // 環境変数の値が不正な場合などに createServerClient / getUser が例外を
    // 投げると全ルートが 500 になる。サイト全体を落とさないよう、ここでは
    // 未認証として扱い、ログだけ残してリクエストを通す。
    console.error("[supabase middleware] セッション更新に失敗しました:", error);
  }

  return supabaseResponse;
}
