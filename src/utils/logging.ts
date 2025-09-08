// src/utils/logging.ts
const DEBUG = import.meta.env?.VITE_DEBUG_ORDER_SUBMIT === "true";

export function dlog(...args: any[]) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log("[order-submit]", ...args);
  }
}

export function derr(...args: any[]) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.error("[order-submit:ERROR]", ...args);
  }
}