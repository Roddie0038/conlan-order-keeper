import * as React from "react";

/**
 * Mirrors data-style-* attributes written by the Live Editor into inline styles.
 * This is a robust fallback if the editor doesn't write directly to style/custom props.
 *
 * Supported attributes on target nodes:
 *   data-style-bg       -> element.style.background
 *   data-style-fg       -> element.style.color
 *   data-style-radius   -> element.style.borderRadius
 *   data-style-border   -> element.style.borderColor
 */
export function LiveEditBridge() {
  React.useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-editable]");

    const apply = (el: HTMLElement) => {
      const bg = el.getAttribute("data-style-bg");
      const fg = el.getAttribute("data-style-fg");
      const br = el.getAttribute("data-style-radius");
      const bc = el.getAttribute("data-style-border");

      if (bg) el.style.background = bg;
      if (fg) el.style.color = fg;
      if (br) el.style.borderRadius = br;
      if (bc) el.style.borderColor = bc;
    };

    const observers: MutationObserver[] = [];

    targets.forEach((el) => {
      apply(el);
      const mo = new MutationObserver(() => apply(el));
      mo.observe(el, {
        attributes: true,
        attributeFilter: [
          "data-style-bg",
          "data-style-fg",
          "data-style-radius",
          "data-style-border",
        ],
      });
      observers.push(mo);
    });

    return () => observers.forEach((mo) => mo.disconnect());
  }, []);

  return null;
}