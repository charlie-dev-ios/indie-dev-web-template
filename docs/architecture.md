# アーキテクチャ

## 概要

本テンプレートは Next.js による Web フロントエンドアプリケーションのスタート地点です。
バックエンド API は別リポジトリで管理することを想定し、本リポジトリは Web (フロントエンド) のみを対象とします。

## システム構成

```
┌─────────────────┐
│   Web (Next.js) │
│     Vercel      │
└────────┬────────┘
         │
         │ HTTPS (JSON)
         ▼
┌───────────────────────┐
│   API（別リポジトリ）  │
└───────────────────────┘
```

## リポジトリ構成

本リポジトリは Web フロントエンド単体構成です。詳細なディレクトリ構造は [開発ガイド](./development.md#プロジェクト構成) を参照してください。

**主要構成：**
- `src/app/` - Next.js App Router
- `src/components/` - UI コンポーネント
- `src/lib/` - ユーティリティ・スキーマ

## アーキテクチャ上の設計決定

### フロントエンド単独リポジトリ

- **理由**: Web の開発サイクルを API・モバイルから独立させる
- **メリット**: デプロイ・依存管理がシンプル、リードタイム短縮

### Edge-First 戦略

- **デプロイ先**: Vercel（Next.js App Router）
- **メリット**: 低レイテンシ、グローバルな配信、CDN との統合

### Server Component 優先

- **理由**: バンドルサイズの削減、初期表示の高速化
- **方針**: クライアント機能が必要な箇所のみ `'use client'` を付与

### 認証（Supabase Auth）

- **方式**: Supabase Auth（Google OAuth）を `@supabase/ssr` で SSR 統合
- **セッション管理**: Cookie ベース。`middleware.ts` が全リクエストでセッションを更新し、保護ルート（`/account`）への未認証アクセスを `/login` へリダイレクトする
- **クライアント生成**:
  - `src/lib/supabase/client.ts` — ブラウザ（Client Component）用
  - `src/lib/supabase/server.ts` — サーバー（Server Component / Route Handler / Server Action）用
  - `src/lib/supabase/middleware.ts` — middleware 用（セッション更新 + 保護ルート制御）
- **OAuth フロー**:
  1. `/login` の Server Action `signInWithGoogle` が `signInWithOAuth` を呼び、Google の認可 URL へリダイレクト
  2. 認可後、`/auth/callback` の Route Handler が認可コードをセッションに交換
  3. `/account` でユーザー情報を表示、`signOutAction` でサインアウト
- **未設定時の挙動**: Supabase の環境変数が未設定の場合、middleware は認証処理をスキップする（フォーク直後でもテンプレートが起動できるようにするため）
- **設計判断**: ユーザーデータは Supabase の `auth.users`（セッション情報）のみを扱い、追加の `profiles` テーブルは設けない（YAGNI）。プロフィール拡張が必要になった時点でテーブルと RLS を追加する
- **セットアップ手順**: [`supabase-auth.md`](./supabase-auth.md) を参照（ローカル / Preview / 本番 の設定とトラブルシューティング）

## 通信フロー

```
[Browser]
    │
    │ HTTPS
    ▼
[Vercel - Next.js]
    │
    │ Server Component / Route Handler
    │ - リクエストバリデーション (Zod)
    │ - 認証トークンの付与
    ▼
[External API]
```
