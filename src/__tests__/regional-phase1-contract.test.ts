import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Regional Ordering – Phase 1 contract tripwire', () => {
  const step2Path = resolve(__dirname, '../components/regional-ordering/RegionalOrderingStep2.tsx');
  const step2Content = readFileSync(step2Path, 'utf-8');

  it('calls handleOrdersPost (and not create-regional-order)', () => {
    expect(step2Content).toContain(`supabase.functions.invoke('handleOrdersPost'`);
    expect(step2Content).not.toContain('create-regional-order');
  });

  it('uses single-item payload only (no Phase 2 fields)', () => {
    // Forbidden Phase 2 surface
    expect(step2Content).not.toContain('line_items');
    expect(step2Content).not.toContain('order_type');
    expect(step2Content).not.toContain('source_mode');

    // Required Phase 1 fields
    expect(step2Content).toContain('origin_ot_id');
    expect(step2Content).toContain('destination_ot_id');
    expect(step2Content).toContain('destination_kind');
    expect(step2Content).toContain('product_number');
    expect(step2Content).toContain('quantity');
    expect(step2Content).toContain('idempotency_key');
  });
});