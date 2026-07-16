import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, MapPin } from "lucide-react";

import { getWarehouses } from "../../api/inventoryApi";
import { useToast } from "../../context/ToastContext";

export default function SettingsDeliveryLocation() {
  const { addToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getWarehouses();
        if (active) setLocations(res.data || []);
      } catch (err) {
        if (active)
          addToast(err.response?.data?.detail || "Failed to load delivery locations", "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [addToast]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Delivery Locations
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Warehouses and storage sites used as delivery destinations.
          </p>
        </div>
        <Link
          to="/inventory/warehouses/create"
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Link>
      </div>

      <div className="space-y-4">
        {locations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-500 dark:border-slate-700">
            No delivery locations yet. Create a warehouse to define delivery sites.
          </div>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {loc.name || loc.code || `Warehouse #${loc.id}`}
                  </h3>
                  {loc.location && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {loc.location}
                    </p>
                  )}
                  {loc.code && (
                    <p className="mt-1 text-xs text-slate-500">Code: {loc.code}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
