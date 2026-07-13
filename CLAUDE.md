# CLAUDE.md ― プロジェクト・メモリ

このリポジトリで作業を再開するとき、まずこれを読む。

## このリポジトリは何か
- 小金井市議会議員 **ながとり太郎** 氏らの議事録アーカイブ兼Webサイト。
- 一般質問・本会議・委員会の議事録HTML（要旨・タイムスタンプ付き文字起こしを含む）、
  選挙・広報用ページ（`shirai-ver2/` 等）が同居している。

## いま進めている構想：立法・議会活動サポートAI
地方議員の立法・政策活動を、人員不足の議会事務局に代わってAIで支える構想。

### 決まっていること（重要）
- **構想の正本は Google ドキュメント**（リポジトリの `docs/.../README.md` はミラー）。
  文章の更新はドキュメント側で行う。
  正本: https://docs.google.com/document/d/18fTla98kcLgxrsX3yJTD2qaeW9pcwPqYv4xRerKB0S8/edit
- **v1は「議員個人のためのツール」に割り切る**（事務局向けの中立提供は将来）。
- **とっかかりは「一般質問・政策提言の準備支援」**。条例の自動起案は低頻度・高リスク
  なので後回し。まずは既存議事録を検索・要約できる基盤から。
- 作業ブランチ: `claude/legislative-drafting-ai-fyk4bl`

### 進捗
- **P0 構想文書化**: 完了（Googleドキュメント＋ `docs/legislative-drafting-ai/README.md`）
- **P1 HTML→JSON化**: 完了（`tools/parse_minutes.py` → `data/*.json` 10件）
- **P2 横断検索（入口）**: 完了（`tools/search_minutes.py`）
- **P3 質問ドラフト＋想定答弁の生成**: 未着手（次の候補）

### ツールの使い方
```bash
python3 tools/parse_minutes.py            # *.html → data/*.json（依存なし）
python3 tools/search_minutes.py 消火器     # テーマ横断検索＋執行部スタンス
```
詳細は `tools/README.md`、JSONスキーマも同ファイル。

### 既知の限界（次段の宿題）
- 本会議・委員会型（要旨構造なし）は `topics` が空 → 全文検索のみ。LLM要旨付与で改善予定。
- 検索は素朴なキーワード一致 → RAG化予定。
- 同一会議の重複ファイル（例: `20260224_…` と `R8.2.24_本会議_…`）は未名寄せ。

## 作業上の約束
- 開発は上記ブランチで。コミット後は `git push -u origin <branch>`。
- PRはユーザーが明示的に頼んだときだけ作る。
