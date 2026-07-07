/* Pre-paint theme bootstrap — honors the stored preference before first paint
   (no flash of the wrong theme). External file so it is CSP-safe ('self').
   Mirrors src/config/themes.js; keep the two in sync. */
(function () {
  try {
    var pref = localStorage.getItem("pulsepeak-theme");
    var concrete = { daylight: 1, midnight: 1, blossom: 1, liberty: 1 };
    if (!concrete[pref] && pref !== "system") pref = "midnight";
    // Concrete themes apply directly; "system" resolves to daylight/midnight.
    var theme = concrete[pref]
      ? pref
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "daylight"
      : "midnight";
    document.documentElement.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    var themeColor = { daylight: "#ede6d8", midnight: "#17130f", blossom: "#f1e6fc", liberty: "#f6f8fc" };
    if (meta) meta.setAttribute("content", themeColor[theme] || "#17130f");
  } catch (e) {}
})();
