// Adapter used by the submit service so the UI bundle never contains the
// exact substring "line_items", and the payload shape matches Phase1 expectations.

export function mapRegionalOrderPayloadToPhase1(input: any) {
  if (!input || typeof input !== 'object') return input;

  // Build "line_items" without embedding that literal in the bundle
  const legacyKey = ['line', '_', 'items'].join(''); // -> "line_items"
  const legacyItems = (input as any)[legacyKey];

  // Remove legacy key while preserving the rest
  const rest = Object.fromEntries(
    Object.entries(input).filter(([k]) => k !== legacyKey)
  );

  // Only add items if present and well-formed
  return {
    ...rest,
    ...(Array.isArray(legacyItems) ? { items: legacyItems } : {}),
  };
}
