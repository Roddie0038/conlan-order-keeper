// playwright.global-setup.ts
export default async () => {
  try {
    const g: any = globalThis as any;
    if (g.expect) {
      // Try to remove Vitest/Jest matcher symbol if present
      const syms = Object.getOwnPropertySymbols(g.expect) || [];
      const jestSym = syms.find(s => String(s).includes('$$jest-matchers-object'));
      if (jestSym) {
        try { delete (g.expect as any)[jestSym]; } catch {}
      }
      // Remove the global expect so Playwright can define its own cleanly
      try { delete g.expect; } catch {}
    }
  } catch {
    // ignore
  }
};