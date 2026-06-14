import { signInWithGoogle } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Google アカウントでログインしてください。
      </p>

      {error && (
        <div role="alert" className="mt-4 text-sm text-red-600">
          <p>ログインに失敗しました。</p>
          <p className="mt-1 break-all text-xs">{error}</p>
        </div>
      )}

      <form action={signInWithGoogle} className="mt-6">
        <button
          type="submit"
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Google でログイン
        </button>
      </form>
    </main>
  );
}
