import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

export function useDashboardData() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const payload = await apiRequest("/dashboard", {}, token);
      setData(payload.data);
      setSummary(payload.summary);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadDashboard();
  }, [token]);

  const mutate = async (path, options = {}) => {
    const payload = await apiRequest(path, options, token);
    setData(payload.data);
    setSummary(payload.summary);
    return payload;
  };

  return {
    data,
    summary,
    loading,
    error,
    reload: loadDashboard,
    mutate
  };
}
