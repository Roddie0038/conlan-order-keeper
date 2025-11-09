# OT Platform Integration Guide

## Overview

The Ordering Platform is fully integrated with the OT Platform to enable real-time inventory synchronization, order event publishing, and bidirectional webhook communication. This creates a unified event-driven ecosystem: **Ordering → OT → Inventory → OT → Ordering**.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   Ordering      │◄────────┤   OT Platform   │◄────────┤   Inventory     │
│   Platform      │────────►│   (Hub)         │────────►│   Platform      │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
   ▲                           ▲                           ▲
   │                           │                           │
   │    OrderPlaced            │    InventoryUpdated       │
   │    OrderCancelled         │    ItemOutOfStock         │
   │    OrderModified          │    ItemRestocked          │
   │                           │    OrderFulfilled         │
   └───────────────────────────┴───────────────────────────┘
              Event-Driven Communication (Webhooks)
```

## Integration Components

### 1. Inbound Webhook Receiver (`ot-webhook-receiver`)

**Endpoint**: `https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/ot-webhook-receiver`

**Purpose**: Receives and processes events from OT Platform

**Event Types Handled**:
- `InventoryUpdated` - Updates local inventory cache
- `ItemOutOfStock` - Marks items as unavailable
- `ItemRestocked` - Re-enables items for ordering
- `OrderFulfilled` - Updates order status to completed

**Security**:
- HMAC SHA-256 signature verification
- Timestamp validation (5-minute tolerance)
- Replay attack prevention
- Idempotency via `event_receipts` table

**Headers Required**:
```http
x-ot-signature: <hmac-sha256-signature>
x-ot-timestamp: <iso-8601-timestamp>
x-ot-delivery-id: <unique-delivery-id>
x-trace-id: <distributed-trace-id>
```

### 2. Outbound Event Publisher (`webhook-outbound-publisher`)

**Purpose**: Publishes Ordering Platform events to OT Platform

**Event Types Published**:
- `OrderPlaced` - New order submitted
- `MTOOrderPlaced` - Make-to-order submitted
- `WheelOrderPlaced` - Wheel order submitted

**Pattern**: Transactional Outbox
1. Order + outbox entry written in single transaction
2. Background publisher polls outbox every 30 seconds
3. Exponential backoff retry on failures (3 attempts)
4. Failed events moved to DLQ (`failed_webhooks`)

### 3. Inventory Sync Service (`otPlatformClient.ts`)

**Functions**:
- `checkInventoryAvailability(productNumber, plant)` - Real-time stock check
- `getInventorySyncHistory(productNumber, plant)` - Sync event history
- `subscribeToInventoryUpdates(productNumber, plant, callback)` - Real-time subscription
- `getOutOfStockItems(plant)` - List of unavailable items

## Database Schema

### event_receipts
Idempotency tracking for inbound events
```sql
CREATE TABLE event_receipts (
  id UUID PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  trace_id TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL, -- received, processed, failed, ignored
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_duration_ms INTEGER,
  error_message TEXT
);
```

### failed_webhooks
Dead Letter Queue for failed deliveries
```sql
CREATE TABLE failed_webhooks (
  id UUID PRIMARY KEY,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  trace_id TEXT,
  payload JSONB NOT NULL,
  error_message TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);
