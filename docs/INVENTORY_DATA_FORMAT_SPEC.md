# Inventory Data Format Specification

## Overview

The Ordering Platform receives inventory data via webhook events from the Inventory Platform through the OT Platform hub. This document specifies the exact format and field mappings required.

## Webhook Event Structure

All inventory events must follow the OT Platform canonical event structure:

```json
{
  "event_id": "string (UUIDv4, required)",
  "event_type": "string (required)",
  "source": "inventory",
  "timestamp": "string (ISO 8601, required)",
  "trace_id": "string (optional, for distributed tracing)",
  "payload": {
    // Event-specific data (see below)
  }
}
```

## Event Types

### 1. InventoryUpdated

Sent when inventory quantities change.

**Payload Structure:**
```json
{
  "product_number": "string (required)",
  "plant": "string (required)",
  "quantity": "integer (required, >= 0)",
  "status": "string (required)",
  "min_threshold": "integer (optional)",
  "metadata": "object (optional)"
}
```

**Field Specifications:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `product_number` | string | Yes | Product/part number identifier | Non-empty, alphanumeric |
| `plant` | string | Yes | Plant/warehouse code | Non-empty |
| `quantity` | integer | Yes | Current stock quantity | >= 0 |
| `status` | string | Yes | Inventory status | One of: `available`, `out_of_stock`, `discontinued` |
| `min_threshold` | integer | No | Minimum stock threshold for low stock alerts | >= 0 |
| `metadata` | object | No | Additional context (JSON) | Valid JSON object |

**Status Values:**
- `available` - Item is in stock and available for ordering
- `out_of_stock` - Item has zero quantity or is temporarily unavailable
- `discontinued` - Item is no longer available and will not be restocked

**Example:**
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "InventoryUpdated",
  "source": "inventory",
  "timestamp": "2025-11-14T10:30:00Z",
  "trace_id": "1234abcd-5678-90ef-ghij-klmnopqrstuv",
  "payload": {
    "product_number": "12345",
    "plant": "P001",
    "quantity": 150,
    "status": "available",
    "min_threshold": 20,
    "metadata": {
      "last_counted": "2025-11-14T08:00:00Z",
      "location": "A-15-3"
    }
  }
}
```

### 2. ItemOutOfStock

Sent when an item becomes out of stock.

**Payload Structure:**
```json
{
  "product_number": "string (required)",
  "plant": "string (required)",
  "expected_restock_date": "string (ISO 8601 date, optional)"
}
```

**Example:**
```json
{
  "event_id": "660e8400-e29b-41d4-a716-446655440002",
  "event_type": "ItemOutOfStock",
  "source": "inventory",
  "timestamp": "2025-11-14T11:00:00Z",
  "payload": {
    "product_number": "12345",
    "plant": "P001",
    "expected_restock_date": "2025-11-20"
  }
}
```

### 3. ItemRestocked

Sent when a previously out-of-stock item is restocked.

**Payload Structure:**
```json
{
  "product_number": "string (required)",
  "plant": "string (required)",
  "quantity": "integer (required, > 0)",
  "status": "available"
}
```

**Example:**
```json
{
  "event_id": "770e8400-e29b-41d4-a716-446655440003",
  "event_type": "ItemRestocked",
  "source": "inventory",
  "timestamp": "2025-11-14T12:00:00Z",
  "payload": {
    "product_number": "12345",
    "plant": "P001",
    "quantity": 200,
    "status": "available"
  }
}
```

## Webhook Delivery Details

**Endpoint:** `https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/ot-webhook-receiver`

**Required Headers:**
```http
Content-Type: application/json
x-ot-signature: <hmac-sha256-signature>
x-ot-timestamp: <iso-8601-timestamp>
x-ot-delivery-id: <unique-delivery-id>
x-trace-id: <distributed-trace-id>
```

**HMAC Signature Generation:**
```
signedPayload = timestamp + "." + JSON.stringify(payload)
signature = HMAC-SHA256(signedPayload, OT_WEBHOOK_SECRET)
```

## Data Constraints & Validation

1. **Uniqueness:** Each `(product_number, plant)` combination is unique in our cache
2. **Timestamps:** All timestamps must be in ISO 8601 format with timezone (e.g., `2025-11-14T10:30:00Z`)
3. **Event IDs:** Must be unique UUIDv4 strings
4. **Delivery IDs:** Must be unique per delivery attempt (for idempotency)
5. **Quantity:** Cannot be negative; use `status: "out_of_stock"` for zero quantities
6. **Trace IDs:** Should be propagated across all related events for distributed tracing

## Low Stock Logic

The Ordering Platform calculates `low_stock` status as:
```
low_stock = (quantity > 0 && quantity < min_threshold)
```

If `min_threshold` is not provided, it defaults to 10.

## Sync Behavior

- **Upsert Logic:** Events update existing records or create new ones based on `(product_number, plant)`
- **Idempotency:** Duplicate `event_id` values are ignored (processed once only)
- **Timestamp Validation:** Events older than 5 minutes are rejected for security
- **Real-time Updates:** Changes trigger real-time subscriptions to update UI immediately

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 200 | Event processed successfully |
| 400 | Invalid payload format or missing required fields |
| 401 | Invalid HMAC signature |
| 409 | Duplicate event_id (already processed) |
| 500 | Internal processing error |

## Testing

For testing, you can send events to our staging endpoint with the test trace_id pattern `test-*`:

```bash
curl -X POST https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/ot-webhook-receiver \
  -H "Content-Type: application/json" \
  -H "x-ot-signature: <computed-hmac>" \
  -H "x-ot-timestamp: 2025-11-14T10:00:00Z" \
  -H "x-ot-delivery-id: $(uuidgen)" \
  -H "x-trace-id: test-inventory-sync-001" \
  -d '{
    "event_id": "test-event-001",
    "event_type": "InventoryUpdated",
    "source": "inventory",
    "timestamp": "2025-11-14T10:00:00Z",
    "trace_id": "test-inventory-sync-001",
    "payload": {
      "product_number": "TEST-123",
      "plant": "P001",
      "quantity": 100,
      "status": "available"
    }
  }'
```

## Contact

For questions or issues with the data format:
- Review full integration docs: `/docs/OT_PLATFORM_INTEGRATION.md`
- Monitor webhook deliveries: Admin Dashboard → Webhooks
- Check processing logs: Edge Function Logs for `ot-webhook-receiver`

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-14 | 1.0 | Initial specification document |
