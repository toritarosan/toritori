#!/usr/bin/env python3
"""議事録HTML → 構造化JSON 変換ツール（P1 試作）

立法・議会活動サポートAIの土台。既存の議事録HTMLを検索・要約しやすい
JSONに変換する。依存ライブラリなし（標準ライブラリのみ）。

対応している主なパターン:
  - 要旨付き一般質問型: <h2>テーマ</h2> <h3>質問の要旨</h3>… <h3>市側の答弁の要旨</h3>…
  - 本会議・委員会型:   <h3>◯◯議員</h3> + 全文（要旨が無い場合は topics 空）

使い方:
  python3 tools/parse_minutes.py                 # *.html を全部変換 → data/*.json
  python3 tools/parse_minutes.py FILE.html       # 1ファイルだけ変換（標準出力）
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys
from html.parser import HTMLParser


# 議員名として扱う見出しの目印
MEMBER_HEADING_RE = re.compile(r"議員\s*$")
# 動画URL
YOUTUBE_RE = re.compile(r"(?:youtube\.com/embed/|youtu\.be/|youtube\.com/watch\?v=)[\w\-]+[^\s\"'<>]*")
# 和暦日付（例: R8.2.24 / R8.2.24）
DATE_RE = re.compile(r"[RH令平]?\s*\d{1,2}[\.．]\s*\d{1,2}[\.．]\s*\d{1,2}")
# タイムスタンプ（例: 動画 02:57 / 04:31）
TIMESTAMP_RE = re.compile(r"\b\d{1,2}:\d{2}(?::\d{2})?\b")


class MinutesParser(HTMLParser):
    """見出し(h1-h3)と本文テキストを、出現順に (tag, text) として拾う。"""

    HEADINGS = {"h1", "h2", "h3"}
    SKIP = {"script", "style", "head"}
    BLOCK = {"p", "div", "li", "br", "section", "details", "summary"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[tuple[str, str]] = []  # (kind, text) kind: h1/h2/h3/text
        self._stack: list[str] = []
        self._buf: list[str] = []
        self._skip_depth = 0

    def _flush(self, kind: str) -> None:
        text = re.sub(r"\s+", " ", "".join(self._buf)).strip()
        self._buf = []
        if text:
            self.blocks.append((kind, text))

    def handle_starttag(self, tag, attrs):  # noqa: D401
        if tag in self.SKIP:
            self._skip_depth += 1
            return
        if tag in self.HEADINGS or tag in self.BLOCK:
            # 直前までのテキストを確定
            if self._buf:
                self._flush("text")
        self._stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.SKIP and self._skip_depth > 0:
            self._skip_depth -= 1
            return
        if tag in self.HEADINGS:
            self._flush(tag)
        elif tag in self.BLOCK:
            self._flush("text")
        if self._stack and self._stack[-1] == tag:
            self._stack.pop()

    def handle_data(self, data):
        if self._skip_depth > 0:
            return
        self._buf.append(data)

    def close(self):  # type: ignore[override]
        super().close()
        if self._buf:
            self._flush("text")


def _first(pattern: re.Pattern, text: str) -> str | None:
    m = pattern.search(text)
    return m.group(0).strip() if m else None


def parse_html(html: str, source_file: str) -> dict:
    p = MinutesParser()
    p.feed(html)
    p.close()
    blocks = p.blocks

    title = next((t for k, t in blocks if k == "h1"), source_file)
    date = _first(DATE_RE, title) or None

    # 会議種別: タイトルから日付・議員名を除いたざっくり分類
    meeting_type = None
    for key in ("一般質問", "本会議", "総務企画委員会", "広報・広聴協議会", "委員会", "協議会"):
        if key in title:
            meeting_type = key
            break

    # 議員名: 「◯◯議員」形式のh3、無ければタイトル末尾の人名
    members: list[str] = []
    for k, t in blocks:
        if k == "h3" and MEMBER_HEADING_RE.search(t):
            name = MEMBER_HEADING_RE.sub("", t).strip()
            if name and name not in members:
                members.append(name)
    if not members:
        m = re.search(r"(ながとり太郎|水谷たかこ|[一-龥ぁ-んァ-ヶ]{2,6})\s*$", title)
        if m:
            members.append(m.group(1))

    # 発言録（文字起こし）の開始位置を検出し、要旨抽出はそれより前だけを見る。
    # 要旨セクションの後ろに続く発言全文を、最後のテーマが吸い込むのを防ぐ。
    def _is_transcript(t: str) -> bool:
        return t.startswith("◯") or bool(re.search(r"動画\s+\d{1,2}:\d{2}\s*再生", t))

    transcript_start = next(
        (idx for idx, (k, t) in enumerate(blocks) if k == "text" and _is_transcript(t)),
        len(blocks),
    )
    summary_blocks = blocks[:transcript_start]

    # テーマ（h2）ごとに、その直後に来る「質問の要旨」「答弁の要旨」を拾う。
    # 要旨は短い段落1つを想定し、見出し直後の最初のテキストブロックのみ採用する。
    topics: list[dict] = []
    i = 0
    n = len(summary_blocks)
    while i < n:
        kind, text = summary_blocks[i]
        if kind == "h2":
            topic = {"theme": text, "question_summary": None, "answer_summary": None}
            j = i + 1
            current = None
            while j < n and summary_blocks[j][0] != "h2":
                k2, t2 = summary_blocks[j]
                if k2 == "h3" and ("質問の要旨" in t2 or "質問要旨" in t2):
                    current = "question_summary"
                elif k2 == "h3" and ("答弁" in t2 and "要旨" in t2):
                    current = "answer_summary"
                elif k2 == "h3":
                    current = None  # 別の見出しに入った
                elif k2 == "text" and current and topic[current] is None:
                    topic[current] = t2  # 最初の1ブロックのみ
                j += 1
            topics.append(topic)
            i = j
        else:
            i += 1

    # 動画URL
    video_urls = sorted(set(m.group(0) for m in YOUTUBE_RE.finditer(html)))

    # 全文（テキストブロックを連結）。検索・RAG用の素データ。
    full_text = "\n".join(t for k, t in blocks if k == "text")

    # タイムスタンプ有無（発言インデックス用のヒント）
    has_timestamps = bool(TIMESTAMP_RE.search(full_text))

    return {
        "source_file": source_file,
        "title": title,
        "date": date,
        "meeting_type": meeting_type,
        "members": members,
        "video_urls": video_urls,
        "topics": topics,
        "has_timestamps": has_timestamps,
        "full_text": full_text,
    }


def convert_file(path: str) -> dict:
    with open(path, encoding="utf-8", errors="replace") as f:
        html = f.read()
    return parse_html(html, os.path.basename(path))


def main(argv: list[str]) -> int:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if len(argv) > 1:
        # 単一ファイル → 標準出力（動作確認用）
        data = convert_file(argv[1])
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return 0

    out_dir = os.path.join(root, "data")
    os.makedirs(out_dir, exist_ok=True)
    # index.html 等の非議事録は除外
    skip = {"index.html", "vol159_draft.html"}
    files = sorted(glob.glob(os.path.join(root, "*.html")))
    summary = []
    for path in files:
        name = os.path.basename(path)
        if name in skip:
            continue
        data = convert_file(path)
        out_path = os.path.join(out_dir, os.path.splitext(name)[0] + ".json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        summary.append((name, len(data["topics"]), len(data["members"]), len(data["full_text"])))

    print(f"変換完了: {len(summary)} 件 → {os.path.relpath(out_dir, root)}/")
    print(f"{'ファイル':<52} {'テーマ':>4} {'議員':>4} {'本文字数':>7}")
    for name, ntopics, nmembers, nchars in summary:
        print(f"{name:<52} {ntopics:>4} {nmembers:>4} {nchars:>7}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
