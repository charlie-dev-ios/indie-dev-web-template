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
- `.specify/` ディレクトリによる仕様管理（必要に応じて導入）

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
├── specs/                   # 機能仕様書（speckit / 任意）
├── .specify/                # speckit 設定（任意）
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

| テスト種類 | ツール | 目的 |
|----------|--------|------|
| Unit Test | Vitest + Testing Library | 個別関数・コンポーネントのテスト |
| Integration Test | Vitest + Testing Library | 複数コンポーネントの統合テスト |
| E2E Test | 今後導入予定 | エンドツーエンドのテスト |

### テストファイル配置

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

# 開発サーバー起動（ポート 3000）
bun dev

# ビルド
bun run build

# テスト実行
bun run test
bun run test:watch

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
| Web | http://localhost:3000 | 3000 |

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
```

---

## 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [アーキテクチャ設計](./architecture.md) - システム設計
