const API_ROOT = "/api";

export async function apiRequest(path, options = {}, token) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch {
    // fetch() itself rejects (offline, DNS, connection reset) before we ever get
    // a response. Surface a human message instead of a raw "Failed to fetch".
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw new Error(
      offline
        ? "You appear to be offline. Reconnect to continue."
        : "We couldn't reach PulsePeak. Please check your connection and try again."
    );
  }

  if (response.status === 204) {
    return null;
  }

  // A gateway/proxy error can return non-JSON (e.g. an HTML 502) — don't let the
  // JSON parse throw a cryptic error; fall back to a status-based message.
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error((payload && payload.message) || `Request failed (${response.status}).`);
  }

  return payload;
}