```

### inventory_cache
Real-time inventory data from OT Platform
```sql
CREATE TABLE inventory_cache (
  id UUID PRIMARY KEY,
  product_number TEXT NOT NULL,
  plant TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL, -- available, out_of_stock, discontinued
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sync_trace_id TEXT,
  UNIQUE(product_number, plant)
);
```

### inventory_sync_log
Historical sync event tracking
```sql
CREATE TABLE inventory_sync_log (
  id UUID PRIMARY KEY,
  event_id TEXT NOT NULL,
  trace_id TEXT,
  product_number TEXT NOT NULL,
  plant TEXT NOT NULL,
  old_quantity INTEGER,
  new_quantity INTEGER,
  sync_type TEXT NOT NULL, -- inventory_updated, out_of_stock, restocked
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### webhook_audit
Security and compliance audit trail
```sql
CREATE TABLE webhook_audit (
  id UUID PRIMARY KEY,
  webhook_id UUID,
  platform_id UUID,
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## Event Payload Schema

All events conform to OT Platform's canonical structure:

```typescript
interface OTWebhookEvent {
  event_id: string;        // UUIDv4, unique per event
  event_type: string;      // e.g., InventoryUpdated, OrderPlaced
  source: string;          // inventory, ordering, ot
  timestamp: string;       // ISO 8601
  trace_id?: string;       // Distributed tracing correlation ID
  payload: {
    // Event-specific data
  };
}
```

### Example: InventoryUpdated
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "InventoryUpdated",
  "source": "inventory",
  "timestamp": "2025-11-09T17:30:00Z",
  "trace_id": "1234abcd-5678-90ef-ghij-klmnopqrstuv",
  "payload": {
    "product_number": "12345",
    "plant": "P001",
    "quantity": 150,
    "status": "available"
  }
}
```

### Example: OrderPlaced
```json
{
  "event_id": "660e8400-e29b-41d4-a716-446655440001",
  "event_type": "OrderPlaced",
  "source": "ordering",
  "timestamp": "2025-11-09T17:35:00Z",
  "trace_id": "2345bcde-6789-01fg-hijk-lmnopqrstuvw",
  "payload": {
    "order_number": "ORD-20251109-000123",
    "store": "Store123",
    "plant": "P001",
    "product_number": "12345",
    "quantity": 10,
    "order_type": "transfer",
    "submitted_by_email": "user@store123.com"
  }
}
```

## HMAC Signature Verification

### Generating Signature (OT Platform)
```typescript
const timestamp = new Date().toISOString();
const payload = JSON.stringify(event);
const signedPayload = `${timestamp}.${payload}`;
const signature = hmacSha256(signedPayload, OT_WEBHOOK_SECRET);

headers: {
  'x-ot-signature': signature,
  'x-ot-timestamp': timestamp,
  'x-ot-delivery-id': uuidv4(),
  'x-trace-id': correlationId
}
```

### Verifying Signature (Ordering Platform)
```typescript
async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): Promise<boolean> {
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), 
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const computedSignature = await crypto.subtle.sign('HMAC', key, 
    encoder.encode(signedPayload));
  return computedSignature === signature;
}
```

## Observability & Tracing

### Trace ID Propagation

Every event includes a `trace_id` that flows through the entire system:

```
User Order Submission
  └─> trace_id: abc123
      ├─> Outbox Entry (trace_id: abc123)
      ├─> Webhook Delivery to OT (trace_id: abc123)
      ├─> OT Processing (trace_id: abc123)
      ├─> Inventory Update Event (trace_id: abc123)
      └─> Receipt in Ordering Platform (trace_id: abc123)
```

### Monitoring Dashboard

Navigate to `/admin/webhooks` to access:

1. **Outbox Dashboard** - Pending/published events
2. **Inbound Events Monitor** - Received OT events
3. **Inventory Sync Monitor** - Real-time stock updates
4. **Integration Tests** - End-to-end flow testing
5. **Failed Webhooks** - DLQ inspection and retry

## Secrets Configuration

Required Supabase secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `OT_WEBHOOK_URL` | OT Platform receiver endpoint | `https://ot-platform.example.com/webhooks/ordering` |
| `OT_WEBHOOK_SECRET` | Shared HMAC secret | `super-secret-key-123` |
| `ORDERING_OUTBOX_KEY` | Internal publisher key | `internal-outbox-key-456` |
| `TRACE_SERVICE_NAME` | OpenTelemetry service identifier | `ordering-platform` |

## Retry & Error Handling

### Exponential Backoff
```
Attempt 1: Immediate
Attempt 2: 2s + jitter
Attempt 3: 4s + jitter
Attempt 4: Move to DLQ
```

### DLQ Processing
1. Failed events stored in `failed_webhooks`
2. Manual inspection via admin dashboard
3. Retry after resolution:
   ```sql
   UPDATE failed_webhooks 
   SET resolved_at = NOW(), resolution_notes = 'Manually retried'
   WHERE id = '<event-id>';
   ```

## Testing

### Integration Test Scenarios

1. **Order Submission → Outbox Enqueue**
   - Verify transactional integrity
   - Check trace_id propagation

2. **Outbox Publisher → Webhook Delivery**
   - Simulate successful delivery
   - Test retry on 500 errors

3. **OT Event Receipt → Inventory Sync**
   - Verify idempotency (duplicate events)
   - Validate HMAC signature
   - Check timestamp tolerance

4. **End-to-End Flow**
   - Order → OT → Inventory → OT → Ordering
   - Trace correlation across all hops

### Manual Testing

```bash
# Send test InventoryUpdated event
curl -X POST https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/ot-webhook-receiver \
  -H "Content-Type: application/json" \
  -H "x-ot-signature: <computed-hmac>" \
  -H "x-ot-timestamp: 2025-11-09T17:00:00Z" \
  -H "x-ot-delivery-id: $(uuidgen)" \
  -H "x-trace-id: test-trace-123" \
  -d '{
    "event_id": "test-event-001",
    "event_type": "InventoryUpdated",
    "source": "inventory",
    "timestamp": "2025-11-09T17:00:00Z",
    "trace_id": "test-trace-123",
    "payload": {
      "product_number": "TEST-123",
      "plant": "P001",
      "quantity": 100,
      "status": "available"
    }
  }'
```

## Security Best Practices

1. **Signature Verification**: Always verify HMAC before processing
2. **Timestamp Validation**: Reject events older than 5 minutes
3. **Idempotency**: Check `event_receipts` before processing
4. **Audit Logging**: Record all webhook activity in `webhook_audit`
5. **Secret Rotation**: Update `OT_WEBHOOK_SECRET` quarterly
6. **Rate Limiting**: Enforce limits via `app_platform_links.rate_limit_per_minute`
7. **Input Validation**: Sanitize all payload data before database operations

## Troubleshooting

### Event Not Processing
1. Check `event_receipts` for status
2. Review `webhook_audit` for security failures
3. Inspect `failed_webhooks` for error details
4. Verify `OT_WEBHOOK_SECRET` matches OT Platform

### Inventory Not Updating
1. Confirm event type is `InventoryUpdated`
2. Check `inventory_sync_log` for processing
3. Verify `product_number` and `plant` match
4. Review edge function logs

### Signature Verification Failures
1. Ensure clocks are synchronized (NTP)
2. Verify secret matches between platforms
3. Check payload serialization (whitespace, encoding)
4. Validate timestamp format (ISO 8601)

## Maintenance

### Daily Tasks
- Monitor `failed_webhooks` count
- Review `webhook_audit` for anomalies

### Weekly Tasks
- Analyze `inventory_sync_log` trends
- Review retry patterns in outbox

### Monthly Tasks
- Audit webhook configurations
- Review and archive old `event_receipts`
- Performance analysis of processing times

## Future Enhancements

1. **Advanced Retry Strategies**
   - Circuit breaker pattern
   - Priority queuing for critical events

2. **Enhanced Observability**
   - OpenTelemetry span export
   - Grafana dashboard integration
   - Real-time alerting (PagerDuty, Slack)

3. **Multi-Tenant Support**
   - Webhook configuration per store
   - Isolated event processing

4. **Event Replay**
   - Historical event re-processing
   - Point-in-time recovery

## Support

For questions or issues:
- Check logs: `/admin/webhooks` → Edge Function Logs
- Review audit trail: `SELECT * FROM webhook_audit ORDER BY created_at DESC LIMIT 100`
- Contact OT Platform team for integration support
