// public/env.js
// Runtime env for Lovable hosting (public values only).
// Must be loaded BEFORE your app bundle in index.html.

(() => {
  const ENV = Object.freeze({
    VITE_SUPABASE_URL: "https://cyzywykgdravxfnhskzq.supabase.co",
    VITE_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5enl3eWtnZHJhdnhmbmhza3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMTMsImV4cCI6MjA3NDgzODMxM30.9ywisPvTNhFXzwYjLb69t5rsA_3JPYl7kTlvbU1Qg38"
  });

  Object.defineProperty(window, "__PUBLIC_ENV__", {
    value: ENV,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
