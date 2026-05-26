# Indie Dev Web Template

> Web 個人開発のためのテンプレートリポジトリ

Next.js (App Router) + React Compiler + TypeScript + Tailwind CSS v4 + Biome + Bun + Vitest を採用した、Web 個人開発のスタート地点となるテンプレートです。

## ドキュメント

- **[開発ガイド](./docs/development.md)** - 開発原則、技術スタック、コーディング規約、Git 規約、テスト戦略、開発コマンド
- **[アーキテクチャ](./docs/architecture.md)** - システム設計、構成図、設計決定

## クイックスタート

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動（http://localhost:3000）
bun dev

# テスト・静的解析
bun run test
bun check
```

## このテンプレートから新しいプロジェクトを始める

1. このリポジトリを clone もしくは "Use this template" で複製
2. `package.json` の `name` を新プロジェクト名に変更
3. `src/app/layout.tsx` の `metadata` を更新
4. `README.md` / `docs/` のテンプレ記述をプロジェクト固有内容に書き換え
5. `.env.local.example` を `.env.local` にコピーして必要な値を設定
