// public/env.js
// Runtime env for Lovable hosting (public values only).
// Must be loaded BEFORE your app bundle in index.html.

(() => {
  const ENV = Object.freeze({
    VITE_SUPABASE_URL: "https://hpgjbpvugasktphwntee.supabase.co",
    VITE_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZ2picHZ1Z2Fza3RwaHdudGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjQ2MjYsImV4cCI6MjA3NDg0MDYyNn0.rdBeHuUhHa_4yrdzXHnGzcXAolrcfPKV2mQhdjcgnYY"
  });

  Object.defineProperty(window, "__PUBLIC_ENV__", {
    value: ENV,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
