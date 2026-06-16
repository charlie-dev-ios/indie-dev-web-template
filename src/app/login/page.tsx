import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInWithGoogle } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.45 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-muted/40 px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle asChild className="text-2xl">
              <h1>ログイン</h1>
            </CardTitle>
            <CardDescription>
              Google アカウントで続行してください
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">ログインに失敗しました</p>
                  <p className="mt-0.5 break-all text-xs opacity-80">{error}</p>
                </div>
              </div>
            )}

            <form action={signInWithGoogle}>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                size="lg"
              >
                <GoogleIcon />
                Google でログイン
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="px-6 text-center text-xs text-muted-foreground text-balance">
          続行することで、利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </main>
  );
}
