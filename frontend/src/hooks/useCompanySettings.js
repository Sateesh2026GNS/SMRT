import { useCallback, useEffect, useState } from "react";

import { getCompanySettings, updateCompanySettings } from "../api/settingsApi";
import { useToast } from "../context/ToastContext";

/**
 * Loads and patches tenant company settings via `/settings/company`.
 * Each settings sub-page can save only the fields it owns.
 */
export function useCompanySettings() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCompanySettings();
      setSettings(res.data || {});
      return res.data;
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to load company settings", "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const res = await updateCompanySettings(payload);
        setSettings(res.data || {});
        addToast("Settings saved");
        return res.data;
      } catch (err) {
        addToast(err.response?.data?.detail || "Failed to save settings", "error");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { settings, loading, saving, save, reload: load, setSettings };
}
