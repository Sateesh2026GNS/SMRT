/** Second pass: demo merge patterns and remaining fallbacks */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../src");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(name)) acc.push(p);
  }
  return acc;
}

function fix(src) {
  let out = src;

  // WorkOrders / similar merge
  out = out.replace(
    /const enriched = apiRows\.map\([^)]+\);\s*const demoNums = new Set\(DEMO_\w+\.map\([^)]+\)\);\s*setWorkOrders\(\[\.\.\.DEMO_WORK_ORDERS, \.\.\.enriched\.filter\([^)]+\)\]\);/g,
    "setWorkOrders(apiRows.map((r, i) => enrichApiWorkOrder(r, i)));"
  );
  out = out.replace(
    /if \(apiRows\.length > 0\) \{\s*const enriched = apiRows\.map\([^)]+\);\s*const demoNums = new Set\(DEMO_WORK_ORDERS\.map\([^)]+\)\);\s*setWorkOrders\(\[\.\.\.DEMO_WORK_ORDERS, \.\.\.enriched\.filter\([^)]+\)\]\);\s*\} else \{\s*setWorkOrders\(\[\]\);\s*\}/g,
    "setWorkOrders(apiRows.map((r, i) => enrichApiWorkOrder(r, i)));"
  );

  // Generic demo merge with demoNames
  out = out.replace(
    /const demoNames = new Set\(DEMO_\w+\.map\([^)]+\)\);\s*set\w+\(\[\s*\.\.\.DEMO_\w+,\s*\.\.\.(\w+)\.filter\([^)]+\)\s*\]\);/g,
    "set$1($1);"
  );

  // Customers specific
  out = out.replace(
    /setCustomers\(\[\s*\.\.\.DEMO_CUSTOMERS,\s*\.\.\.apiRows\.map\([^)]+\)\.filter\([^)]+\)\s*,?\s*\]\);/g,
    "setCustomers(apiRows.map((row, i) => enrichApiCustomer(row, i)));"
  );

  // DEMO_WO_SUMMARY fallback
  out = out.replace(
    /if \(!apiSummary && filtered\.length === DEMO_WORK_ORDERS\.length[^)]*\) return DEMO_WO_SUMMARY;/g,
    "if (!apiSummary && filtered.length === 0 && !Object.values(filters).some(Boolean)) return computeWorkOrderSummary([]);"
  );

  // Invoice sample
  out = out.replace(/if \(!detail\?\.invoice\) return SAMPLE_INVOICE_COPY;/g, "if (!detail?.invoice) return null;");
  out = out.replace(/return mergeWithSampleIfEmpty\([^)]+\);/g, "return mapDetailToInvoiceCopy(detail, settings || {});");

  // Remove unused DEMO_WORK_ORDERS import usage - keep import if still used for length check
  out = out.replace(/,\s*DEMO_WORK_ORDERS/g, "");

  return out;
}

let n = 0;
for (const file of walk(path.join(root, "pages"))) {
  let src = fs.readFileSync(file, "utf8");
  if (!/demoNums|DEMO_WORK_ORDERS|SAMPLE_INVOICE|mergeWithSample/.test(src)) continue;
  const next = fix(src);
  if (next !== src) {
    fs.writeFileSync(file, next);
    n++;
    console.log(path.relative(root, file));
  }
}

// customerOptions
const co = path.join(root, "utils/customerOptions.js");
if (fs.existsSync(co)) {
  let src = fs.readFileSync(co, "utf8");
  src = src.replace(/const demo = \[[\s\S]*?\];/g, "const demo = [];");
  src = src.replace(/return \[\.\.\.apiOptions, \.\.\.demo\];/g, "return apiOptions;");
  src = src.replace(/return demo;/g, "return [];");
  fs.writeFileSync(co, src);
  console.log("utils/customerOptions.js");
  n++;
}

console.log(`Pass 2: ${n} files`);
