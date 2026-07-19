"""Strip fake numeric fallbacks from backend services."""
import re
from pathlib import Path

SERVICES = Path(__file__).resolve().parents[1] / "app" / "services"

# expr or 123 / expr or 12_50_000 / expr or 82.3
PAT = re.compile(r"(\b[\w.]+\))\s+or\s+([\d][\d_]*(?:\.[\d]+)?)")


def fix(text: str) -> str:
    text = re.sub(r"planned or [\d_ +*().]+", "planned", text)
    text = re.sub(r"actual or [\d_ +*().]+", "actual", text)
    text = re.sub(r"str\((\w+)\s+or\s+[\d_]+\)", r"str(\1)", text)

    def repl(m: re.Match) -> str:
        rhs = m.group(2).replace("_", "")
        try:
            if float(rhs) in (0.0, 1.0):
                return m.group(0)
        except ValueError:
            pass
        return m.group(1)

    return PAT.sub(repl, text)


changed = 0
for path in SERVICES.glob("*.py"):
    orig = path.read_text(encoding="utf-8")
    new = fix(orig)
    if new != orig:
        path.write_text(new, encoding="utf-8")
        changed += 1
        print(path.name)

print(f"Updated {changed} files")
