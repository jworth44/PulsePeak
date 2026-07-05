import { useEffect, useRef } from "react";

/**
 * Accessibility helper for modal dialogs:
 * - Escape closes the dialog.
 * - Focus moves into the dialog on open and is restored to the trigger on close.
 * - Tab is trapped within the dialog (can't tab out to the page behind).
 *
 * Usage: const ref = useModalA11y(onClose); then attach ref to the dialog element.
 */
export default function useModalA11y(onClose) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = typeof document !== "undefined" ? document.activeElement : null;
    const node = dialogRef.current;

    const getFocusable = () =>
      node
        ? Array.from(
            node.querySelectorAll(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null || el === document.activeElement)
        : [];

    // Move focus into the dialog.
    const focusables = getFocusable();
    if (focusables.length) {
      focusables[0].focus();
    } else if (node) {
      node.setAttribute("tabindex", "-1");
      node.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key === "Tab") {
        const items = getFocusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  return dialogRef;
}
