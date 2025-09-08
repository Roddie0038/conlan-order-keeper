// Works in Node (process.env) and in Vite browser bundles (import.meta.env)
const nodeFlag = typeof process !== 'undefined' && process.env && process.env.E2E_MODE === '1';
const viteFlag = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_E2E_MODE === '1';
export const IS_E2E = !!(nodeFlag || viteFlag);