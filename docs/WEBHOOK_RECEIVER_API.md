# Webhook Receiver API Documentation

## Overview

The Ordering Platform provides a webhook receiver endpoint that accepts event notifications from external platforms (like the OT Inventory Platform). This endpoint validates HMAC signatures and timestamps to ensure secure, authentic webhook delivery.

## Endpoint

```
POST https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/webhook-receiver/{platformKey}
```

Replace `{platformKey}` with your platform's unique identifier (e.g., `inventory-platform`).

## Authentication

### Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `x-cto-signature` | HMAC-SHA256 signature of the payload | `a1b2c3d4e5f6...` |
| `x-cto-timestamp` | Request timestamp (Unix seconds or ISO 8601) | `1763077289` or `2025-11-13T23:41:29Z` |
| `x-cto-delivery-id` | Unique UUID for this delivery (idempotency key) | `019a7f98-74e1-7d68-9ad1-9bbc92a66179` |
| `x-cto-trace-id` | Optional trace ID for debugging | `trace-123` |
| `Content-Type` | Must be `application/json` | `application/json` |

### HMAC Signature Generation

Generate the signature using HMAC-SHA256:

```javascript
const message = `${timestamp}.${JSON.stringify(payload)}`;
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(message)
  .digest('hex');
```

**Important:** Use the same timestamp value in both:
1. The `x-cto-timestamp` header
2. The message being signed

## Timestamp Validation

### Accepted Formats

The endpoint accepts timestamps in **two formats**:

1. **Unix Timestamp (seconds)**: `1763077289`
2. **ISO 8601 String**: `2025-11-13T23:41:29Z`

### Tolerance Window

- **±5 minutes** from the server's current time
- Requests outside this window will be rejected with a `401` error

### Clock Synchronization

Ensure your server's clock is synchronized with NTP:
```bash
# Check your server time
date -u

# Install NTP (if not already installed)
sudo apt-get install ntp
sudo systemctl start ntp
```

## Request Body

The body must be a valid JSON payload following this structure:

```json
{
  "event_id": "unique-event-identifier",
  "event_type": "inventory.session.exported",
  "source": "ot-inventory-platform",
  "timestamp": "2025-11-13T23:41:29Z",
  "trace_id": "optional-trace-id",
  "payload": {
    // Event-specific data
  }
}
```

## Supported Event Types

| Event Type | Description |
|------------|-------------|
| `InventoryUpdated` | Single inventory item quantity update |
| `inventory.session.exported` | Bulk inventory export (CSV) |
| `ItemOutOfStock` | Item marked as out of stock |
| `ItemRestocked` | Item restocked with new quantity |
| `OrderFulfilled` | Order has been fulfilled |

## Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | Event processed successfully |
| `400` | Bad Request | Check headers and payload format |
| `401` | Unauthorized | Timestamp outside window or invalid signature |
| `404` | Not Found | Platform key not found or inactive |
| `409` | Conflict | Duplicate delivery (idempotency check) |
| `500` | Server Error | Contact Ordering Platform support |

## Example Request

### Using Unix Timestamp

```bash
curl -X POST \
  https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/webhook-receiver/inventory-platform \
  -H "Content-Type: application/json" \
  -H "x-cto-signature: $(echo -n "1763077289.{\"event_id\":\"test-123\"}" | openssl dgst -sha256 -hmac "your-secret" | cut -d' ' -f2)" \
  -H "x-cto-timestamp: 1763077289" \
  -H "x-cto-delivery-id: $(uuidgen)" \
  -d '{
    "event_id": "test-123",
    "event_type": "InventoryUpdated",
    "source": "ot-inventory-platform",
    "timestamp": "2025-11-13T23:41:29Z",
    "payload": {
      "item_number": "TEST-001",
      "quantity": 100
    }
  }'
```

### Using ISO 8601 Timestamp

```bash
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
curl -X POST \
  https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/webhook-receiver/inventory-platform \
  -H "Content-Type: application/json" \
  -H "x-cto-signature: $(echo -n "${TIMESTAMP}.{\"event_id\":\"test-123\"}" | openssl dgst -sha256 -hmac "your-secret" | cut -d' ' -f2)" \
  -H "x-cto-timestamp: ${TIMESTAMP}" \
  -H "x-cto-delivery-id: $(uuidgen)" \
  -d '{
    "event_id": "test-123",
    "event_type": "InventoryUpdated",
    "source": "ot-inventory-platform",
    "timestamp": "'${TIMESTAMP}'",
    "payload": {
      "item_number": "TEST-001",
      "quantity": 100
    }
  }'
```

## Troubleshooting

### Error: "Request timestamp is outside acceptable window"

**Causes:**
- Clock drift between systems (most common)
- Timestamp format not recognized
- Network delays exceeding 5 minutes (extremely rare)

**Solutions:**
1. Verify your server time matches UTC:
   ```bash
   date -u
   ```

2. Check the time difference:
   ```javascript
   const serverTime = Date.now();
   const yourTime = Date.now(); // or your timestamp * 1000
   const diffSeconds = Math.abs(serverTime - yourTime) / 1000;
   console.log(`Clock difference: ${diffSeconds} seconds`);
   ```

3. Ensure NTP is running and synchronized

4. Use Unix timestamps in seconds (recommended):
   ```javascript
   const timestamp = Math.floor(Date.now() / 1000);
   ```

### Error: "Invalid HMAC signature"

**Causes:**
- Wrong secret being used
- Timestamp mismatch between header and signature
- Body serialization differences (whitespace, key order)

**Solutions:**
1. Verify you're using the correct webhook secret
2. Ensure the exact same timestamp is in both the header and the signed message
3. Use canonical JSON serialization (no pretty printing)
4. Log both the message being signed and the signature generated

### Error: "Event already processed"

**Cause:** The `x-cto-delivery-id` was already received and processed.

**Solution:** This is idempotency protection working correctly. Use a new UUID for each delivery.

## Idempotency

The endpoint uses the `x-cto-delivery-id` header for idempotency:
- Each delivery ID can only be processed once
- Duplicate requests return `200` with the original processing status
- Generate a new UUID for each webhook attempt

## Logging and Debugging

The endpoint logs detailed information for debugging:
- Received timestamp vs server time
- Time difference in seconds
- HMAC verification attempts
- Event processing results

To view logs:
1. Go to [Supabase Edge Function Logs](https://supabase.com/dashboard/project/cyzywykgdravxfnhskzq/functions/webhook-receiver/logs)
2. Search for your `x-cto-delivery-id` or `x-cto-trace-id`

## Security Best Practices

1. **Always use HTTPS** - Webhook secrets should never be transmitted over HTTP
2. **Rotate secrets regularly** - The endpoint supports a previous secret for zero-downtime rotation
3. **Use unique delivery IDs** - Generate a new UUID for each webhook
4. **Monitor failed deliveries** - Set up alerts for repeated authentication failures
5. **Validate responses** - Check for `200` status code and parse error messages

## Contact & Support

For issues or questions:
- View edge function logs: [Supabase Dashboard](https://supabase.com/dashboard/project/cyzywykgdravxfnhskzq/functions/webhook-receiver/logs)
- Check database audit logs: Query `webhook_audit` table
- Contact: Ordering Platform Development Team
