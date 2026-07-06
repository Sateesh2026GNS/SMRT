import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getCustomers } from "../../api/salesApi";
import useTenantId from "../../hooks/useTenantId";



export default function Customers() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    getCustomers(tenantId)
      .then((r) => setCustomers(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading customers..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Customer Management</h2>
        <Link
          to="/sales/customers/create"
          style={{
            padding: "10px 18px",
            background: "#14b8a6",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + New Customer
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
        }}
      >
        <Table
          columns={[
            { key: "name", label: "Company / Name" },
            { key: "contact_name", label: "Contact" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "gstin", label: "GSTIN" },
            { key: "state", label: "State" },
          ]}
          data={customers}
        />
      </div>
    </div>
  );
}