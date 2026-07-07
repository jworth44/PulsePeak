/* Pre-paint theme bootstrap — honors the stored preference before first paint
   (no flash of the wrong theme). External file so it is CSP-safe ('self').
   Mirrors src/config/themes.js; keep the two in sync. */
(function () {
  try {
    var pref = localStorage.getItem("pulsepeak-theme");
    if (pref !== "daylight" && pref !== "midnight" && pref !== "blossom" && pref !== "system") pref = "midnight";
    // Concrete themes apply directly; "system" resolves to daylight/midnight.
    var theme =
      pref === "blossom" || pref === "daylight" || pref === "midnight"
        ? pref
        : window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "daylight"
        : "midnight";
    document.documentElement.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    var themeColor = { daylight: "#ede6d8", midnight: "#17130f", blossom: "#f7f1fb" };
    if (meta) meta.setAttribute("content", themeColor[theme] || "#17130f");
  } catch (e) {}
})();
