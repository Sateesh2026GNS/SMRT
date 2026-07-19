/** Third pass: remove demo+API row merges */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pages = path.join(__dirname, "../src/pages");

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (n.endsWith(".jsx")) a.push(p);
  }
  return a;
}

const replacements = [
  // WorkOrders
  [
    /if \(apiRows\.length > 0\) \{\s*const enriched = apiRows\.map\(\(r, i\) => enrichApiWorkOrder\(r, i\)\);\s*const demoNums = new Set\(DEMO_WORK_ORDERS\.map\(\(w\) => w\.work_order_number\)\);\s*setWorkOrders\(\[\.\.\.DEMO_WORK_ORDERS, \.\.\.enriched\.filter\(\(w\) => !demoNums\.has\(w\.work_order_number\)\)\]\);\s*\} else \{\s*setWorkOrders\(\[\]\);\s*\}/s,
    "setWorkOrders(apiRows.map((r, i) => enrichApiWorkOrder(r, i)));",
  ],
  [
    /if \(!apiSummary && filtered\.length === DEMO_WORK_ORDERS\.length[^)]*\) return DEMO_WO_SUMMARY;/,
    "if (!apiSummary && filtered.length === 0 && !Object.values(filters).some(Boolean)) return computeWorkOrderSummary([]);",
  ],
  // ProductionPlanning
  [
    /if \(apiRows\.length > 0\) \{\s*const enriched = apiRows\.map\(\(r, i\) => enrichApiOrder\(r, i\)\);\s*const demoNums = new Set\(DEMO_PRODUCTION_ORDERS\.map\(\(o\) => o\.order_number\)\);\s*setOrders\(\[\s*\.\.\.DEMO_PRODUCTION_ORDERS,\s*\.\.\.enriched\.filter\(\(o\) => !demoNums\.has\(o\.order_number\)\),\s*\]\);\s*\} else \{\s*setOrders\(\[\]\);\s*\}/s,
    "setOrders(apiRows.map((r, i) => enrichApiOrder(r, i)));",
  ],
  [
    /if \(!apiSummary && filteredOrders\.length === DEMO_PRODUCTION_ORDERS\.length[^)]*\) \{\s*return DEMO_SUMMARY;\s*\}/,
    "if (!apiSummary && filteredOrders.length === 0 && !Object.values(filters).some(Boolean)) { return computePlanningSummary([]); }",
  ],
  // BomMaster
  [
    /if \(apiRows\.length > 0\) \{\s*const fromApi = groupApiBomRows\(apiRows\);\s*const demoNums = new Set\(DEMO_BOMS\.map\(\(b\) => b\.product_code\)\);\s*setBoms\(\[\.\.\.DEMO_BOMS, \.\.\.fromApi\.filter\(\(b\) => !demoNums\.has\(b\.product_code\)\)\]\);\s*\} else \{\s*setBoms\(\[\]\);\s*\}/s,
    "setBoms(groupApiBomRows(apiRows));",
  ],
  // MachineStatus
  [
    /const demoCodes = new Set\(DEMO_MACHINES\.map\(\(m\) => m\.code\)\);\s*setMachines\(\[\s*\.\.\.DEMO_MACHINES,\s*\.\.\.apiRows\.map\(\(row, i\) => enrichApiMachine\(row, i\)\)\.filter\(\(m\) => !demoCodes\.has\(m\.code\)\),\s*\]\);/s,
    "setMachines(apiRows.map((row, i) => enrichApiMachine(row, i)));",
  ],
];

let n = 0;
for (const file of walk(pages)) {
  let src = fs.readFileSync(file, "utf8");
  if (!/\.\.\.DEMO_|demoNums|demoCodes|demoNames/.test(src)) continue;
  const orig = src;

  for (const [re, rep] of replacements) src = src.replace(re, rep);

  // Generic: [...DEMO_X, ...api.filter] blocks
  src = src.replace(
    /set(\w+)\(\[\s*\.\.\.DEMO_\w+,\s*\.\.\.(\w+)\.filter\([^)]+\)\s*,?\s*\]\)/g,
    "set$1($2)"
  );

  // Customers enrich only
  src = src.replace(
    /const demoNames = new Set\(DEMO_CUSTOMERS\.map\(\(c\) => c\.company\)\);\s*setCustomers\(\[\s*\.\.\.DEMO_CUSTOMERS,\s*\.\.\.apiRows\.map\(\(row, i\) => enrichApiCustomer\(row, i\)\)\.filter\(\(c\) => !demoNames\.has\(c\.company\)\),\s*\]\);/s,
    "setCustomers(apiRows.map((row, i) => enrichApiCustomer(row, i)));"
  );

  if (src !== orig) {
    fs.writeFileSync(file, src);
    n++;
    console.log(path.relative(pages, file));
  }
}

// customerOptions
const co = path.join(__dirname, "../src/utils/customerOptions.js");
let s = fs.readFileSync(co, "utf8");
s = s.replace(/import \{ DEMO_CUSTOMERS \}[^\n]+\n/, "");
s = s.replace(/return DEMO_CUSTOMERS\.map\([^)]+\);/g, "return [];");
fs.writeFileSync(co, s);
console.log("customerOptions.js");
n++;

console.log(`Pass 3: ${n}`);
