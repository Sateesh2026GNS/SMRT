import { useCallback, useEffect, useState } from "react";

import { getNotifications } from "../api/alertsApi";
import useAuth from "./useAuth";

const POLL_MS = 60_000;

export default function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getNotifications();
      setCount(res.data?.count ?? 0);
      setNotifications(res.data?.notifications ?? res.data?.alerts ?? []);
    } catch {
      setCount(0);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
    if (!isAuthenticated) return undefined;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh, isAuthenticated]);

  return { count, notifications, loading, refresh };
}
