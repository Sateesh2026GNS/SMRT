import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Loader from "../../components/common/Loader";
import { getAccountsDashboard } from "../../api/accountsApi";
import useTenantId from "../../hooks/useTenantId";


const TEAL = "#0f766e";
const BLUE = "#1e40af";
const ORANGE = "#ea580c";
const YELLOW = "#eab308";
const GREY = "#4b5563";

const formatK = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`);

export default function AccountsDashboard() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    getAccountsDashboard(tenantId)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!data) return <div>No data</div>;

  const overdueData = data.overdue_by_days || [];
  const settlementData = data.monthly_settlement || [];

  const disputedData = [
    { name: "Disputed", value: data.disputed_share_pct || 5, color: "#9ca3af" },
    { name: "OK", value: 100 - (data.disputed_share_pct || 5), color: BLUE },
  ];

  const paperData = [
    { name: "Paper", value: data.paper_invoices || 0, color: "#9ca3af" },
    { name: "Paperless", value: data.paperless_conversion || 0, color: TEAL },
  ];

  const avgDonutData = [
    { name: "Settled", value: data.avg_days_to_settle || 26, color: TEAL },
    { name: "Remaining", value: 60 - (data.avg_days_to_settle || 26), color: "#374151" },
  ];

  const dayLateData = overdueData.slice(0, 20).map((d, i) => ({
    days: d.days,
    Electronic: Math.max(0, 25 - i * 0.5),
    Paper: Math.max(0, 35 - i * 0.8),
  }));

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100%", padding: 20 }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Accounts & Reports Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: TEAL, borderRadius: 12, padding: 20, color: "#fff" }}>
          <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>Overdue Invoice Count and Amount</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overdueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="days" stroke="#fff" tick={{ fill: "#fff", fontSize: 11 }} />
                <YAxis yAxisId="left" stroke={ORANGE} tick={{ fill: ORANGE }} />
                <YAxis yAxisId="right" orientation="right" stroke={YELLOW} tick={{ fill: YELLOW }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "none" }} />
                <Line yAxisId="left" type="monotone" dataKey="amount" stroke={ORANGE} strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke={YELLOW} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: "0.75rem", marginTop: 8 }}>Overdue from 1 to 45 days</div>
        </div>

        <div style={{ background: GREY, borderRadius: 12, padding: 20, color: "#fff" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{formatK(data.total_settlement || 0)}</div>
          <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>Total Settlement</div>
          <div style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={settlementData}>
                <Line type="monotone" dataKey="amount" stroke="#94a3b8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: "0.75rem" }}>Monthly Invoice Settlement</div>
        </div>

        <div style={{ background: BLUE, borderRadius: 12, padding: 20, color: "#fff" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{data.total_invoice_count || 0}</div>
          <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>Total Invoice Count</div>
          <div style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={disputedData} cx="50%" cy="50%" innerRadius={20} outerRadius={35} paddingAngle={2}>
                  {disputedData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: "0.75rem" }}>Disputed Invoices Share</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>Invoice Date</div>
          <input type="range" min="0" max="100" defaultValue="50" style={{ width: "100%" }} />
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>2015 May..2017 Apr</div>
          <div style={{ fontSize: "0.9rem", marginTop: 16, marginBottom: 8 }}>Due Date</div>
          <input type="range" min="0" max="100" defaultValue="50" style={{ width: "100%" }} />
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>2015 Jun..2017 May</div>
          <div style={{ fontSize: "0.9rem", marginTop: 16, marginBottom: 8 }}>Invoice Amount</div>
          <input type="range" min="0" max="100" defaultValue="50" style={{ width: "100%" }} />
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>$5..$130</div>
        </div>

        <div style={{ background: GREY, borderRadius: 12, padding: 20, color: "#fff" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{data.paperless_conversion || 1203}</div>
          <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>Paperless Conversion</div>
          <div style={{ height: 60 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={settlementData.slice(0, 12)}>
                <Line type="monotone" dataKey="amount" stroke="#94a3b8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: TEAL, borderRadius: 12, padding: 20, color: "#fff" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{data.paper_invoices || 1263}</div>
          <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>Paper Invoices</div>
          <div style={{ height: 60 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paperData} cx="50%" cy="50%" innerRadius={15} outerRadius={30} paddingAngle={2}>
                  {paperData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: "0.75rem" }}>Paper Invoices Share</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 16 }}>
        <div style={{ background: BLUE, borderRadius: 12, padding: 16, color: "#fff" }}>
          <div style={{ fontSize: "0.85rem", marginBottom: 8 }}>Associative Filters</div>
          <div style={{ fontSize: "0.8rem", marginBottom: 4 }}>Paperless Bill (none)</div>
          <div style={{ fontSize: "0.8rem", marginBottom: 4 }}>Disputed (none)</div>
          <div style={{ fontSize: "0.8rem" }}>State (none)</div>
        </div>

        <div style={{ background: TEAL, borderRadius: 12, padding: 20, color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{data.avg_days_to_settle || 26}</div>
          <div style={{ fontSize: "0.9rem" }}>Avg Days to Settle</div>
          <div style={{ height: 60, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={avgDonutData} cx="50%" cy="50%" innerRadius={18} outerRadius={28} paddingAngle={2}>
                  {avgDonutData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.9rem", marginBottom: 12, fontWeight: 600 }}>Day Late by Invoice Type</div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dayLateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="days" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Electronic" stroke={ORANGE} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Paper" stroke={YELLOW} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 12 }}>Day Late by State</div>
        <div style={{ height: 200, background: "#f8fafc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          Map visualization (States - PA, NY, NJ, etc.)
        </div>
      </div>
    </div>
  );
}