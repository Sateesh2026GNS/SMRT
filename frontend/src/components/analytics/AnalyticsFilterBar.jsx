import {
  FISCAL_YEARS, QUARTERS, MONTHS, PLANTS, DEPARTMENTS,
  WAREHOUSES, PRODUCTS, CUSTOMERS, MACHINES,
} from "../../data/analyticsMasterData";

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        {options.map((o) => (
          <option key={o} value={o === o.replace?.(/^All /, "") ? o : o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function AnalyticsFilterBar({
  fiscalYear, onFiscalYearChange,
  month, onMonthChange,
  quarter, onQuarterChange,
  plant, onPlantChange,
  department, onDepartmentChange,
  warehouse, onWarehouseChange,
  product, onProductChange,
  customer, onCustomerChange,
  machine, onMachineChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  showAll = true,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Global Filters</p>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Date From</label>
          <input type="date" value={dateFrom || ""} onChange={(e) => onDateFromChange?.(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Date To</label>
          <input type="date" value={dateTo || ""} onChange={(e) => onDateToChange?.(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>
        <SelectField label="Fiscal Year" value={fiscalYear} onChange={onFiscalYearChange} options={FISCAL_YEARS} />
        <SelectField label="Month" value={month} onChange={onMonthChange} options={MONTHS} />
        <SelectField label="Quarter" value={quarter} onChange={onQuarterChange} options={QUARTERS} />
        <SelectField label="Plant" value={plant} onChange={onPlantChange} options={PLANTS} />
        {showAll && (
          <>
            <SelectField label="Department" value={department} onChange={onDepartmentChange} options={DEPARTMENTS} />
            <SelectField label="Warehouse" value={warehouse} onChange={onWarehouseChange} options={WAREHOUSES} />
            <SelectField label="Product" value={product} onChange={onProductChange} options={PRODUCTS} />
            <SelectField label="Customer" value={customer} onChange={onCustomerChange} options={CUSTOMERS} />
            <SelectField label="Machine" value={machine} onChange={onMachineChange} options={MACHINES} />
          </>
        )}
      </div>
    </div>
  );
}
