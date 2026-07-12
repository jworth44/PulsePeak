import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const { user, token, setUser, setDashboard, refreshSession } = useAuth();
  const [status, setStatus] = useState("confirming");
  const [message, setMessage] = useState("Confirming your PulsePeak access...");
  const hasConfirmedRef = useRef(false);
  const mountedRef = useRef(true);
  const pendingTimeoutRef = useRef(null);

  // Track mount state and clear any pending retry timer on unmount so the
  // confirmation loop never calls setState (or leaves a timer) after the user
  // has navigated away from the billing screen.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pendingTimeoutRef.current) {
        window.clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;

    const sessionId = searchParams.get("session_id");
    if (!token || !sessionId) {
      setStatus("error");
      setMessage("We could not verify your upgrade session.");
      return;
    }

    const run = async () => {
      try {
        const payload = await apiRequest(
          "/checkout/confirm",
          {
            method: "POST",
            body: JSON.stringify({ sessionId })
          },
          token
        );
        if (!mountedRef.current) return;

        setUser(payload.user);
        setDashboard(payload.dashboard);
        if (payload.entitlementPending) {
          let syncedPayload = payload;
          for (let attempt = 0; attempt < 3; attempt += 1) {
            await new Promise((resolve) => {
              pendingTimeoutRef.current = window.setTimeout(resolve, 1500);
            });
            if (!mountedRef.current) return;
            syncedPayload = await refreshSession(token);
            if (!mountedRef.current) return;
            if (hasPremiumAccess(syncedPayload?.user)) {
              break;
            }
          }

        if (hasPremiumAccess(syncedPayload?.user)) {
            setStatus("success");
            setMessage(
              isTrialAccess(syncedPayload?.user)
                ? "Your 7-day free trial is active. The full workout system is now available."
                : "Premium unlocked. Your full weekly plan is now available."
            );
          } else {
            setStatus("pending");
            setMessage("Your payment is complete. We're waiting for Stripe to finish syncing your Premium access.");
          }
        } else {
          setStatus("success");
          setMessage(
            isTrialAccess(payload?.user)
              ? "Your 7-day free trial is active. The full workout system is now available."
              : "Premium unlocked. Your full weekly plan is now available."
          );
        }
        await refreshSession(token);
      } catch (error) {
        if (!mountedRef.current) return;
        setStatus("error");
        setMessage(error.message);
      }
    };

    run();
  }, [searchParams, token, setUser, setDashboard, refreshSession]);

  return (
    <section className="panel billing-panel">
      <p className="badge">{status === "success" ? "Upgrade complete" : status === "pending" ? "Payment received" : "Billing status"}</p>
      <h3>{status === "success" ? "Your PulsePeak access is ready" : status === "pending" ? "We are finalizing your Premium access" : "We are checking your upgrade"}</h3>
      <p className="muted">{message}</p>
      <div className="module-note">
        <strong>{status === "success" ? "Your access now follows secure backend subscription state." : "Your access is being verified against Stripe."}</strong>
        <p className="muted">
          {status === "success"
            ? isTrialAccess(user)
              ? `Your trial includes the full workout system until ${user?.trialEndsLabel || "the trial ends"}. Then it renews yearly at $119.99/year unless canceled before trial ends.`
              : "You can now open the full adaptive weekly plan, use deeper coach reasoning, and keep the richer guidance synced to this account."
            : "If the upgrade takes a moment to appear, refresh once more after Stripe finishes syncing the subscription."}
        </p>
      </div>
      <div className="billing-actions">
        <Link className="primary-button" to="/">
          Go to dashboard
        </Link>
        <Link className="ghost-button" to="/coach">
          Open coach
        </Link>
      </div>
    </section>
  );
}

function hasPremiumAccess(user) {
  if (!user) {
    return false;
  }

  const tier = String(user.tier || "").toLowerCase().trim();
  const status = String(user.subscriptionStatus || "").toLowerCase().trim();
  return tier === "premium" || status === "active" || status === "trialing";
}

function isTrialAccess(user) {
  if (!user) {
    return false;
  }

  const accessTier = String(user.accessTier || "").toLowerCase().trim();
  const status = String(user.subscriptionStatus || "").toLowerCase().trim();
  return accessTier === "trial_active" || status === "trialing";
}
