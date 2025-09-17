// Normalization utilities for store numbers and plant IDs

export const extractStoreNumber = (label: string): string =>
  (label.match(/\d+/)?.[0] ?? "").padStart(3, "0");

export const extractPlantId = (label?: string): string | undefined =>
  label ? (label.match(/\d+/)?.[0] ?? "").padStart(3, "0") : undefined;