# Supabase 認証セットアップ

> Google OAuth による認証（`@supabase/ssr` の SSR 統合）のセットアップガイド。
> ローカル / Vercel Preview / 本番 の 3 環境で動かす手順をまとめる。

実装の設計は [`architecture.md` の認証セクション](./architecture.md#認証supabase-auth) を参照。

## 認証フロー

```
[アプリ /login]
   │ signInWithGoogle（Server Action）
   ▼
[Supabase /auth/v1/authorize]
   │
   ▼
[Google ログイン / 同意]
   │
   ▼
[Supabase /auth/v1/callback]      ← Google にはこの URL を登録する（固定）
   │ redirect_to = <アクセス中のドメイン>/auth/callback
   ▼
[アプリ /auth/callback]            ← Supabase にはこの URL を許可登録する（環境ごと）
   │ exchangeCodeForSession
   ▼
[アプリ /account（ログイン完了）]
```

ポイント:

- **Google に登録するリダイレクト URI は Supabase 宛**（`https://<project-ref>.supabase.co/auth/v1/callback`）。1 回設定すれば、ローカル / Preview / 本番のどれでも共通で変更不要。
- **Supabase に許可登録する Redirect URL はアプリ宛**（`<ドメイン>/auth/callback`）。環境ごとに追加する。
- `redirectTo` はアクセス中のドメイン（リクエストの `origin`）から自動生成されるため、アプリ側のコード変更は不要。

---

## 0. 一度だけ行う設定

### Google Cloud（OAuth クライアント）

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. **Google Auth Platform**（旧 OAuth 同意画面）のウィザードを完了
   - 対象（Audience）: **External（外部）**
   - テスト中は **テストユーザー**にログイン用 Google アカウントを追加
3. **Clients（クライアント）** で OAuth クライアント ID を作成
   - 種類: **ウェブ アプリケーション**
   - 承認済みのリダイレクト URI:
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     ```
4. 発行された **Client ID / Client Secret** を控える

### Supabase（Google プロバイダ有効化）

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. **Authentication > Providers > Google** を有効化し、上の Client ID / Secret を登録
   - この画面に表示される「Callback URL」が、Google Cloud に登録する URI と一致していること

---

## 1. 環境変数

| 変数 | 値の取得元 |
|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の API URL（`https://<project-ref>.supabase.co`） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の API Keys の **anon / publishable** キー |

> どちらもブラウザに公開される値。`anon` キーの権限は RLS（Row Level Security）で制限される。
> **`service_role`（secret）キーは絶対に使用・公開しない**（RLS を無視して全データ操作できるため）。

### ローカル

プロジェクト直下の `.env.local` に記載（`.env.local.example` をコピーして作成）:

```bash
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### Vercel

Settings > Environment Variables に上記 2 つを登録。

- **Production / Preview / Development すべて**にチェックを入れる
  （Production だけだと Preview デプロイにキーが渡らず「No API key found」になる）
- `NEXT_PUBLIC_` 変数はブラウザに公開されるため、**Sensitive はオフ**にする
- 値の前後に**空白・改行を入れない**、末尾に `/` やパスを付けない

> ⚠️ 環境変数はデプロイ時に取り込まれる。追加・変更したら **Redeploy** が必要。

---

## 2. Supabase の Redirect URLs

Supabase > Authentication > **URL Configuration** で設定する。

- **Site URL**: 本番ドメイン（例: `https://<app>.vercel.app`）
- **Redirect URLs**: 3 環境分をまとめて許可（`*` は `.`/`/` 以外の任意文字、`**` はパス全体にマッチ）

```
https://<app>.vercel.app/**
https://<project>-*.vercel.app/**
http://localhost:3000/**
```

| 行 | 用途 |
|----|------|
| 1 行目 | 本番 |
| 2 行目 | Vercel Preview（毎回 URL が変わるためワイルドカード） |
| 3 行目 | ローカル（`PORT` を変えた場合はその番号に合わせる） |

---

## 3. 動作確認

### ローカル

```bash
bun dev          # .env.local 変更後は再起動（起動時のみ読込）
```

`http://localhost:3000/login` → 「Google でログイン」→ `/account` にユーザー情報が出れば成功。

### Vercel（Production / Preview）

環境変数を設定・変更したら **Deployments > Redeploy**。対象 URL の `/login` から確認。

---

## トラブルシューティング

| 症状 | 原因 / 対処 |
|------|-------------|
| `No API key found in request` | apikey が空。`NEXT_PUBLIC_SUPABASE_URL` の値に空白/改行が混入してリダイレクト先パスが落ちている、または対象環境（Preview など）に環境変数が渡っていない |
| `Invalid API key` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` の値が誤り。URL とキーが**別プロジェクト**、コピー途中で切れている、またはレガシーキー無効化時に `eyJ...` を使っている（`sb_publishable_...` を使う） |
| Google の `redirect_uri_mismatch` | Google Cloud のリダイレクト URI が `https://<project-ref>.supabase.co/auth/v1/callback` と完全一致していない |
| Google で「アクセスをブロックしました／確認されていません」 | Google Auth Platform の **対象（Audience）→ テストユーザー**に自分のアカウント未追加 |
| `/login` にエラー付きで戻る（赤字でメッセージ表示） | 多くは Supabase の **Redirect URLs** に該当ドメインの `/auth/callback` が未登録。赤字の文言で原因を特定する |
| 環境変数を直したのに変わらない | **Redeploy** していない（Vercel）／ dev サーバーを再起動していない（ローカル） |
| Preview だけログインできない | 環境変数が Production のみ → Preview にも適用。Redirect URLs に Preview のワイルドカード未登録。Preview の Deployment Protection が戻りをブロックしている |
