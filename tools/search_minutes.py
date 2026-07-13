#!/usr/bin/env python3
"""議事録 横断検索（P2 入口・最小版）

data/*.json を対象に、テーマで横断検索し「このテーマはどこまで議論済みか・
執行部の従来スタンスは何か」を返す。汎用AIに対する差別化＝「この議員・この
自治体の文脈を既に持っている」状態の、最小の実証。

依存ライブラリなし。まずは素朴なキーワード一致でスコアリングする
（次段でベクトル検索/RAGに差し替える前提）。

使い方:
  python3 tools/search_minutes.py エアコン
  python3 tools/search_minutes.py "デジタル 労働力"
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys


def load_records(data_dir: str) -> list[dict]:
    records = []
    for path in sorted(glob.glob(os.path.join(data_dir, "*.json"))):
        with open(path, encoding="utf-8") as f:
            records.append(json.load(f))
    return records


def score(rec: dict, terms: list[str]) -> tuple[int, list[dict]]:
    """レコード全体のスコアと、ヒットしたテーマ一覧を返す。"""
    hits = []
    total = 0
    for topic in rec.get("topics", []):
        blob = " ".join(
            str(topic.get(k) or "")
            for k in ("theme", "question_summary", "answer_summary")
        )
        s = sum(blob.count(t) * (5 if t in (topic.get("theme") or "") else 1) for t in terms)
        if s:
            hits.append({"topic": topic, "score": s})
            total += s
    # テーマ構造が無いファイルは全文で拾う
    if not rec.get("topics"):
        full = rec.get("full_text", "")
        total += sum(full.count(t) for t in terms)
    else:
        full = rec.get("full_text", "")
        total += sum(min(full.count(t), 3) for t in terms)  # 全文は加点を抑える
    hits.sort(key=lambda h: -h["score"])
    return total, hits


STANCE_MARKERS = [
    ("研究を進める", "実質保留（前向きな言葉だが具体化は未定）"),
    ("検討", "検討段階（実施は未確約）"),
    ("認識している", "課題認識はあり"),
    ("困難", "消極的（実施は困難との立場）"),
    ("実施", "実施の方向"),
    ("進めている", "既に着手済み"),
]


def read_stance(answer: str | None) -> str | None:
    if not answer:
        return None
    for marker, label in STANCE_MARKERS:
        if marker in answer:
            return label
    return None


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 1
    terms = [t for t in re.split(r"[\s　]+", " ".join(argv[1:])) if t]
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    records = load_records(os.path.join(root, "data"))
    if not records:
        print("data/*.json が見つかりません。先に parse_minutes.py を実行してください。")
        return 1

    scored = [(rec, *score(rec, terms)) for rec in records]
    scored = [x for x in scored if x[1] > 0]
    scored.sort(key=lambda x: -x[1])

    if not scored:
        print(f"「{' '.join(terms)}」に関連する過去の議論は見つかりませんでした（新規テーマの可能性）。")
        return 0

    print(f"■ 「{' '.join(terms)}」の議論履歴 — {len(scored)} 件の会議でヒット\n")
    for rec, total, hits in scored[:8]:
        head = f"{rec.get('date') or '日付不明'}  {rec.get('meeting_type') or ''}"
        who = "・".join(rec.get("members") or [])
        print(f"● {head}  {who}   [{rec['source_file']}]")
        for h in hits[:3]:
            t = h["topic"]
            print(f"   ▸ テーマ: {t['theme']}")
            if t.get("answer_summary"):
                stance = read_stance(t["answer_summary"])
                if stance:
                    print(f"     └ 執行部スタンス: {stance}")
                print(f"     └ 答弁要旨: {t['answer_summary'][:90]}…")
        if not hits and rec.get("full_text"):
            print("   ▸ （要旨未整理・全文中に言及あり）")
        print()

    print("― ヒント: 上記は既出テーマ。重複を避け、答弁の『保留・検討』を突く再質問が有効。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
