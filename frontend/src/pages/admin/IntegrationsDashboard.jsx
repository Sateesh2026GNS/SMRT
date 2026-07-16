import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import { useToast } from "../../context/ToastContext";
import {
  getBarcodeScanners,
  getAccountingSoftware,
  getIotMachineIntegrations,
  getApiIntegrations,
} from "../../api/integrationApi";

export default function IntegrationsDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [barcode, setBarcode] = useState(null);
  const [accounting, setAccounting] = useState(null);
  const [machines, setMachines] = useState([]);
  const [apiInfo, setApiInfo] = useState(null);

  useEffect(() => {
    Promise.all([
      getBarcodeScanners(),
      getAccountingSoftware(),
      getIotMachineIntegrations(),
      getApiIntegrations(),
    ])
      .then(([b, a, m, api]) => {
        setBarcode(b.data);
        setAccounting(a.data);
        setMachines(m.data || []);
        setApiInfo(api.data);
      })
      .catch((err) => {
        addToast(err.response?.data?.detail || "Failed to load integrations", "error");
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  if (loading) return <Loader label="Loading integrations..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Barcode coverage, accounting connectors, IoT machines, and API access."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500">Barcode coverage</p>
          <p className="mt-1 text-2xl font-bold">{barcode?.coverage_pct ?? 0}%</p>
          <p className="text-xs text-slate-400">
            {barcode?.barcoded_items ?? 0} / {barcode?.total_items ?? 0} items
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500">IoT-ready machines</p>
          <p className="mt-1 text-2xl font-bold">{machines.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500">API modules</p>
          <p className="mt-1 text-2xl font-bold">{apiInfo?.available_modules?.length ?? 0}</p>
          <p className="text-xs text-slate-400">{apiInfo?.auth}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 font-semibold">Accounting connectors</h2>
        <ul className="space-y-2">
          {(accounting?.connectors || []).map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2 dark:border-slate-700"
            >
              <span>{c.name}</span>
              <span className={c.connected ? "text-green-600" : "text-slate-400"}>
                {c.connected ? "Connected" : "Not connected"}
              </span>
            </li>
          ))}
        </ul>
        {accounting?.note && (
          <p className="mt-3 text-sm text-slate-500">{accounting.note}</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 font-semibold">IoT machine integrations</h2>
        <DataTable
          columns={[
            { key: "code", label: "Code" },
            { key: "name", label: "Name" },
            { key: "status", label: "Status", statusBadge: true },
            {
              key: "telemetry_enabled",
              label: "Telemetry",
              render: (r) => (r.telemetry_enabled ? "Enabled" : "Off"),
            },
          ]}
          data={machines}
          searchKeys={["code", "name", "status"]}
        />
      </div>
    </div>
  );
}
