# Supabase TODO データセットアップ

> ユーザーごとの TODO データを Supabase（Postgres + RLS）で管理するためのセットアップガイド。
> 認証（Google OAuth）のセットアップは先に [`supabase-auth.md`](./supabase-auth.md) を完了しておくこと。

実装の設計は [`architecture.md` の「ユーザーデータ（TODO）」セクション](./architecture.md#ユーザーデータtodo) を参照。

## 全体像

```
[ /todos（Server Component）]
   │ getUser でセッション確認 → todos を select
   ▼
[ TodoForm（Client）/ TodoList・TodoItem（Server）]
   │ 追加・完了トグル・削除（Server Action）
   ▼
[ Supabase: public.todos ]   ← RLS で「自分の TODO のみ」に制限
```

- データアクセスはすべて **Server Component / Server Action** 経由（Cookie セッション付きクライアント）。
- `anon` キーで接続するが、**RLS** により他ユーザーのデータには一切アクセスできない。
- 入力は `src/lib/schemas/todo.ts` の Zod スキーマで検証する。

## 1. テーブルと RLS の作成

マイグレーション SQL は [`supabase/migrations/20260616000000_create_todos.sql`](../supabase/migrations/20260616000000_create_todos.sql) に置いてある。
内容は以下のとおり。

- `public.todos` テーブル（`id` / `user_id` / `title` / `completed` / `created_at` / `updated_at`）
- `title` の長さ制約（1〜200 文字。Zod の `TODO_TITLE_MAX_LENGTH` と一致）
- `updated_at` を更新時に自動更新するトリガー
- RLS 有効化と `auth.uid() = user_id` による 4 つのポリシー（select / insert / update / delete）

### 適用方法（いずれか）

**A. ダッシュボードの SQL Editor（手軽）**

1. Supabase ダッシュボード > **SQL Editor** を開く
2. 上記マイグレーション SQL の中身を貼り付けて **Run**
3. **Authentication > Policies** で `todos` に 4 つのポリシーが付いていることを確認

**B. Supabase CLI（推奨・再現性が高い）**

```bash
# 初回のみ: ローカルプロジェクトをリモートに紐付け
bunx supabase link --project-ref <project-ref>

# supabase/migrations/ 配下の SQL をリモートへ適用
bunx supabase db push
```

> CLI を使う場合、SQL ファイルは `supabase/migrations/<timestamp>_<name>.sql` の命名で
> このリポジトリの `supabase/migrations/` に追加していくこと。

## 2. 動作確認

環境変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）は認証と共通。
未設定なら [`supabase-auth.md` の環境変数](./supabase-auth.md#1-環境変数) を参照。

```bash
bun dev
```

1. `http://localhost:3000/login` から Google でログイン
2. `http://localhost:3000/todos` を開く（未ログインだと `/login` へリダイレクトされる）
3. 入力欄から TODO を追加 → 一覧に表示される
4. チェックボタンで完了トグル、「削除」で削除できる
5. 別アカウントでログインすると、他人の TODO は見えない（RLS の確認）

## トラブルシューティング

| 症状 | 原因 / 対処 |
|------|-------------|
| TODO を追加しても一覧に出ない | RLS の **insert / select ポリシー**が未作成。マイグレーション SQL を再適用する |
| `new row violates row-level security policy` | `insert` 時に `user_id` がログインユーザーと不一致。Server Action は `auth.getUser()` の `id` を入れているため、未ログインでないか確認する |
| `relation "public.todos" does not exist` | マイグレーション未適用。手順 1 を実行する |
| 他人の TODO が見える | RLS が無効、またはポリシーの条件が `auth.uid() = user_id` になっていない。`alter table public.todos enable row level security;` を確認 |
| `/todos` が常に `/login` に飛ぶ | 未ログイン。Cookie セッションが無い状態。先に `/login` からログインする |
