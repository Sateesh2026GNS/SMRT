import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import StoreManagerNav from "../../components/inventory/StoreManagerNav";
import Table from "../../components/common/Table";
import {
  getInventoryDashboard,
  getWarehouses,
} from "../../api/inventoryApi";
import useTenantId from "../../hooks/useTenantId";



const cardStyle = {
  background: "#fff",
  borderRadius: "10px",
  padding: "16px",
  boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
};

export default function InventoryDashboard() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, whRes] = await Promise.all([
          getInventoryDashboard(),
          getWarehouses(tenantId),
        ]);
        setDashboard(dashRes.data || []);
        setWarehouses(whRes.data || []);
      } catch (error) {
        console.error("Failed to load inventory dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <StoreManagerNav />
        <Loader label="Loading inventory dashboard..." />
      </div>
    );
  }

  const lowStockCount = dashboard.filter((i) => i.needs_reorder).length;
  const totalValue = dashboard.reduce(
    (sum, i) => sum + (i.stock_value || 0),
    0
  );
  const warehouseUtilization = warehouses.length
    ? Math.min(100, Math.round((dashboard.length / (warehouses.length * 10)) * 100))
    : 0;

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <StoreManagerNav />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Inventory Dashboard</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/inventory/raw-materials">View Items</Link>
          <Link
            to="/inventory/items/create?type=raw_material"
            className="ui-btn-primary"
          >
            <Plus className="h-4 w-4" />
            New Material
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(3, 1fr)" }}>
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "8px", fontSize: "0.9rem" }}>Low Stock Alerts</h3>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: lowStockCount ? "#b91c1c" : "#166534" }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            items below reorder level
          </div>
        </section>
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "8px", fontSize: "0.9rem" }}>Total Stock Value</h3>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            ${(totalValue / 1000).toFixed(1)}K
          </div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            across {dashboard.length} items
          </div>
        </section>
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "8px", fontSize: "0.9rem" }}>Warehouse Utilization</h3>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{warehouseUtilization}%</div>
          <div
            style={{
              height: "8px",
              background: "#e5e7eb",
              borderRadius: "4px",
              marginTop: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${warehouseUtilization}%`,
                height: "100%",
                background: "#6366f1",
                transition: "width 0.3s",
              }}
            />
          </div>
        </section>
      </div>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: "12px" }}>In Stock</h3>
        <Table
          columns={[
            {
              key: "reorder",
              label: "Status",
              render: (r) => (
                <span
                  style={{
                    background: r.needs_reorder ? "#fef3c7" : "#dcfce7",
                    color: r.needs_reorder ? "#92400e" : "#166534",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                  }}
                >
                  {r.needs_reorder ? "REORDER" : "OK"}
                </span>
              ),
            },
            { key: "sku", label: "SKU" },
            { key: "barcode", label: "Barcode" },
            { key: "name", label: "Name" },
            {
              key: "total_quantity",
              label: "In Stock",
              render: (r) => r.total_quantity,
            },
            {
              key: "reorder_level",
              label: "Reorder Level",
            },
            {
              key: "stock_value",
              label: "Stock Value",
              render: (r) =>
                r.stock_value != null ? `$${r.stock_value.toLocaleString()}` : "-",
            },
          ]}
          data={dashboard.slice(0, 10)}
        />
      </section>
    </div>
  );
}