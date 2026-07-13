# tools/ ― 議事録処理ツール（P1 試作）

立法・議会活動サポートAIの土台。既存の議事録HTMLを、検索・要約しやすい
構造化JSONに変換し、横断検索する。**依存ライブラリなし**（Python 3.11 標準ライブラリのみ）。

> 構想の正本は Google ドキュメント。本ディレクトリはその P1（HTML→JSON）と
> P2 入口（横断検索）の実装。

## 使い方

```bash
# 1) リポジトリ直下の *.html を全部 JSON 化 → data/*.json
python3 tools/parse_minutes.py

# 1') 1ファイルだけ変換して中身を確認（標準出力）
python3 tools/parse_minutes.py 20260224_nagatoritaro_shitsumon.html

# 2) テーマで横断検索（過去にどこまで議論したか・執行部の従来スタンス）
python3 tools/search_minutes.py 消火器
python3 tools/search_minutes.py デジタル 労働力
```

## JSON スキーマ（`data/*.json`）

```jsonc
{
  "source_file": "20260224_nagatoritaro_shitsumon.html",
  "title": "R8.2.24 本会議 一般質問 ながとり太郎",
  "date": "R8.2.24",              // タイトルから抽出（和暦）
  "meeting_type": "一般質問",      // 一般質問/本会議/委員会/協議会 等
  "members": ["ながとり太郎"],
  "video_urls": ["youtube.com/..."],
  "has_timestamps": true,          // 発言録にタイムスタンプがあるか
  "topics": [                      // 「質問の要旨/答弁の要旨」構造がある場合のみ
    {
      "theme": "…",
      "question_summary": "…",
      "answer_summary": "…"
    }
  ],
  "full_text": "…"                 // 発言録を含む全文（検索・RAG 用）
}
```

## 対応状況・既知の限界

- **要旨付き一般質問型**（`<h2>テーマ</h2><h3>質問の要旨</h3>…`）は `topics` を抽出。
- **本会議・委員会型**（要旨構造なし）は `topics` が空になり、`full_text` で検索対象になる。
  → 次段でこれらにも LLM で要旨を自動付与すると精度が上がる。
- 検索は現状**素朴なキーワード一致**。同義語・表記ゆれに弱い。
  → 次段でベクトル検索/RAG に差し替える前提（`search_minutes.py` を置換）。
- 同一会議の重複ファイル（例: `20260224_…` と `R8.2.24_本会議_…`）は未名寄せ。

## 次の一手（ロードマップ上の位置）

- P2: 要旨未整理ファイルへの LLM 要旨付与／ベクトル検索化
- P3: テーマ入力 → 質問ドラフト＋想定答弁の生成（`full_text` と `topics` を文脈に）
