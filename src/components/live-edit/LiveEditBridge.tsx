import * as React from "react";
import { useLiveEdit } from '../../contexts/LiveEditContext';

/**
 * Enhanced Live Edit Bridge that supports both external Live Editor and direct style editing.
 * 
 * External mode: Mirrors data-style-* attributes written by the Live Editor into inline styles.
 * Direct mode: Applies styles from LiveEditContext directly to elements.
 *
 * Supported attributes/styles:
 *   data-style-bg / background       -> element.style.background
 *   data-style-fg / color            -> element.style.color
 *   data-style-radius / borderRadius -> element.style.borderRadius
 *   data-style-border / borderColor  -> element.style.borderColor
 */
export function LiveEditBridge() {
  const { editedStyles, isEditing, setSelectedElement } = useLiveEdit();

  React.useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-editable]");

    const apply = (el: HTMLElement) => {
      const elementId = el.getAttribute("data-editable");
      if (!elementId) return;

      // Apply direct styles from context (takes priority)
      const directStyles = editedStyles[elementId];
      if (directStyles) {
        if (directStyles.background) el.style.background = directStyles.background;
        if (directStyles.color) el.style.color = directStyles.color;
        if (directStyles.borderRadius) el.style.borderRadius = directStyles.borderRadius;
        if (directStyles.borderColor) el.style.borderColor = directStyles.borderColor;
        return;
      }

      // Fallback to external Live Editor data attributes
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
      
      // Add click handler for direct editing mode
      const handleClick = (e: MouseEvent) => {
        if (isEditing) {
          e.preventDefault();
          e.stopPropagation();
          const elementId = el.getAttribute("data-editable");
          if (elementId) {
            setSelectedElement(elementId);
          }
        }
      };

      el.addEventListener('click', handleClick);
      
      // Observe attribute changes for external Live Editor
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

      // Cleanup function for click handler
      observers.push({
        disconnect: () => el.removeEventListener('click', handleClick)
      } as MutationObserver);
    });

    return () => observers.forEach((mo) => mo.disconnect());
  }, [editedStyles, isEditing, setSelectedElement]);

  // Re-apply styles when editedStyles change
  React.useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-editable]");
    targets.forEach((el) => {
      const elementId = el.getAttribute("data-editable");
      if (elementId && editedStyles[elementId]) {
        const styles = editedStyles[elementId];
        if (styles.background) el.style.background = styles.background;
        if (styles.color) el.style.color = styles.color;
        if (styles.borderRadius) el.style.borderRadius = styles.borderRadius;
        if (styles.borderColor) el.style.borderColor = styles.borderColor;
      }
    });
  }, [editedStyles]);

  return null;
}