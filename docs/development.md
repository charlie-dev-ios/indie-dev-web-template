# 開発ガイド

> Web 個人開発テンプレートの開発詳細ガイド

このドキュメントには、技術スタック、コーディング規約、Git 規約、テスト戦略など、開発に必要な詳細情報を集約しています。

## 目次

- [開発原則](#開発原則)
- [技術スタック](#技術スタック)
- [プロジェクト構成](#プロジェクト構成)
- [コーディング規約](#コーディング規約)
- [テスト戦略](#テスト戦略)
- [Git規約](#git規約)
- [開発コマンド](#開発コマンド)
- [環境情報](#環境情報)

---

## 開発原則

以下は **NON-NEGOTIABLE** な開発原則。すべての作業はこの 3 原則に従う。

### I. Test-Driven Development

- **Red-Green-Refactor サイクルを厳守**
- すべての機能追加・変更はテストから開始
- テストなしのコードマージは禁止

### II. AI-First Development

- エージェントが自律的に開発できる環境を優先
- 明確で機械可読なドキュメント構造

### III. Simplicity

- YAGNI（You Aren't Gonna Need It）原則を遵守
- 必要になるまで複雑さを追加しない
- 明確な理由なく抽象化しない

---

## 技術スタック

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| フレームワーク | Next.js | 16.x |
| UI Library | React | 19.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| UI コンポーネント | shadcn/ui | - |
| テスト | Vitest | 4.x |
| バリデーション | Zod | 4.x |
| アイコン | lucide-react | - |
| 認証 / BaaS | Supabase（@supabase/ssr） | - |
| デプロイ | Vercel | - |

### 開発ツール

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| パッケージマネージャー | Bun | 1.x |
| Linter/Formatter | Biome | 2.x |

---

## プロジェクト構成

### ディレクトリ構造

```
indie-dev-web-template/
├── src/
│   ├── app/                 # App Router
│   │   └── api/             # Route Handlers
│   ├── components/          # UI コンポーネント
│   │   ├── ui/              # shadcn/ui コンポーネント
│   │   ├── navigation/      # ナビゲーション
│   │   └── common/          # 共通コンポーネント
│   ├── content/             # Markdown コンテンツ
│   ├── hooks/               # カスタムフック
│   ├── lib/                 # ユーティリティ
│   │   ├── utils/           # 汎用関数
│   │   └── schemas/         # Zod スキーマ
│   └── stores/              # 状態管理
├── public/                  # 静的アセット
│
├── docs/                    # ドキュメント
│   ├── development.md       # 開発ガイド（開発原則 / 規約 / 本ファイル）
│   └── architecture.md      # アーキテクチャ設計
│
├── e2e/                     # E2E テスト（Playwright）
├── .claude/                 # Claude Code 設定
│
├── README.md                # プロジェクト概要
└── package.json
```

---

## コーディング規約

### TypeScript

#### 基本方針

- **全レイヤーで TypeScript を使用**
- **型安全性を最大限活用**
- **`any` 型の使用は原則禁止**（どうしても必要な場合はコメントで理由を説明）
- **strict mode 有効**

#### 型定義

```typescript
// ✅ Good: 明示的な型定義
interface UserProps {
  id: string;
  name: string;
}

// ❌ Bad: any 型の使用
function getData(params: any) { ... }

// ✅ Good: 適切な型定義
function getData(params: { id: string; filter?: string }) { ... }
```

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `UserCard.tsx` |
| 関数 | camelCase | `getUserList()` |
| 定数 | UPPER_SNAKE_CASE | `MAX_ITEM_COUNT` |
| 型・インターフェース | PascalCase | `UserType`, `UserData` |
| ファイル名（コンポーネント） | PascalCase | `UserCard.tsx` |
| ファイル名（その他） | kebab-case | `use-user.ts` |

### コンポーネント設計

#### Server Component 優先

- **デフォルトは Server Component**
- クライアント機能（useState、useEffect など）が必要な場合のみ `'use client'` を使用

```typescript
// ✅ Good: Server Component（デフォルト）
export default function UserList() {
  const users = await getUserList();
  return <div>...</div>;
}

// ✅ Good: Client Component が必要な場合のみ
'use client';
export default function InteractiveUserCard() {
  const [selected, setSelected] = useState(false);
  return <div onClick={() => setSelected(!selected)}>...</div>;
}
```

#### Props 型定義

- すべての Props に型を明示

```typescript
interface UserCardProps {
  user: User;
  onSelect?: (id: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return <div>...</div>;
}
```

#### コンポーネント分割

- **Single Responsibility Principle（単一責任の原則）**
- 200 行を超えるコンポーネントは分割を検討
- 再利用可能な部分は独立したコンポーネントに

### ファイル構成

```typescript
import { ... } from '...'   // 外部ライブラリ
import { ... } from '@/...' // プロジェクト内

// 型定義
interface Props { ... }

// コンポーネント
export function Component({ ... }: Props) {
  // hooks
  // handlers
  // render
}

// ヘルパー関数（コンポーネント外）
function helperFunction() { ... }
```

---

## テスト戦略

### TDD（Test-Driven Development）- 必須

本プロジェクトでは **TDD が必須**（[開発原則](#開発原則) 参照）。

#### Red-Green-Refactor サイクル

1. **Red**: テストを先に書く（失敗する）
2. **Green**: テストが通る最小限の実装
3. **Refactor**: コードをリファクタリング

### テストの種類

| テスト種類 | ツール | 目的 | 配置 |
|----------|--------|------|------|
| Unit Test | Vitest + Testing Library | 個別関数・コンポーネントのテスト | `src/**/*.test.ts(x)`（実装と同階層） |
| Integration Test | Vitest + Testing Library | 複数コンポーネントの統合テスト | `src/**/*.test.ts(x)`（同上） |
| E2E Test | Playwright | ブラウザでのエンドツーエンド検証 | `e2e/**/*.spec.ts` |

### テストファイル配置

#### Unit / Integration（Vitest）

- **テストファイルは実装ファイルと同階層に配置**
- **命名規則**: `*.test.ts` or `*.test.tsx`

```
src/
├── components/
│   ├── UserCard.tsx
│   └── UserCard.test.tsx        # ← 同階層に配置
├── lib/
│   ├── utils/
│   │   ├── user.ts
│   │   └── user.test.ts         # ← 同階層に配置
```

#### E2E（Playwright）

- **`e2e/` ディレクトリ配下に集約**
- **命名規則**: `*.spec.ts`
- 機能単位でファイルを分ける（例: `e2e/auth.spec.ts`, `e2e/checkout.spec.ts`）

```
e2e/
├── home.spec.ts
└── auth.spec.ts
```

### テストの書き方

#### コンポーネントのテスト

```typescript
// UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should render user name', () => {
    const user = { id: '1', name: 'Alice' };
    render(<UserCard user={user} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
```

#### 関数のテスト

```typescript
// user.test.ts
import { describe, it, expect } from 'vitest';
import { filterActiveUsers } from './user';

describe('filterActiveUsers', () => {
  it('should filter active users', () => {
    const users = [
      { id: '1', name: 'Alice', active: true },
      { id: '2', name: 'Bob', active: false },
    ];
    const result = filterActiveUsers(users);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });
});
```

#### E2E テスト（Playwright）

```typescript
// e2e/home.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Home', () => {
  test('テンプレートのタイトルを表示する', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Indie Dev Web Template' }),
    ).toBeVisible();
  });
});
```

- `baseURL` は `playwright.config.ts` の `webServer` 設定でローカル dev サーバー（`http://localhost:3000`）が自動起動される
- 初回ローカル実行時は `bun e2e:install` でブラウザをインストール

---

## Git規約

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に準拠し、**日本語で記述**します。

#### フォーマット

```
<type>[optional scope]: <説明>

[optional body]
```

**重要**: Claude が書いた旨のフッター（Co-Authored-By など）は含めないこと

#### Type 一覧

| Type | 説明 | 例 |
|------|------|-----|
| `feat` | 新機能の追加 | `feat(auth): ログインページを追加` |
| `fix` | バグ修正 | `fix(form): バリデーションのバグを修正` |
| `docs` | ドキュメントのみの変更 | `docs: README にセットアップ手順を追加` |
| `style` | コードの意味に影響しない変更 | `style: インデントを修正` |
| `refactor` | バグ修正や機能追加を伴わないコード変更 | `refactor: ルーティングを整理` |
| `perf` | パフォーマンス改善 | `perf: 画像の遅延読み込みを実装` |
| `test` | テストの追加・修正 | `test(auth): ログイン処理のテストを追加` |
| `chore` | ビルドプロセスや補助ツールの変更 | `chore: 依存関係を更新` |
| `ci` | CI 設定の変更 | `ci: GitHub Actions を追加` |

#### Breaking Changes

破壊的変更がある場合は `!` を付与、またはフッターに `BREAKING CHANGE:` を記載：

```
feat(api)!: レスポンス形式を変更

BREAKING CHANGE: API レスポンスがネスト構造で返却されるようになりました
```

### ブランチ戦略

| ブランチ | 用途 |
|---------|------|
| `main` | 本番環境 |
| `feature/*` | 機能開発（例: `feature/user-profile`） |
| `fix/*` | バグ修正（例: `fix/login-error`） |

---

## 開発コマンド

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動（ポートは .env.local の PORT、未指定なら 3000）
bun dev

# ビルド
bun run build

# テスト実行（Vitest）
bun run test
bun run test:watch

# E2E テスト（Playwright）
bun e2e:install   # 初回のみ（ブラウザインストール）
bun run e2e       # ヘッドレス実行
bun run e2e:ui    # UI モードで対話的に実行

# コード品質（Biome） — 書き換え（自動修正）
bun format        # フォーマット書き換え
bun lint          # Lint 書き換え
bun fix           # フォーマット + Lint を一括書き換え

# コード品質（Biome） — チェックのみ（読み取り専用 / CI 用）
bun format:check  # フォーマットチェック
bun lint:check    # Lint チェック
bun check         # フォーマット + Lint を一括チェック（CI で実行）
```

命名規約:

- **無印** = 書き換え（`--write` 相当）
- **`:check`** = 読み取り専用チェック
- 一括は `fix`（書き換え） / `check`（チェック）

---

## 環境情報

### 開発環境

| アプリ | URL | ポート |
|--------|-----|--------|
| Web | http://localhost:${PORT} | `.env.local` の `PORT`（デフォルト 3000） |

#### ポートの管理

本テンプレートはフォークして個人開発に使う前提のため、開発サーバーのポートを
ハードコードせず **`.env.local` で切り替える方式** を採用している。

- `package.json` の `dev` / `start` は port flag を持たない（`next dev` のみ）
- `.mise.toml` の `[env]` で `.env.local` をシェル env に展開する設定を入れている
  ため、`PORT=3100` のように書けば `bun dev` 由来の `next dev` / `bunx playwright`
  の双方が同じポートを参照する
- 複数の Next.js プロジェクトを並行起動する場合、フォーク先ごとに `.env.local`
  で重複しない値を指定すること（例: 3000 / 3010 / 3020 …）
- 初回 clone 後は `.env.local.example` を `.env.local` にコピーして `PORT` を設定する
- mise が必要（リポジトリ直下に `cd` した時点で自動アクティブ）。手動運用なら
  `PORT=3100 bun dev` のようにシェル経由で env を渡す
- CI では `.env.local` を使わないため、`PORT` は未設定となりデフォルトの 3000 で
  起動する

### デプロイ環境

| 環境 | Web | 用途 |
|------|-----|------|
| Development | localhost:3000 | ローカル開発 |
| Staging | TBD | テスト環境 |
| Production | Vercel | 本番 |

### 環境変数

```bash
# .env.local（例）
NEXT_PUBLIC_API_URL=https://api.example.com

# Supabase（認証）— Project Settings > API から取得
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase 認証のセットアップ

1. [Supabase](https://supabase.com/) でプロジェクトを作成する
2. `Authentication > Providers` で **Google** を有効化し、Google Cloud で発行した OAuth クライアント ID / シークレットを設定する
3. `Authentication > URL Configuration` のリダイレクト URL に `http://localhost:3000/auth/callback`（本番は本番ドメイン）を追加する
4. `Project Settings > API` の URL と anon key を `.env.local` に設定する
5. `bun dev` で起動し、`/login` から Google ログインを確認する

---

## 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [アーキテクチャ設計](./architecture.md) - システム設計
