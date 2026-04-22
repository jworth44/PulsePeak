import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);
const TOKEN_KEY = "pulsepeak-auth-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const accessTier = React.useMemo(() => {
    if (!user) {
      return "free";
    }

    const normalized = String(user.accessTier || "").toLowerCase().trim();
    if (normalized === "trial" || normalized === "trial_active") {
      return "trial_active";
    }
    if (normalized === "premium") {
      return "premium";
    }
    return "free";
  }, [user]);
  const isTrial = accessTier === "trial_active";
  const isPremium = React.useMemo(() => {
    if (!user) {
      return false;
    }

    const tier = String(user.tier || "").toLowerCase().trim();
    const status = String(user.subscriptionStatus || "").toLowerCase().trim();

    return tier === "premium" || status === "active" || status === "trialing";
  }, [user]);
  const needsOnboarding = React.useMemo(() => {
    if (!user) {
      return false;
    }

    return !user.onboardingCompleted || !user.profileComplete;
  }, [user]);

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
