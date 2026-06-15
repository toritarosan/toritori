# Handoff: 白井とおる 2026 選挙サイト — GitHub Pages デプロイ

## 概要
白井とおる（小金井市長）の2026年選挙キャンペーンサイトを GitHub Pages にデプロイするタスクです。
サイトは完全な1ファイルのスタンドアロンHTMLとして完成済みです。

## タスク内容
`bundle/index.html` を GitHub Pages にデプロイしてください。

## ファイル構成

```
design_handoff_shirai2026/
├── README.md               ← このファイル
└── bundle/
    └── index.html          ← デプロイするファイル（完全スタンドアロン、約17MB）
```

## デプロイ手順（GitHub Pages）

### 方法A: 新規リポジトリに直接デプロイ
```bash
# 1. 新しいディレクトリを作成
mkdir shirai2026-site && cd shirai2026-site

# 2. bundle/index.html をこのディレクトリにコピー

# 3. Gitリポジトリを初期化してプッシュ
git init
git add index.html
git commit -m "initial: campaign site"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

### 方法B: 既存リポジトリに追加
```bash
cp index.html /path/to/repo/
cd /path/to/repo
git add index.html
git commit -m "add campaign site"
git push
```

### GitHub Pages の有効化
1. GitHubのリポジトリページを開く
2. **Settings → Pages**
3. **Source**: `Deploy from a branch`
4. **Branch**: `main` / `/ (root)`
5. Save → 数分後に `https://<USERNAME>.github.io/<REPO>/` で公開

## サイト仕様
- **フレームワーク**: 純粋なHTML/CSS/JS（フレームワーク不要）
- **依存**: なし（すべてバンドル済み）
- **サイズ**: 約17MB（画像データをBase64でインライン化）
- **対応**: PC・スマートフォン対応（レスポンシブ）
- **フォント**: Zen Maru Gothic、Noto Sans JP（Google Fonts、オンライン時のみ）

## デザイントークン（参考）
| トークン | 値 |
|---|---|
| メインカラー（ブルー） | `#00a0e9` |
| アクセント（マゼンタ） | `#e0004a` |
| イエロー | `#ffe000` |
| 本文フォント | Zen Maru Gothic / Noto Sans JP |

## 注意事項
- このHTMLファイルは**デザインリファレンス兼本番ファイル**です。そのままデプロイできます。
- 画像は `image-slot` WebコンポーネントでBase64エンコードされてHTMLに埋め込まれています。
- 編集が必要な場合は、元のプロジェクト（Claude Studio）で修正後に再バンドルしてください。
