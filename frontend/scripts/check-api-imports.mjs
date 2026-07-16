import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(jsx?|tsx?)$/.test(entry)) acc.push(full);
  }
  return acc;
}

const imports = [];
for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8");
  const re = /import\s*\{([^}]+)\}\s*from\s*["']([^"']*api\/[^"']+)["']/g;
  let match;
  while ((match = re.exec(text))) {
    const names = match[1]
      .split(",")
      .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
    const api = match[2].replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
    for (const name of names) imports.push({ file, name, api });
  }
}

const broken = [];
for (const imp of imports) {
  const apiPath = path.join(root, imp.api.endsWith(".js") ? imp.api : `${imp.api}.js`);
  if (!fs.existsSync(apiPath)) {
    broken.push({ ...imp, reason: "missing file" });
    continue;
  }
  const exp = fs.readFileSync(apiPath, "utf8");
  const hasExport =
    new RegExp(`export\\s+(async\\s+)?(const|function)\\s+${imp.name}\\b`).test(exp) ||
    new RegExp(`export\\s*\\{[^}]*\\b${imp.name}\\b`).test(exp);
  if (!hasExport) broken.push({ ...imp, reason: "missing export" });
}

if (broken.length) {
  for (const b of broken) {
    console.log(`${path.relative(root, b.file)}: ${b.name} from ${b.api} (${b.reason})`);
  }
  process.exit(1);
}
console.log("No broken API imports");
