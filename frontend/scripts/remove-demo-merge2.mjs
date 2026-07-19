/** Fourth pass: multiline demo+API merges */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/pages");

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (n.endsWith(".jsx")) a.push(p);
  }
  return a;
}

const MERGE_BLOCK = /if\s*\(\s*apiRows\.length\s*>\s*0\s*\)\s*\{[\s\S]*?\.\.\.DEMO_\w+[\s\S]*?\}\s*else\s*\{\s*set\w+\(\s*\[\]\s*\)\s*;\s*\}/g;

function fixMergeBlock(block) {
  const setMatch = block.match(/set(\w+)\(/);
  const mapMatch =
    block.match(/apiRows\.map\(\(row, i\) => enrichApi\w+\(row, i\)\)/) ||
    block.match(/apiRows\.map\(\(r, i\) => enrichApi\w+\(r, i\)\)/) ||
    block.match(/const enriched = (apiRows\.map\([^;]+;)/) ||
    block.match(/const fromApi = (groupApi\w+\(apiRows\))/);
  const groupMatch = block.match(/groupApiBomRows\(apiRows\)/);

  if (!setMatch) return block;
  const setter = setMatch[0].slice(0, -1);
  if (groupMatch) return `${setter}(groupApiBomRows(apiRows));`;
  if (mapMatch) {
    const expr = mapMatch[0].startsWith("apiRows") ? mapMatch[0] : mapMatch[1]?.replace(/;$/, "") || mapMatch[0];
    return `${setter}(${expr});`;
  }
  return block.replace(MERGE_BLOCK, "");
}

let n = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  if (!/\.\.\.DEMO_/.test(src) && !/demoNames|demoCodes/.test(src)) continue;
  const orig = src;

  src = src.replace(MERGE_BLOCK, (m) => fixMergeBlock(m));

  // Remaining single-line spreads into setX([...DEMO, ...y])
  src = src.replace(
    /set(\w+)\(\s*\[\s*\.\.\.DEMO_\w+,\s*\.\.\.(\w+)\.filter\([^)]+\)\s*,?\s*\]\s*\)/g,
    "set$1($2)"
  );

  // BomMaster newBom spread
  src = src.replace(/\.\.\.DEMO_BOMS\[0\],\s*/g, "");

  // Batch/raw material detail spread - use row only
  src = src.replace(/setSelected\(\{\s*\.\.\.DEMO_\w+,\s*\.\.\.row/g, "setSelected({ ...row");

  if (src !== orig) {
    fs.writeFileSync(file, src);
    n++;
    console.log(path.relative(root, file));
  }
}
console.log(`Pass 4: ${n}`);
