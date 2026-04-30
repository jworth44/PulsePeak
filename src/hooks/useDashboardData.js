import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

export function useDashboardData() {
  const { token, seedWorkoutHistory, syncSavedWorkoutIds } = useAuth();
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const payload = await apiRequest("/dashboard", {}, token);
      const normalized = normalizeDashboardPayload(payload);
      setData(normalized.data);
      setSummary(normalized.summary);
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

  useEffect(() => {
    if (!summary) {
      return;
    }

    syncSavedWorkoutIds((summary.savedWorkouts || []).map((workout) => String(workout.presetId || workout.id || "").trim()).filter(Boolean));
    seedWorkoutHistory(summary.recentWorkouts || []);
  }, [seedWorkoutHistory, summary, syncSavedWorkoutIds]);

  const mutate = async (path, options = {}) => {
    const payload = await apiRequest(path, options, token);
    const normalized = normalizeDashboardPayload(payload);
    setData(normalized.data);
    setSummary(normalized.summary);
    return normalized;
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

function normalizeDashboardPayload(payload = {}) {
  const data = payload.data || {};
  const summary = payload.summary || {};

  return {
    ...payload,
    data: {
      profile: data.profile || {},
      meals: Array.isArray(data.meals) ? data.meals : [],
      weightHistory: Array.isArray(data.weightHistory) ? data.weightHistory : [],
      waterIntake: data.waterIntake || 0,
      goals: data.goals || {},
      ...data
    },
    summary: {
      activeModules: Array.isArray(summary.activeModules) ? summary.activeModules : [],
      habits: Array.isArray(summary.habits) ? summary.habits : [],
      savedWorkouts: Array.isArray(summary.savedWorkouts) ? summary.savedWorkouts : [],
      recentWorkouts: Array.isArray(summary.recentWorkouts) ? summary.recentWorkouts : [],
      weeklyHistory: Array.isArray(summary.weeklyHistory) ? summary.weeklyHistory : [],
      planSummary: summary.planSummary || {},
      workoutEngine: summary.workoutEngine || {},
      workoutAccess: summary.workoutAccess || {},
      nutritionGuidance: summary.nutritionGuidance || {},
      mobilityModule: summary.mobilityModule || {},
      weeklyCheckIn: summary.weeklyCheckIn || {},
      resultProjection: summary.resultProjection || {},
      todayFocus: summary.todayFocus || {},
      whyThisWorks: summary.whyThisWorks || {},
      ...summary
    }
  };
}
