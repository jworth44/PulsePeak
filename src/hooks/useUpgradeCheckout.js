import { useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

export function useUpgradeCheckout() {
  const { token, dashboard } = useAuth();
  const [busy, setBusy] = useState(false);
  const billingEnabled = dashboard?.pricingModel?.billingEnabled === true;

  const startUpgradeCheckout = async (billingInterval = "monthly", checkoutMode = "default") => {
    if (!billingEnabled) {
      throw new Error("Premium is launching soon — check back to unlock the full experience.");
    }

    setBusy(true);
    try {
      const payload = await apiRequest(
        "/checkout-session",
        {
          method: "POST",
          body: JSON.stringify({ billingInterval, checkoutMode })
        },
        token
      );

      if (payload.checkoutUrl) {
        window.location.assign(payload.checkoutUrl);
        return;
      }

      throw new Error("Unable to start Stripe Checkout.");
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    startUpgradeCheckout
  };
}
