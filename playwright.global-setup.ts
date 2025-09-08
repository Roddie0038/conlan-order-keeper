// playwright.global-setup.ts
export default async () => {
  // 1) Kill any pre-existing expect + its Jest/Vitest matcher symbol
  try {
    const g: any = globalThis as any;
    if (g.expect) {
      const syms = Object.getOwnPropertySymbols(g.expect) || [];
      const jestSym = syms.find(s => String(s).includes('$$jest-matchers-object'));
      if (jestSym) {
        try { Object.defineProperty(g.expect, jestSym, { configurable: true, writable: true, value: undefined }); } catch {}
        try { delete (g.expect as any)[jestSym]; } catch {}
      }
      try { delete g.expect; } catch {}
    }
  } catch {}

  // 2) Intercept Node's require() to NO-OP vitest & @vitest/* during PW runs
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Module = require('module') as typeof import('module');
    const orig = Module.prototype.require as any;

    Module.prototype.require = function patchedRequire(id: string, ...rest: any[]) {
      if (
        id === 'vitest' ||
        id.startsWith('@vitest/') ||
        id.includes('vitest/expect') ||
        id.includes('@vitest/expect')
      ) {
        // Return a harmless stub; never execute vitest runtime
        return {};
      }
      return orig.call(this, id, ...rest);
    };
  } catch {}
};