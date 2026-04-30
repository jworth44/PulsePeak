import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { ACCESS_TIERS, hasFullWorkoutAccess, normalizeAccessTier } from "../../shared/entitlements";
import { getWorkoutLoadBand } from "../../shared/workoutEngine";

const AuthContext = createContext(null);
const TOKEN_KEY = "pulsepeak-auth-token";
const WORKOUT_MEMORY_LIMIT = 8;
const COMPLETION_RECORD_LIMIT = 12;
const DEFAULT_WORKOUT_MEMORY = {
  lastCompletedWorkoutId: null,
  lastCompletedAt: null,
  lastWorkoutCategory: null,
  recentlyCompletedWorkoutIds: [],
  recentCategories: [],
  savedWorkoutIds: [],
  completionRecords: []
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [workoutMemory, setWorkoutMemory] = useState(DEFAULT_WORKOUT_MEMORY);
  const accessTier = React.useMemo(() => normalizeAccessTier(user?.accessTier), [user]);
  const isTrial = accessTier === ACCESS_TIERS.TRIAL;
  const isPremium = React.useMemo(() => {
    if (!user) {
      return false;
    }

    const tier = String(user.tier || "").toLowerCase().trim();
    const status = String(user.subscriptionStatus || "").toLowerCase().trim();

    return hasFullWorkoutAccess(accessTier) || tier === ACCESS_TIERS.PREMIUM || status === "active" || status === "trialing";
  }, [accessTier, user]);
  const needsOnboarding = React.useMemo(() => {
    if (!user) {
      return false;
    }

    return !user.onboardingCompleted || !user.profileComplete;
  }, [user]);
  const workoutMemoryKey = React.useMemo(() => (user?.id ? `pulsepeak-workout-memory:${user.id}` : null), [user?.id]);
  const workoutMomentum = useMemo(() => deriveWorkoutMomentum(workoutMemory.completionRecords), [workoutMemory.completionRecords]);
  const workoutMilestones = [];

  useEffect(() => {
    if (!workoutMemoryKey) {
      setWorkoutMemory(DEFAULT_WORKOUT_MEMORY);
      return;
    }

    try {
      const raw = window.localStorage.getItem(workoutMemoryKey);
      setWorkoutMemory(raw ? normalizeWorkoutMemory(JSON.parse(raw)) : DEFAULT_WORKOUT_MEMORY);
    } catch {
      setWorkoutMemory(DEFAULT_WORKOUT_MEMORY);
    }
  }, [workoutMemoryKey]);

  useEffect(() => {
    if (!workoutMemoryKey) {
      return;
    }
    window.localStorage.setItem(workoutMemoryKey, JSON.stringify(normalizeWorkoutMemory(workoutMemory)));
  }, [workoutMemory, workoutMemoryKey]);

  const refreshSession = async (activeToken = token) => {
    if (!activeToken) {
      return null;
    }

    const payload = await apiRequest("/auth/session", {}, activeToken);
    setUser(payload.user);
    setDashboard(payload.dashboard);
    return payload;
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    refreshSession(token)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const authenticate = async (mode, formState) => {
    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const payload = await apiRequest(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(formState)
      }
    );

    window.localStorage.setItem(TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
    setDashboard(payload.dashboard);
    return payload;
  };

  const logout = async () => {
    if (token) {
      await apiRequest("/auth/logout", { method: "POST" }, token);
    }

    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setDashboard(null);
    setWorkoutMemory(DEFAULT_WORKOUT_MEMORY);
  };

  const recordWorkoutCompletion = (workout, details = {}) => {
    const workoutId = String(workout?.presetId || workout?.id || details.workoutId || "").trim();
    if (!workoutId) {
      return;
    }

    const completedAt = details.completedAt || new Date().toISOString();
    const category = details.category || workout?.focus || workout?.focusLabel || workout?.type || "training";
    const duration = details.duration || workout?.duration || null;
    const intensity = details.intensity || workout?.intensity || null;
    const loadBand = details.loadBand || getWorkoutLoadBand(workout || details);

    setWorkoutMemory((current) => {
      const recentIds = [workoutId, ...(current.recentlyCompletedWorkoutIds || []).filter((entry) => entry !== workoutId)].slice(0, WORKOUT_MEMORY_LIMIT);
      const recentCategories = [category, ...(current.recentCategories || []).filter((entry) => entry !== category)].slice(0, WORKOUT_MEMORY_LIMIT);
      const completionRecords = [
        {
          workoutId,
          workoutName: workout?.name || details.workoutName || "Workout",
          category,
          duration,
          intensity,
          loadBand,
          completedAt
        },
        ...(current.completionRecords || []).filter((entry) => entry.workoutId !== workoutId || entry.completedAt !== completedAt)
      ].slice(0, COMPLETION_RECORD_LIMIT);

      return normalizeWorkoutMemory({
        ...current,
        lastCompletedWorkoutId: workoutId,
        lastCompletedAt: completedAt,
        lastWorkoutCategory: category,
        recentlyCompletedWorkoutIds: recentIds,
        recentCategories,
        completionRecords
      });
    });
  };

  const syncSavedWorkoutIds = (ids = []) => {
    setWorkoutMemory((current) => {
      const next = normalizeWorkoutMemory({
        ...current,
        savedWorkoutIds: Array.isArray(ids) ? ids.filter(Boolean) : []
      });
      return JSON.stringify(next.savedWorkoutIds) === JSON.stringify(current.savedWorkoutIds) ? current : next;
    });
  };

  const seedWorkoutHistory = (workouts = []) => {
    setWorkoutMemory((current) => {
      if (current.completionRecords?.length) {
        return current;
      }
      const seededRecords = (Array.isArray(workouts) ? workouts : [])
        .filter((workout) => workout?.id || workout?.presetId)
        .slice(0, COMPLETION_RECORD_LIMIT)
        .map((workout) => ({
          workoutId: String(workout.presetId || workout.id),
          workoutName: workout.name || "Workout",
          category: workout.focus || workout.focusLabel || workout.type || "training",
          duration: workout.duration || null,
          intensity: workout.intensity || null,
          loadBand: getWorkoutLoadBand(workout),
          completedAt: workout.loggedAt || workout.completedAt || new Date().toISOString()
        }));

      if (!seededRecords.length) {
        return current;
      }

      return normalizeWorkoutMemory({
        ...current,
        lastCompletedWorkoutId: seededRecords[0].workoutId,
        lastCompletedAt: seededRecords[0].completedAt,
        lastWorkoutCategory: seededRecords[0].category,
        recentlyCompletedWorkoutIds: seededRecords.map((entry) => entry.workoutId).slice(0, WORKOUT_MEMORY_LIMIT),
        recentCategories: seededRecords.map((entry) => entry.category).slice(0, WORKOUT_MEMORY_LIMIT),
        completionRecords: seededRecords
      });
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        accessTier,
        isTrial,
        isPremium,
        needsOnboarding,
        dashboard,
        setDashboard,
        workoutMemory,
        workoutMomentum,
        workoutMilestones,
        recordWorkoutCompletion,
        syncSavedWorkoutIds,
        seedWorkoutHistory,
        setUser,
        authenticate,
        logout,
        refreshSession,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function normalizeWorkoutMemory(value = {}) {
  return {
    ...DEFAULT_WORKOUT_MEMORY,
    ...value,
    recentlyCompletedWorkoutIds: Array.isArray(value.recentlyCompletedWorkoutIds)
      ? value.recentlyCompletedWorkoutIds.filter(Boolean).slice(0, WORKOUT_MEMORY_LIMIT)
      : [],
    recentCategories: Array.isArray(value.recentCategories)
      ? value.recentCategories.filter(Boolean).slice(0, WORKOUT_MEMORY_LIMIT)
      : [],
    savedWorkoutIds: Array.isArray(value.savedWorkoutIds) ? value.savedWorkoutIds.filter(Boolean) : [],
    completionRecords: Array.isArray(value.completionRecords)
      ? value.completionRecords.slice(0, COMPLETION_RECORD_LIMIT).map((entry) => ({
          ...entry,
          loadBand: entry?.loadBand || (entry?.intensity ? getWorkoutLoadBand(entry) : "moderate")
        }))
      : []
  };
}

function deriveWorkoutMomentum(completionRecords = []) {
  const uniqueDates = Array.from(
    new Set(
      (Array.isArray(completionRecords) ? completionRecords : [])
        .map((record) => toLocalDateKey(record?.completedAt))
        .filter(Boolean)
    )
  ).sort((left, right) => new Date(right).getTime() - new Date(left).getTime());

  const todayKey = toLocalDateKey(new Date().toISOString());
  const lastActiveDate = uniqueDates[0] || null;
  const sessionsThisWeek = (Array.isArray(completionRecords) ? completionRecords : []).filter((record) =>
    isSameLocalWeek(record?.completedAt, new Date())
  ).length;

  if (!uniqueDates.length) {
    return {
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActiveDate: null,
      weeklyCompletionCount: 0,
      trainedToday: false
    };
  }

  let currentStreakDays = 1;
  for (let index = 1; index < uniqueDates.length; index += 1) {
    if (differenceInDays(uniqueDates[index - 1], uniqueDates[index]) === 1) {
      currentStreakDays += 1;
    } else {
      break;
    }
  }

  if (differenceInDays(todayKey, lastActiveDate) > 1) {
    currentStreakDays = 0;
  }

  let runningLongest = 1;
  let runningCurrent = 1;
  for (let index = 1; index < uniqueDates.length; index += 1) {
    if (differenceInDays(uniqueDates[index - 1], uniqueDates[index]) === 1) {
      runningCurrent += 1;
      runningLongest = Math.max(runningLongest, runningCurrent);
    } else {
      runningCurrent = 1;
    }
  }

  return {
    currentStreakDays,
    longestStreakDays: runningLongest,
    lastActiveDate,
    weeklyCompletionCount: sessionsThisWeek,
    trainedToday: lastActiveDate === todayKey
  };
}

function toLocalDateKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function differenceInDays(leftKey, rightKey) {
  return Math.round((new Date(leftKey).getTime() - new Date(rightKey).getTime()) / (1000 * 60 * 60 * 24));
}

function isSameLocalWeek(value, referenceDate) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return false;
  }

  const startOfReferenceWeek = getStartOfWeek(referenceDate);
  const endOfReferenceWeek = new Date(startOfReferenceWeek);
  endOfReferenceWeek.setDate(endOfReferenceWeek.getDate() + 7);
  return date >= startOfReferenceWeek && date < endOfReferenceWeek;
}

function getStartOfWeek(date) {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + offset);
  return current;
}
