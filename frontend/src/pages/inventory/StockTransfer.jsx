import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import {
  getInventoryDashboard,
  getWarehouses,
  recordStockMovement,
} from "../../api/inventoryApi";
import useTenantId from "../../hooks/useTenantId";



export default function StockTransfer() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    from_warehouse_id: "",
    to_warehouse_id: "",
    item_id: "",
    quantity: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [itemsRes, whRes] = await Promise.all([
          getInventoryDashboard(),
          getWarehouses(tenantId),
        ]);
        setItems(itemsRes.data || []);
        setWarehouses(whRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.from_warehouse_id === form.to_warehouse_id) {
      setMessage("Source and destination warehouses must be different.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        tenant_id: tenantId,
        item_id: Number(form.item_id),
        quantity: Number(form.quantity),
      };
      await recordStockMovement({
        ...payload,
        warehouse_id: Number(form.from_warehouse_id),
        movement_type: "out",
      });
      await recordStockMovement({
        ...payload,
        warehouse_id: Number(form.to_warehouse_id),
        movement_type: "in",
      });
      setMessage("Stock transferred successfully.");
      setForm({
        from_warehouse_id: "",
        to_warehouse_id: "",
        item_id: "",
        quantity: "",
      });
    } catch (err) {
      setMessage("Failed to transfer stock.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading..." />;

  return (
    <div style={{ maxWidth: "520px" }}>
      <h2>Stock Transfer</h2>
      <p style={{ color: "#64748b", marginTop: "8px" }}>
        Move stock between warehouses.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "12px", marginTop: "16px" }}
      >
        <label>
          From Warehouse
          <select
            value={form.from_warehouse_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, from_warehouse_id: e.target.value }))
            }
            required
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          >
            <option value="">Select</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          To Warehouse
          <select
            value={form.to_warehouse_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, to_warehouse_id: e.target.value }))
            }
            required
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          >
            <option value="">Select</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </label>
        <label>
          Item
          <select
            value={form.item_id}
            onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))}
            required
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          >
            <option value="">Select</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.sku} - {i.name} (Stock: {i.total_quantity ?? 0})
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input
            type="number"
            value={form.quantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: e.target.value }))
            }
            required
            min="1"
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </label>
        {message && (
          <div
            style={{
              color: message.includes("Failed") || message.includes("must")
                ? "#b91c1c"
                : "#166534",
            }}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 16px",
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {submitting ? "Transferring..." : "Transfer Stock"}
        </button>
      </form>
    </div>
  );
}