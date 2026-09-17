#!/usr/bin/env python3
"""Fail if blog portal HTML still has double-encoded entities.

Browsers unescape once. `&amp;#x27;` therefore renders as the literal
characters `&#x27;` instead of an apostrophe — the “we look like we copied
this” glitch on /blog. Single encoding (`&#x27;` / `&amp;`) is correct.
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
DOUBLE_ENTITY_RE = re.compile(r"&amp;(#x?[0-9A-Fa-f]+;|#\d+;|[a-zA-Z]+;)")
PORTALS = [
    ROOT / "site" / "blog" / "index.html",
    ROOT / "site" / "blog.html",
]


def find_double_entities(text):
    return DOUBLE_ENTITY_RE.findall(text)


def undouble_entities(s):
    prev = None
    out = s
    while out != prev:
        prev = out
        out = DOUBLE_ENTITY_RE.sub(r"&\1", out)
    return out


def main():
    assert undouble_entities("California&amp;#x27;s") == "California&#x27;s"
    assert undouble_entities("Testing &amp;amp; Visual") == "Testing &amp; Visual"
    assert undouble_entities("Testing &amp; Visual") == "Testing &amp; Visual"

    failures = []
    for path in PORTALS:
        if not path.exists():
            failures.append(f"missing {path.relative_to(ROOT)}")
            continue
        hits = find_double_entities(path.read_text())
        raw = path.read_text()
        if "&amp;#" in raw:
            failures.append(
                f"{path.relative_to(ROOT)}: truncated or leftover &amp;# sequence"
            )
        if hits:
            failures.append(
                f"{path.relative_to(ROOT)}: {len(hits)} double-encoded entities "
                f"(e.g. &amp;{hits[0]})"
            )
    if failures:
        print("BLOG ENTITY CHECK FAILED")
        for line in failures:
            print(f"- {line}")
        return 1
    print("BLOG ENTITY CHECK PASSED")
    print("Portal titles use single HTML encoding (apostrophes/ampersands will display).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
