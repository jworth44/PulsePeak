/* Pre-paint theme bootstrap — honors the stored preference before first paint
   (no flash of the wrong theme). External file so it is CSP-safe ('self').
   Mirrors src/config/themes.js; keep the two in sync. */
(function () {
  try {
    var pref = localStorage.getItem("pulsepeak-theme");
    if (pref !== "daylight" && pref !== "midnight" && pref !== "twilight" && pref !== "system") pref = "midnight";
    var light =
      pref === "daylight" ||
      (pref === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
    // Twilight is a concrete dark theme; system still resolves to daylight/midnight.
    var theme = pref === "twilight" ? "twilight" : light ? "daylight" : "midnight";
    document.documentElement.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    var themeColor = { daylight: "#ede6d8", midnight: "#17130f", twilight: "#160a3d" };
    if (meta) meta.setAttribute("content", themeColor[theme] || "#17130f");
  } catch (e) {}
})();
