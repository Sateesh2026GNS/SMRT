import re
from pathlib import Path

pat = re.compile(r"(\b[\w.\[\]\"]+)\s+or\s+([\d][\d_]*(?:\.[\d]+)?)")

def repl(m):
    rhs = m.group(2).replace("_", "")
    try:
        if float(rhs) in (0.0, 1.0):
            return m.group(0)
    except ValueError:
        pass
    return m.group(1)

for p in (Path(__file__).resolve().parents[1] / "app" / "services").glob("*.py"):
    t = p.read_text(encoding="utf-8")
    n = pat.sub(repl, t)
    if n != t:
        p.write_text(n, encoding="utf-8")
        print(p.name)
