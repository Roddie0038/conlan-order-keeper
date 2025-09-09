/**
 * Diagnostics Root - Main diagnostics system integration point
 */

import { DIAG_ENABLED } from './config';
import { NavigationAgent } from './NavigationAgent';
import { Overlay } from './Overlay';

export function DiagnosticsRoot() {
  if (!DIAG_ENABLED) {
    return null;
  }

  return (
    <>
      <NavigationAgent />
      <Overlay />
    </>
  );
}