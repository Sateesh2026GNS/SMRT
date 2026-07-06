import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import {
  getDispatchOrders,
  getDeliveryStatus,
} from "../../api/dispatchApi";
import { updateSalesOrderDispatch } from "../../api/salesApi";

const cardStyle = {
  background: "#fff",
  borderRadius: "10px",
  padding: "16px",
  border: "1px solid #e5e7eb",
};

export default function Dispatch() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getDispatchOrders(), getDeliveryStatus()])
      .then(([ordersRes, statsRes]) => {
        setOrders(ordersRes.data || []);
        setStats(statsRes.data || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDispatch = async (orderId, shipped) => {
    try {
      await updateSalesOrderDispatch(orderId, { shipped });
      addToast(shipped ? "Marked as shipped" : "Shipment reverted");
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || "Update failed", "error");
    }
  };

  if (loading) return <Loader label="Loading dispatch..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck className="h-6 w-6 text-teal-600" />
            Dispatch
          </h2>
          <p style={{ color: "#64748b", marginTop: "4px" }}>
            Packed orders ready for dispatch and shipment tracking.
          </p>
        </div>
        <Link to="/sales/orders" className="ui-btn-primary">
          View sales orders
        </Link>
      </div>

      {stats && (
        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}
        >
          {[
            ["Total orders", stats.total_orders],
            ["Pending pack", stats.pending],
            ["Packed", stats.packed],
            ["Shipped", stats.shipped],
          ].map(([label, value]) => (
            <div key={label} style={cardStyle}>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value ?? 0}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...cardStyle, padding: "16px" }}>
        <Table
          columns={[
            { key: "order_number", label: "Order #" },
            { key: "customer", label: "Customer" },
            {
              key: "order_date",
              label: "Date",
              render: (r) =>
                r.order_date ? String(r.order_date).slice(0, 10) : "—",
            },
            {
              key: "total_amount",
              label: "Amount",
              render: (r) =>
                r.total_amount != null
                  ? `₹${Number(r.total_amount).toLocaleString()}`
                  : "—",
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    background: r.shipped ? "#dcfce7" : "#fef3c7",
                    color: r.shipped ? "#166534" : "#92400e",
                  }}
                >
                  {r.shipped ? "Shipped" : "Ready to dispatch"}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Action",
              render: (r) =>
                r.shipped ? (
                  <button
                    type="button"
                    onClick={() => handleDispatch(r.id, false)}
                    className="text-xs text-slate-600 hover:underline"
                  >
                    Undo ship
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDispatch(r.id, true)}
                    className="rounded-lg border border-teal-200 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                  >
                    Mark shipped
                  </button>
                ),
            },
          ]}
          data={orders}
        />
        {orders.length === 0 && (
          <p style={{ textAlign: "center", color: "#64748b", padding: "24px 0" }}>
            No packed orders awaiting dispatch. Mark sales orders as packed first.
          </p>
        )}
      </div>
    </div>
  );
}
