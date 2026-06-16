import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function Home() {
  // Supabase 設定済みの場合のみ認証ガードを行う。
  // 未設定（テンプレートのフォーク直後など）ではそのままコンテンツを表示する。
  let isAuthenticated = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 二重ガード（middleware でも保護しているが念のため）
    if (!user) {
      redirect("/login");
    }
    isAuthenticated = true;
  }

  return (
    <main className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Indie Dev Web Template</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Web 個人開発用のテンプレートです。`docs/`
        配下のドキュメントを参照して開発を始めてください。
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {isAuthenticated ? (
          <Button asChild>
            <Link href="/account">アカウント</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">ログイン</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
