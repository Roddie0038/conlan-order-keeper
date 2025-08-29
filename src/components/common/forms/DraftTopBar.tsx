// kill-switch: no-op top bar (renders nothing)
import React from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface DraftTopBarProps {
  saveStatus?: SaveStatus;
  lastSaved?: Date | null;
  onSaveNow?: () => void;
  onDiscard?: () => void;
  className?: string;
}

export function DraftTopBar(_props: DraftTopBarProps) {
  return null; // hide UI completely
}

export default DraftTopBar;