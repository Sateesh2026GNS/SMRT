import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { getMachines } from "../../api/productionApi";
import useTenantId from "../../hooks/useTenantId";



export default function MachineStatus() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    const loadMachines = async () => {
      setLoading(true);
      try {
        const response = await getMachines(tenantId);
        setMachines(response.data || []);
      } catch (error) {
        console.error("Failed to load machines", error);
      } finally {
        setLoading(false);
      }
    };

    loadMachines();
  }, []);

  if (loading) {
    return <Loader label={t("production.loadingMachines")} />;
  }

  const newMachineAction = (
    <Link to="/production/machines/create" className="ui-btn-primary">
      <Plus className="h-4 w-4" />
      {t("production.newMachine", { defaultValue: "New machine" })}
    </Link>
  );

  if (machines.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("production.machineStatus")}
          subtitle={t("production.machineStatusSubtitle")}
          action={newMachineAction}
        />
        <EmptyState
          icon="cpu"
          title={t("production.noMachinesAvailable")}
          description={t("production.addMachineToTrack")}
          actionLabel={t("production.addMachine", { defaultValue: "Add machine" })}
          actionHref="/production/machines/create"
        />
      </div>
    );
  }

  const statusStyles = {
    running: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200",
    down: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200",
    maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
    idle: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border-slate-200",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("production.machineStatus")}
        subtitle={t("production.machineStatusSubtitle")}
        action={newMachineAction}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {machine.name}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {machine.code} · {machine.location || t("production.unassigned")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                  statusStyles[machine.status] || statusStyles.idle
                }`}
              >
                {machine.status}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  machine.status === "running" ? "bg-green-500 animate-pulse" :
                  machine.status === "down" ? "bg-red-500" :
                  machine.status === "maintenance" ? "bg-amber-500" : "bg-slate-400"
                }`}
              />
              <span className="text-xs text-slate-500 capitalize">{machine.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}