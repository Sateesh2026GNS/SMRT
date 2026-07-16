import { useCallback, useEffect, useState } from "react";

import { getErpDashboard } from "../api/dashboardApi";

export default function useErpDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    return getErpDashboard()
      .then((res) => {
        setData(res.data ?? null);
      })
      .catch((err) => {
        setData(null);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
