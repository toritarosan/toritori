# 白井とおる 公式サイト

## GitHub Pages へのデプロイ手順

### 1. リポジトリを作成

GitHub で新しいリポジトリを作成します（例: `shirai2026`）。

### 2. ファイルをプッシュ

この `deploy/` フォルダの中身をリポジトリのルートにそのままアップロードしてください。

```
index.html
koganei-campaign/
  campaign.css
  image-slot.js
  tweaks-panel.jsx
  tweaks-app.jsx
.nojekyll
README.md
```

### 3. GitHub Pages を有効化

1. リポジトリの **Settings** → **Pages** を開く
2. **Source** を `Deploy from a branch` に設定
3. Branch: `main` / Folder: `/ (root)` を選択
4. **Save** をクリック

数分後に `https://<username>.github.io/<repository>/` で公開されます。

---

### ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | サイト本体 |
| `koganei-campaign/campaign.css` | スタイルシート |
| `koganei-campaign/image-slot.js` | 写真ドロップUI |
| `koganei-campaign/tweaks-panel.jsx` | Tweaksパネル |
| `koganei-campaign/tweaks-app.jsx` | Tweaks設定 |
| `.nojekyll` | Jekyll無効化（GitHub Pages必須） |

---

*© 白井とおるサポーターズ*
