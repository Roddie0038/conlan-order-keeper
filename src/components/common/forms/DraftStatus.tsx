import React from 'react';

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface DraftStatusProps {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  onDiscardDraft?: () => void;
  onSaveNow?: () => void;
  className?: string;
}

export function DraftStatus(_props: DraftStatusProps) {
  return null;
}

export default DraftStatus;