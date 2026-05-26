# CLAUDE.md

このリポジトリで作業する Claude Code 向けの導線ファイル。

## 一次情報源

実装規約・コミット規約・テスト規約・技術スタック・開発コマンドはすべて以下に集約されている。作業前に必ず参照すること。

- [`docs/development.md`](./docs/development.md) — 開発原則（TDD 必須・AI-First・Simplicity / YAGNI）、技術スタック、コーディング規約、Git 規約、テスト戦略、開発コマンド
- [`docs/architecture.md`](./docs/architecture.md) — システム構成・設計決定

本ファイルと一次情報源に齟齬がある場合は **一次情報源を優先** する。

## よく使うコマンド

```bash
bun install            # 依存インストール
bun dev                # 開発サーバー（http://localhost:3000）
bun run test           # Vitest + カバレッジ
bun check              # Biome（format + lint チェック、CI と同じ）
bun fix                # Biome 自動修正（format + lint）
```

## 作業時の前提

- **TDD 必須**: 実装より先にテストを書く。`bun run test` が落ちる状態から始めて、通す最小実装 → リファレクタリング
- **品質ゲート**: コミット前に `bun run test` と `bun check` の両方をパスさせる。`--no-verify` で回避しない
- **コミットメッセージ**: Conventional Commits・日本語。Co-Authored-By 等の Claude 由来フッターは付けない（詳細は `docs/development.md` の Git 規約）
- **Server Component 優先**: クライアント機能が必要な箇所のみ `'use client'`
- **テストファイル配置**: 実装と同階層に `*.test.ts(x)`
