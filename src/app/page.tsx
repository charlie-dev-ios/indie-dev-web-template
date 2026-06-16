import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Indie Dev Web Template</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Web 個人開発用のテンプレートです。`docs/`
        配下のドキュメントを参照して開発を始めてください。
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/login" className="underline underline-offset-4">
          ログイン
        </Link>
        <Link href="/account" className="underline underline-offset-4">
          アカウント
        </Link>
        <Link href="/todos" className="underline underline-offset-4">
          TODO
        </Link>
      </div>
    </main>
  );
}
