# Wakepon

複数のユーザーが共同で支出を共有・管理できる家計簿アプリケーションです。

## 概要

Wakeponは、家族やルームメイトが共同で支出を記録し、支出パターンを追跡し、予算を管理できるように設計されたReactベースの家計簿アプリケーションです。最新のWeb技術で構築され、Supabaseバックエンドを採用しています。

## 機能

- **世帯共有**: 複数のユーザーが世帯に参加し、共有支出を追跡
- **支出管理**: カスタマイズ可能なカテゴリで支出を記録・分類
- **ユーザー認証**: 安全なOTPベースのメール認証
- **メンバー招待**: メールで世帯メンバーを招待
- **プロフィール管理**: ユーザープロフィールと世帯設定の管理
- **カテゴリ管理**: 世帯用のカスタム支出カテゴリを作成
- **リアルタイム更新**: Supabaseのリアルタイム機能を活用した協働体験

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Vite
- React Router DOM
- React Hook Form
- CSS with M Plus 1フォント（日本語対応）

### バックエンド
- Supabase（PostgreSQL + Auth + Storage）
- Row Level Security（RLS）によるデータ保護

### テスト
- Vitest
- React Testing Library

## はじめに

### 前提条件

- Node.js（最新のLTSバージョン推奨）
- npmまたはyarn
- Supabaseアカウント

### インストール

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd wakepon
```

2. 依存関係をインストール:
```bash
npm install
cd frontend
npm install
```

3. 環境変数を設定:

`frontend/`ディレクトリに`.env`ファイルを作成し、以下を記述:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 開発サーバーを起動:
```bash
cd frontend
npm run dev
```

## 利用可能なスクリプト

`frontend/`ディレクトリから実行:

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番環境用にビルド
- `npm run lint` - ESLintを実行
- `npm run preview` - 本番ビルドをプレビュー
- `npm test` - Vitestでテストを実行
- `npm run test:ui` - Vitest UIでテストを実行
- `npm run test:coverage` - カバレッジレポート付きでテストを実行

## プロジェクト構造

```
wakepon/
├── frontend/
│   ├── src/
│   │   ├── components/       # 再利用可能なコンポーネント
│   │   │   └── ui/           # 基本UIコンポーネント
│   │   ├── contexts/         # Reactコンテキスト（AuthContext）
│   │   ├── lib/              # 外部サービスクライアント
│   │   ├── pages/            # ルートコンポーネント
│   │   ├── utils/            # ユーティリティ関数
│   │   └── types.ts          # TypeScript型定義
│   ├── public/               # 静的アセット
│   └── package.json
├── supabase/                 # Supabase設定
└── README.md
```

## データベーススキーマ

- `users` - ユーザープロフィール
- `household_members` - ユーザーと世帯の関連
- `expenses` - 支出記録
- `categories` - 支出カテゴリ（システム + カスタム）
- `household_categories` - カテゴリと世帯の関連

## 認証フロー

1. ユーザーがサインインページでメールアドレスを入力
2. SupabaseがメールにOTPを送信
3. ユーザーがOTPを検証
4. セッションが確立され、保護されたルートにアクセス可能

## コントリビューション

コントリビューションを歓迎します！プルリクエストをお気軽に送信してください。

## ライセンス

[ライセンスを追加してください]

## サポート

問題や質問については、GitHubでissueを開いてください。

---

For English documentation, see [README.md](./README.md).
