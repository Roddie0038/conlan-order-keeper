// block-vitest.cjs
(function () {
  // 1) Nuke any pre-set global expect (incl. jest/vitest matcher symbol)
  try {
    const g = globalThis;
    if (g && g.expect) {
      const syms = Object.getOwnPropertySymbols(g.expect) || [];
      for (const s of syms) {
        if (String(s).includes('$$jest-matchers-object')) {
          try { delete g.expect[s]; } catch {}
        }
      }
      try { delete g.expect; } catch {}
    }
  } catch {}

  // 2) Block Vitest / @vitest/* / jest-dom at the loader level
  try {
    const Module = require('module');
    const orig = Module.prototype.require;
    Module.prototype.require = function (id, ...rest) {
      if (
        id === 'vitest' ||
        id.startsWith('@vitest/') ||
        id.includes('vitest/expect') ||
        id.includes('@vitest/expect') ||
        id.includes('jest-dom')
      ) {
        // Optional: uncomment to see who tried to load it
        // console.error('[blocked vitest require]', id, new Error().stack.split('\n')[2]);
        return {};
      }
      return orig.call(this, id, ...rest);
    };
  } catch {}
})();