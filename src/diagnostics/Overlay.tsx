/**
 * Debug Overlay - Visual indicator when diagnostics are active
 */

import { useEffect, useState } from 'react';
import { DIAG_ENABLED } from './config';

export function Overlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!DIAG_ENABLED) return;

    // Only show overlay if ?debug=1 is in URL
    const urlParams = new URLSearchParams(window.location.search);
    setShowOverlay(urlParams.get('debug') === '1');
  }, []);

  if (!DIAG_ENABLED || !showOverlay) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] px-2 py-1 bg-amber-500 text-black text-xs font-mono rounded shadow-lg pointer-events-none"
      style={{ 
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999
      }}
    >
      Diagnostics ON
    </div>
  );
}