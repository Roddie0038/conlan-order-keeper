// kill-switch: no-op status badge (renders nothing)
import React from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface DraftStatusProps {
  saveStatus?: SaveStatus;
  lastSaved?: Date | null;
  onDiscardDraft?: () => void;
  onSaveNow?: () => void;
  className?: string;
}

export function DraftStatus(_props: DraftStatusProps) {
  return null;
}

export default DraftStatus;