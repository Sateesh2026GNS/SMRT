import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getShifts } from "../../api/hrApi";
import useTenantId from "../../hooks/useTenantId";



function formatTime(t) {
  if (!t) return "-";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export default function Shifts() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    getShifts(tenantId)
      .then((r) => setShifts(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading shifts..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Shift Management</h2>
        <Link to="/hr/shifts/create">Create Shift</Link>
      </div>
      <div style={{ background: "#fff", padding: "16px", borderRadius: "10px" }}>
        <Table
          columns={[
            { key: "name", label: "Name" },
            {
              key: "start_time",
              label: "Start",
              render: (r) => formatTime(r.start_time),
            },
            {
              key: "end_time",
              label: "End",
              render: (r) => formatTime(r.end_time),
            },
            { key: "break_minutes", label: "Break (min)" },
            { key: "capacity_hours", label: "Capacity (h)" },
          ]}
          data={shifts}
        />
      </div>
    </div>
  );
}