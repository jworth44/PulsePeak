import {
  findUserById,
  findUserByStripeCustomerId,
  findUserByStripeSubscriptionId,
  hasProcessedWebhookEvent,
  recordProcessedWebhookEvent,
  updateUserAccount
} from "./data/store.js";

const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export function applyStripeWebhookEvent(event) {
  if (hasProcessedWebhookEvent(event.id)) {
    return {
      ignored: true,
      reason: "already_processed",
      eventId: event.id
    };
  }

  let result;
  switch (event.type) {
    case "checkout.session.completed":
      result = handleCheckoutSessionCompleted(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      result = handleSubscriptionUpsert(event.data.object);
      break;
    case "customer.subscription.deleted":
      result = handleSubscriptionDeleted(event.data.object);
      break;
    case "invoice.payment_failed":
      result = handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      result = null;
  }

  recordProcessedWebhookEvent(event.id, event.type);
  return result;
}

function handleCheckoutSessionCompleted(session) {
  const user = findUserForStripeObject(session);
  if (!user) {
    throw new Error(`Unable to locate user for checkout session ${session.id}.`);
  }

  const subscriptionStatus =
    session.mode === "subscription"
      ? session.payment_status === "paid"
        ? "active"
        : session.payment_status === "no_payment_required"
          ? "trialing"
          : "incomplete"
      : "incomplete";

  return persistSubscriptionState(user.id, {
    tier: PREMIUM_STATUSES.has(subscriptionStatus) ? "premium" : "free",
    subscriptionStatus,
    stripeCustomerId: normalizeNullableId(session.customer),
    stripeSubscriptionId: normalizeNullableId(session.subscription),
    subscriptionPlanInterval: normalizeNullableInterval(session?.metadata?.billingInterval)
  });
}

function handleSubscriptionUpsert(subscription) {
  const user = findUserForStripeObject(subscription);
  if (!user) {
    throw new Error(`Unable to locate user for subscription ${subscription.id}.`);
  }

  const subscriptionStatus = normalizeSubscriptionStatus(subscription.status);

  return persistSubscriptionState(user.id, {
    tier: PREMIUM_STATUSES.has(subscriptionStatus) ? "premium" : "free",
    subscriptionStatus,
    stripeCustomerId: normalizeNullableId(subscription.customer),
    stripeSubscriptionId: normalizeNullableId(subscription.id),
    currentPeriodEnd: timestampToIso(subscription.current_period_end),
    subscriptionPlanInterval: normalizeNullableInterval(subscription?.items?.data?.[0]?.price?.recurring?.interval),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)
  });
}

function handleSubscriptionDeleted(subscription) {
  const user = findUserForStripeObject(subscription);
  if (!user) {
    throw new Error(`Unable to locate user for canceled subscription ${subscription.id}.`);
  }

  return persistSubscriptionState(user.id, {
    tier: "free",
    subscriptionStatus: "canceled",
    stripeCustomerId: normalizeNullableId(subscription.customer),
    stripeSubscriptionId: normalizeNullableId(subscription.id),
    currentPeriodEnd: timestampToIso(subscription.current_period_end)
  });
}

function handleInvoicePaymentFailed(invoice) {
  const user = findUserForStripeObject(invoice);
  if (!user) {
    throw new Error(`Unable to locate user for failed invoice ${invoice.id}.`);
  }

  return persistSubscriptionState(user.id, {
    tier: "free",
    subscriptionStatus: "past_due",
    stripeCustomerId: normalizeNullableId(invoice.customer),
    stripeSubscriptionId: normalizeNullableId(invoice.subscription)
  });
}

function persistSubscriptionState(userId, nextState) {
  return updateUserAccount(userId, (user) => {
    const subscriptionStatus = normalizeSubscriptionStatus(nextState.subscriptionStatus ?? user.subscriptionStatus);
    const currentPeriodEnd = nextState.currentPeriodEnd ?? user.currentPeriodEnd ?? null;
    const subscriptionPlanInterval = nextState.subscriptionPlanInterval ?? user.subscriptionPlanInterval ?? null;
    const cancelAtPeriodEnd = typeof nextState.cancelAtPeriodEnd === "boolean" ? nextState.cancelAtPeriodEnd : Boolean(user.cancelAtPeriodEnd);
    const wasTrialing = String(user.subscriptionStatus || "").toLowerCase().trim() === "trialing";
    return {
      ...user,
      tier: nextState.tier ?? user.tier ?? "free",
      planTier: subscriptionStatus === "trialing" ? "trial_active" : PREMIUM_STATUSES.has(subscriptionStatus) ? "premium" : "free",
      subscriptionStatus,
      stripeCustomerId: nextState.stripeCustomerId ?? user.stripeCustomerId ?? null,
      stripeSubscriptionId: nextState.stripeSubscriptionId ?? user.stripeSubscriptionId ?? null,
      currentPeriodEnd,
      trialStartedAt:
        subscriptionStatus === "trialing"
          ? user.trialStartedAt || new Date().toISOString()
          : user.trialStartedAt ?? null,
      trialEndsAt:
        subscriptionStatus === "trialing"
          ? currentPeriodEnd
          : subscriptionStatus === "canceled" || subscriptionStatus === "past_due" || subscriptionStatus === "inactive"
            ? null
            : user.trialEndsAt ?? null
      ,
      trialBillingChoice:
        subscriptionStatus === "trialing"
          ? nextState.subscriptionPlanInterval || user.trialBillingChoice || null
          : user.trialBillingChoice ?? null,
      trialStatus:
        subscriptionStatus === "trialing"
          ? cancelAtPeriodEnd
            ? "canceled"
            : "active"
          : wasTrialing && subscriptionStatus === "active"
            ? "converted"
            : subscriptionStatus === "canceled" && user.trialEndsAt
              ? "expired"
              : user.trialStatus || "inactive",
      trialCanceledAt:
        subscriptionStatus === "trialing" && cancelAtPeriodEnd
          ? user.trialCanceledAt || new Date().toISOString()
          : subscriptionStatus === "active"
            ? null
            : user.trialCanceledAt ?? null,
      trialConvertedAt:
        wasTrialing && subscriptionStatus === "active"
          ? user.trialConvertedAt || new Date().toISOString()
          : user.trialConvertedAt ?? null,
      hasUsedTrial: Boolean(user.hasUsedTrial || subscriptionStatus === "trialing" || user.trialStartedAt),
      subscriptionPlanInterval,
      cancelAtPeriodEnd
    };
  });
}

function findUserForStripeObject(object) {
  const metadataUserId = String(object?.metadata?.userId || "").trim();
  if (metadataUserId) {
    const metadataUser = findUserById(metadataUserId);
    if (metadataUser) {
      return metadataUser;
    }
  }

  const customerUser = findUserByStripeCustomerId(normalizeNullableId(object?.customer));
  if (customerUser) {
    return customerUser;
  }

  return findUserByStripeSubscriptionId(normalizeNullableId(object?.subscription) || normalizeNullableId(object?.id));
}

function normalizeNullableId(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeNullableInterval(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (normalized === "month") {
    return "monthly";
  }
  if (normalized === "year") {
    return "yearly";
  }
  if (normalized === "monthly" || normalized === "yearly") {
    return normalized;
  }
  return null;
}

function normalizeSubscriptionStatus(value) {
  const normalized = String(value || "inactive").toLowerCase().trim();
  return normalized || "inactive";
}

function timestampToIso(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  return new Date(timestamp * 1000).toISOString();
}
