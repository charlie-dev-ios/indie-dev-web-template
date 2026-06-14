import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "./actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 二重ガード（middleware でも保護しているが念のため）
  if (!user) {
    redirect("/login");
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email;

  return (
    <main className="container mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">アカウント</h1>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">名前</dt>
          <dd className="font-medium">{name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">メールアドレス</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">ユーザー ID</dt>
          <dd className="font-mono text-xs">{user.id}</dd>
        </div>
      </dl>

      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          ログアウト
        </button>
      </form>
    </main>
  );
}
