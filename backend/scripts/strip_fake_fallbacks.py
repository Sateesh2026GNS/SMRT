"""Replace fake numeric fallbacks in backend services with 0/empty."""
from __future__ import annotations

import re
from pathlib import Path

SERVICES = Path(__file__).resolve().parents[1] / "app" / "services"

# Match `expr or <number>` / `expr or <float>` where rhs is clearly a fake default (>= 2 digits or decimal)
FAKE_OR = re.compile(
    r"(\b[\w.]+\))\s+or\s+(\d[\d_]*(?:\.\d+)?|\d+\.\d+)"
)

FILES = list(SERVICES.glob("*.py"))


def strip_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    # dashboard-specific synthetic chart values in overview functions
    text = re.sub(r"planned or \d[\d_ +]*", "planned", text)
    text = re.sub(r"actual or \d[\d_ +]*", "actual", text)

    # Generic `value or N` -> `value` when N looks like fake default (not 0/1)
    def repl(m: re.Match) -> str:
        lhs, rhs = m.group(1), m.group(2).replace("_", "")
        try:
            num = float(rhs)
            if num in (0, 1):
                return m.group(0)
        except ValueError:
            pass
        return lhs

    text = FAKE_OR.sub(repl, text)

    # `str(x or 1248)` -> `str(x)`
    text = re.sub(r"str\((\w+)\s+or\s+\d[\d_]*\)", r"str(\1)", text)

    # hardcoded trend strings in dashboard
    text = text.replace('"trend": "18.6%"', '"trend": "0%"')
    text = text.replace('"trend": "6.3%"', '"trend": "0%"')

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


if __name__ == "__main__":
    changed = 0
    for f in FILES:
        if strip_file(f):
            changed += 1
            print("updated:", f.name)
    print(f"Done. {changed} files.")
