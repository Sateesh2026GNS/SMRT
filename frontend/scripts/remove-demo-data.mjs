/**
 * Remove demo/sample fallbacks from page components.
 * Run: node frontend/scripts/remove-demo-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesRoot = path.join(__dirname, "../src/pages");
const componentsRoot = path.join(__dirname, "../src/components");
const utilsRoot = path.join(__dirname, "../src/utils");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(jsx|js|tsx|ts)$/.test(name)) acc.push(p);
  }
  return acc;
}

function processContent(src, file) {
  let out = src;
  const before = out;

  // Remove "Using demo ..." toasts
  out = out.replace(/\s*addToast\(\s*["']Using demo[^"']*["']\s*,\s*["']info["']\s*\)\s*;?/g, "");

  // else setRows(DEMO_*) -> else setRows([])
  out = out.replace(/\belse\s+setRows\(\s*DEMO_\w+\s*\)/g, "else setRows([])");

  // catch/error: setRows(DEMO_*) -> setRows([])  (not useState)
  out = out.replace(/(?<!useState\()\bsetRows\(\s*DEMO_\w+\s*\)/g, "setRows([])");

  // setBoms(DEMO_*) -> setBoms([])
  out = out.replace(/\bsetBoms\(\s*DEMO_\w+\s*\)/g, "setBoms([])");

  // setProducts/setCustomers/etc
  out = out.replace(/\bset(Products|Customers|Departments|Vendors|Warehouses|Machines|WorkOrders|Orders|Comparison|SelectedRfq)\(\s*DEMO_\w+(?:\[\d+\])?\s*\)/g, "set$1([])");

  // setSelectedRfq(DEMO_RFQ_LIST[0]) -> setSelectedRfq(null)
  out = out.replace(/\bsetSelectedRfq\(\s*DEMO_\w+\[\d+\]\s*\)/g, "setSelectedRfq(null)");

  // setComparison(DEMO_*) -> setComparison([])
  out = out.replace(/\bsetComparison\(\s*DEMO_\w+\s*\)/g, "setComparison([])");

  // setSummary/setHub/setData on error with DEMO - keep spread merge on success, fix catch fallbacks
  out = out.replace(/catch\s*\{[^}]*setSummary\(\s*DEMO_\w+\s*\)/g, (m) => m.replace(/setSummary\(\s*DEMO_\w+\s*\)/, "setSummary({})"));

  // Demo + API merge blocks -> API only
  out = out.replace(
    /if\s*\(\s*apiRows\.length\s*>\s*0\s*\)\s*\{\s*const\s+(\w+)\s*=\s*[^;]+;\s*const\s+demoNums\s*=\s*new\s+Set\(\s*DEMO_\w+\.map\([^)]+\)\s*\)\s*;\s*set\w+\(\s*\[\.\.\.DEMO_\w+,\s*\.\.\.\1\.filter\([^)]+\)\s*\]\s*\)\s*;\s*\}\s*else\s*\{\s*set\w+\(\s*DEMO_\w+\s*\)\s*;\s*\}/gs,
    (m, varName) => {
      const setMatch = m.match(/set(\w+)\(/);
      const enrichMatch = m.match(/const\s+\w+\s*=\s*(groupApi\w+\(apiRows\)|apiRows\.map\([^)]+\))/);
      if (setMatch && enrichMatch) {
        return `set${setMatch[1]}(${enrichMatch[1]});`;
      }
      return `set${setMatch?.[1] || "Rows"}(apiRows);`;
    }
  );

  // Simpler merge: setWorkOrders([...DEMO_WORK_ORDERS, ...enriched.filter...])
  out = out.replace(
    /setWorkOrders\(\s*\[\.\.\.DEMO_WORK_ORDERS,\s*\.\.\.(\w+)\.filter\([^)]+\)\s*\]\s*\)/g,
    "setWorkOrders($1)"
  );
  out = out.replace(
    /setOrders\(\s*\[\.\.\.DEMO_PRODUCTION_ORDERS,\s*\.\.\.(\w+)\.filter\([^)]+\)\s*\]\s*\)/g,
    "setOrders($1)"
  );

  // Table fallbacks: filtered || DEMO_LEDGER -> filtered
  out = out.replace(/\|\|\s*DEMO_\w+/g, "");

  // useState(DEMO_LIST) -> useState([])
  out = out.replace(/\buseState\(\s*DEMO_\w+_LIST\s*\)/g, "useState([])");
  out = out.replace(/\buseState\(\s*DEMO_\w+S\s*\)/g, "useState([])");
  out = out.replace(/\buseState\(\s*DEMO_ADJUSTMENTS\s*\)/g, "useState([])");
  out = out.replace(/\buseState\(\s*DEMO_TRANSFERS\s*\)/g, "useState([])");

  // return DEMO_WO_SUMMARY / DEMO_SUMMARY when empty -> compute from empty
  out = out.replace(
    /if\s*\([^)]+\)\s*return\s+DEMO_WO_SUMMARY\s*;/g,
    "if (!apiSummary && filtered.length === 0 && !Object.values(filters).some(Boolean)) return computeWorkOrderSummary([]);"
  );
  out = out.replace(
    /if\s*\([^)]+\)\s*\{\s*return\s+DEMO_SUMMARY\s*;\s*\}/g,
    "if (!apiSummary && filteredOrders.length === 0 && !Object.values(filters).some(Boolean)) { return computePlanningSummary([]); }"
  );

  if (out !== before) return out;
  return null;
}

const files = [
  ...walk(pagesRoot),
  ...walk(componentsRoot),
  ...walk(utilsRoot).filter((f) => f.includes("customerOptions") || f.includes("invoiceCopy")),
];

let changed = 0;
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  if (!/DEMO_|Using demo|demoNums|SAMPLE_INVOICE|mergeWithSample/.test(src)) continue;
  const next = processContent(src, file);
  if (next && next !== src) {
    fs.writeFileSync(file, next);
    changed++;
    console.log("updated:", path.relative(path.join(__dirname, ".."), file));
  }
}
console.log(`Done. ${changed} files updated.`);
