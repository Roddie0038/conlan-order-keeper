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
    console.log('🎯 LiveEditBridge: Setting up targets, isEditing:', isEditing);
    
    const targets = document.querySelectorAll<HTMLElement>("[data-editable]");
    console.log('🎯 LiveEditBridge: Found targets:', targets.length);

    const apply = (el: HTMLElement) => {
      try {
        const elementId = el.getAttribute("data-editable");
        if (!elementId) return;

        console.log('🎯 LiveEditBridge: Applying styles to:', elementId);

        // Apply direct styles from context (takes priority)
        const directStyles = editedStyles[elementId];
        if (directStyles) {
          console.log('🎯 LiveEditBridge: Direct styles found:', directStyles);
          if (directStyles.background) {
            el.style.background = directStyles.background;
            console.log('🎯 Applied background:', directStyles.background);
          }
          if (directStyles.color) {
            el.style.color = directStyles.color;
            console.log('🎯 Applied color:', directStyles.color);
          }
          if (directStyles.borderRadius) {
            el.style.borderRadius = directStyles.borderRadius;
            console.log('🎯 Applied borderRadius:', directStyles.borderRadius);
          }
          if (directStyles.borderColor) {
            el.style.borderColor = directStyles.borderColor;
            console.log('🎯 Applied borderColor:', directStyles.borderColor);
          }
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
      } catch (error) {
        console.error('🚨 LiveEditBridge: Error applying styles:', error);
      }
    };

    const observers: Array<{ disconnect: () => void }> = [];

    targets.forEach((el) => {
      try {
        apply(el);
        
        // Add click handler for direct editing mode - REMOVED stopPropagation
        const handleClick = (e: MouseEvent) => {
          console.log('🎯 LiveEditBridge: Element clicked, isEditing:', isEditing);
          if (isEditing) {
            e.preventDefault();
            // REMOVED: e.stopPropagation(); - This was blocking StyleEditor clicks
            const elementId = el.getAttribute("data-editable");
            console.log('🎯 LiveEditBridge: Setting selected element:', elementId);
            if (elementId) {
              setSelectedElement(elementId);
            }
          }
        };

        el.addEventListener('click', handleClick);
        
        // Observe attribute changes for external Live Editor
        const mo = new MutationObserver(() => {
          try {
            apply(el);
          } catch (error) {
            console.error('🚨 LiveEditBridge: MutationObserver error:', error);
          }
        });
        
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
        observers.push({
          disconnect: () => el.removeEventListener('click', handleClick)
        });
      } catch (error) {
        console.error('🚨 LiveEditBridge: Error setting up element:', error);
      }
    });

    return () => {
      console.log('🎯 LiveEditBridge: Cleaning up observers');
      observers.forEach((observer) => {
        try {
          observer.disconnect();
        } catch (error) {
          console.error('🚨 LiveEditBridge: Cleanup error:', error);
        }
      });
    };
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