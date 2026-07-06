import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import { getStockLedger } from "../../api/inventoryApi";

const TYPE_LABELS = {
  in: "Stock In",
  out: "Stock Out",
  adjustment: "Adjustment",
};

export default function StockLedger() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setLoading(true);
    getStockLedger()
      .then((res) => setEntries(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading stock ledger..." />;

  return (
    <div className="ui-stack">
      <PageHeader
        title="Stock Ledger"
        subtitle="Complete history of stock movements across warehouses."
        backTo="/inventory/raw-materials"
        backLabel="Inventory"
      />
      <div className="ui-card p-4 sm:p-6">
        <Table
          columns={[
            {
              key: "date",
              label: "Date",
              render: (r) =>
                r.date ? new Date(r.date).toLocaleString() : "—",
            },
            { key: "warehouse", label: "Warehouse" },
            { key: "item", label: "Item" },
            {
              key: "movement_type",
              label: "Type",
              render: (r) => TYPE_LABELS[r.movement_type] || r.movement_type,
            },
            { key: "quantity", label: "Quantity" },
          ]}
          data={entries}
        />
      </div>
    </div>
  );
}
