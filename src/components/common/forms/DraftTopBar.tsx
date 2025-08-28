import React from 'react';

export interface DraftTopBarProps {
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  onSaveNow: () => void;
  onDiscard: () => void;
}

export function DraftTopBar(_props: DraftTopBarProps) {
  return null;
}

export default DraftTopBar;