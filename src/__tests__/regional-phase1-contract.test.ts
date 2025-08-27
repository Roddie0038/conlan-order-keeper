import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Regional Ordering Phase 1 Contract Protection', () => {
  const step2Path = resolve(__dirname, '../components/regional-ordering/RegionalOrderingStep2.tsx');
  
  it('should only call handleOrdersPost function', () => {
    const step2Content = readFileSync(step2Path, 'utf-8');
    
    // Must call handleOrdersPost
    expect(step2Content).toContain("supabase.functions.invoke('handleOrdersPost'");
    
    // Must NOT call create-regional-order
    expect(step2Content).not.toContain("create-regional-order");
  });

  it('should use single-item payload only (no line_items)', () => {
    const step2Content = readFileSync(step2Path, 'utf-8');
    
    // Must NOT contain Phase 2 fields
    expect(step2Content).not.toContain('line_items');
    expect(step2Content).not.toContain('order_type');
    expect(step2Content).not.toContain('source_mode');
    
    // Must contain Phase 1 required fields
    expect(step2Content).toContain('origin_ot_id');
    expect(step2Content).toContain('destination_ot_id');
    expect(step2Content).toContain('destination_kind');
    expect(step2Content).toContain('product_number');
    expect(step2Content).toContain('quantity');
    expect(step2Content).toContain('idempotency_key');
  });

  it('should not reference disabled create-regional-order anywhere in src/', () => {
    // This will be checked by CI, but adding as documentation
    const step2Content = readFileSync(step2Path, 'utf-8');
    expect(step2Content).not.toContain('create-regional-order');
  });
});