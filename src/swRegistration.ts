export function registerSW(): void {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => {
        regs.forEach((r) => r.unregister());
        console.log("[PWA] Service worker unregistered to avoid focus-based reloads");
      })
      .catch(() => {});
  }
}