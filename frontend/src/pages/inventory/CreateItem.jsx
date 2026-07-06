import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Package, AlertTriangle, ArrowLeft } from "lucide-react";

import { createInventoryItem, getSuppliers } from "../../api/inventoryApi";
import { Input, Select, FormRow } from "../../components/common/FormField";
import useTenantId from "../../hooks/useTenantId";



export default function CreateItem() {
  const tenantId = useTenantId();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get("type") === "finished_good"
    ? "finished_good"
    : "raw_material";
  const backPath = defaultType === "finished_good"
    ? "/inventory/finished-goods"
    : "/inventory/raw-materials";
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    tenant_id: tenantId,
    supplier_id: "",
    sku: "",
    barcode: "",
    name: "",
    description: "",
    unit: "pcs",
    unit_cost: "",
    reorder_level: "0",
    item_type: defaultType,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getSuppliers(tenantId)
      .then((r) => setSuppliers(r.data || []))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name?.trim()) errs.name = "Name is required";
    if (!form.sku?.trim()) errs.sku = "SKU is required";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setError("");
    try {
      await createInventoryItem({
        ...form,
        supplier_id: form.supplier_id || null,
        unit_cost: form.unit_cost ? Number(form.unit_cost) : null,
        reorder_level: Number(form.reorder_level) || 0,
      });
      navigate(backPath);
    } catch (err) {
      setError("Failed to create item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Create Inventory Item
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add a new product or material to your inventory.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <FormRow>
            <Input
              label="SKU"
              required
              placeholder="e.g. SKU-001"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              error={fieldErrors.sku}
              hint="Unique stock keeping unit"
            />
            <Input
              label="Barcode"
              placeholder="Optional barcode"
              value={form.barcode}
              onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
            />
          </FormRow>

          <Input
            label="Name"
            required
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={fieldErrors.name}
          />

          <Input
            label="Description"
            placeholder="Brief description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <FormRow>
            <Select
              label="Item Type"
              value={form.item_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, item_type: e.target.value }))
              }
              options={[
                { value: "raw_material", label: "Raw Material" },
                { value: "finished_good", label: "Finished Good" },
              ]}
            />
            <Input
              label="Unit"
              placeholder="pcs, kg, L, etc."
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              hint="Default: pcs"
            />
            <Input
              label="Unit Cost (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.unit_cost}
              onChange={(e) => setForm((f) => ({ ...f, unit_cost: e.target.value }))}
            />
          </FormRow>

          <FormRow>
            <Input
              label="Reorder Level"
              type="number"
              min="0"
              placeholder="0"
              value={form.reorder_level}
              onChange={(e) => setForm((f) => ({ ...f, reorder_level: e.target.value }))}
              hint="Alert when stock falls below this"
            />
            <Select
              label="Supplier"
              value={form.supplier_id}
              onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="None"
            />
          </FormRow>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:from-teal-600 hover:to-teal-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              <Package className="h-4 w-4" />
              {saving ? "Saving..." : "Create Item"}
            </button>
            <Link
              to={backPath}
              className="rounded-xl border border-slate-200 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}