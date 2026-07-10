import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Cinematic reveal controller (Cinematic Experience Directive).
// Sections should emerge, not snap in. This is a PROGRESSIVE ENHANCEMENT:
// content is only ever hidden once JS marks <html> as reveal-ready AND the
// user has not requested reduced motion — so if JS fails, or motion is
// reduced, every [data-reveal] element renders normally and is never stuck
// invisible.
//
// Implementation note: we deliberately use a scroll + getBoundingClientRect
// in-view check rather than IntersectionObserver. IO callbacks do not fire in
// non-painting/offscreen contexts (headless preview, backgrounded tabs), which
// would leave content stuck at opacity:0; a rect check + scroll listener works
// everywhere and is cheap. A fail-safe timer reveals anything still hidden so
// content can never be permanently invisible.
export function useRevealOnScroll() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const root = document.documentElement;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      root.classList.remove("reveal-ready");
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-revealed"));
      return undefined;
    }

    root.classList.add("reveal-ready");

    let ticking = false;
    const revealInView = () => {
      ticking = false;
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      const trigger = viewportH * 0.94; // reveal a touch before fully in view
      let batchIndex = 0;
      document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < trigger && rect.bottom > 0) {
          // Stagger elements crossing in together so a screenful cascades.
          el.style.setProperty("--reveal-delay", `${Math.min(batchIndex, 6) * 65}ms`);
          el.classList.add("is-revealed");
          batchIndex += 1;
        }
      });
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(revealInView);
    };

    revealInView();
    requestAnimationFrame(revealInView);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    // Lazy routes / async data mount [data-reveal] sections after this effect
    // runs and without a path change — re-check whenever the DOM changes.
    const mutationObserver = new MutationObserver(onScrollOrResize);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Fail-safe: nothing may stay hidden. After a beat, reveal anything still
    // near or above the fold (truly below-fold content waits for scroll).
    const failSafe = window.setTimeout(() => {
      const viewportH = window.innerHeight || 0;
      document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => {
        if (el.getBoundingClientRect().top < viewportH * 1.4) el.classList.add("is-revealed");
      });
    }, 1600);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      mutationObserver.disconnect();
      window.clearTimeout(failSafe);
    };
  }, [location.pathname]);
}
