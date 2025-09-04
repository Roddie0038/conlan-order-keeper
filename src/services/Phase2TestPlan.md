# Phase 2 Implementation - Test Plan

## Pre-Phase-2 Fixes Complete ✅

### 1. Direct Email Sends Removed ✅
- **All notification sends routed through OT controller**: ✅
  - Created `ot-notify` edge function as secure proxy
  - Created `otNotificationService` client with standardized request builder
  - Updated `NotificationController.ts` to use ot-notify (deprecated legacy methods)
  - Updated `orderingEmailService.ts` to route through otNotificationService
  - Updated `sendConfirmationEmail.ts` to route through otNotificationService

### 2. Request Context Always Includes ✅
- **email_type** (canonical): ✅ - All requests include email_type
- **store_number** (LPAD 3): ✅ - Auto-padded in otNotificationService.normalizeRequest()
- **plant_code** (LPAD 3): ✅ - Auto-padded in otNotificationService.normalizeRequest()
- **idempotency_key** (unique per event): ✅ - Generated per request
- **admin_override** (boolean, defaults false): ✅ - Included in all requests
- **Event payload fields** (order_id, received_at, etc): ✅ - Passed in payload object

### 3. Client-Side Changes ✅
- **No preference logic client-side**: ✅ - Removed from emailRecipientResolver.ts
- **Server authoritative**: ✅ - All preferences handled by OT controller
- **Dry-run previews**: ✅ - Supported via dry_run=true flag

### 4. Global Expansion Logic Removed ✅
- **"All Plants" logic removed**: ✅ 
  - Removed from `emailRecipientResolver.ts` line 265
  - Removed from `notificationHardeningService.ts` line 317
- **No client-side global expansions**: ✅ - OT controller enforces scoping

### 5. Headers & Security ✅
- **Authorization Bearer**: ✅ - Forwarded from client through ot-notify
- **x-internal-token**: ✅ - Injected from server env in ot-notify
- **No service role keys in client**: ✅ - All handled server-side

### 6. Observability ✅
- **idempotency_key propagation**: ✅ - Consistent across requests
- **Bounded retries**: ✅ - Max 2 retries with backoff in otNotificationService
- **Error handling**: ✅ - 4xx vs 5xx detection, clear logging

## Test Plan - Five Dry-Run Scenarios

### Test 1: Store Transfer Order
```typescript
await otNotificationService.sendNotification({
  email_type: "transfer_order",
  store_number: "022", // Will be padded to "022"
  plant_code: "097",
  idempotency_key: "test_transfer_001",
  admin_override: false,
  dry_run: true,
  payload: {
    order_id: "test-order-001",
    store_name: "Fort Worth 022",
    product_number: "TEST123",
    quantity: 5,
    description: "Test transfer order"
  }
});
```

### Test 2: Cross-Dock Order
```typescript
await otNotificationService.sendNotification({
  email_type: "cross_dock",
  store_number: "027", // Origin store
  plant_code: "097",
  idempotency_key: "test_crossdock_001", 
  admin_override: false,
  dry_run: true,
  payload: {
    order_id: "test-crossdock-001",
    origin_store: "027",
    destination_store: "022",
    product_number: "CROSS456",
    quantity: 10
  }
});
```

### Test 3: MTO Casings Needed
```typescript
await otNotificationService.sendNotification({
  email_type: "mto_casings_needed",
  store_number: "022",
  plant_code: "097", 
  idempotency_key: "test_mto_001",
  admin_override: false,
  dry_run: true,
  payload: {
    order_id: "test-mto-001",
    tire_size: "11R22.5",
    tread: "FD833",
    casing_grade: "A",
    quantity: 4
  }
});
```

### Test 4: Plant-Level Warehouse Event
```typescript
await otNotificationService.sendNotification({
  email_type: "inventory_alert",
  plant_code: "099", // Plant-only scope
  idempotency_key: "test_plant_001",
  admin_override: false,
  dry_run: true,
  payload: {
    alert_type: "low_stock",
    product_number: "PLANT789",
    current_quantity: 2,
    threshold: 10
  }
});
```

### Test 5: Admin Override Critical Alert
```typescript
await otNotificationService.sendNotification({
  email_type: "system_alert",
  store_number: "027",
  plant_code: "097",
  idempotency_key: "test_critical_001",
  admin_override: true, // Critical notification bypasses preferences
  dry_run: true,
  payload: {
    alert_level: "critical",
    message: "System maintenance scheduled",
    affected_systems: ["ordering", "inventory"]
  }
});
```

## Expected Results

Each dry-run should return:
```json
{
  "success": true,
  "recipient_count": <number>,
  "template_name": "<template_used>",
  "filtered_by_prefs": <number>,
  "source": "database|fallback",
  "scoping_applied": "store|plant",
  "dry_run": true
}
```

## Post Dry-Run: Live Event Tests

After dry-run validation, test two live events:

### Live Test 1: Store Confirmation
```typescript
// Remove dry_run flag
await sendTransferOrderNotification(
  "live-test-001",
  "022", 
  "097",
  { /* actual order data */ }
);
```

### Live Test 2: Cross-Dock Notification  
```typescript
await sendCrossDockNotification(
  "live-crossdock-001",
  "027",
  "022", 
  "097",
  { /* actual crossdock data */ }
);
```

## Success Criteria ✅

- [x] All notification sends routed through OT controller (no direct sends)
- [x] Request includes email_type, store_number/plant_code, idempotency_key, admin_override  
- [x] No "All Plants"/global expansion in client
- [x] Security headers correct (anon + internal token from server env)
- [x] Optional: preview uses dry_run
- [x] Error handling sane; retries bounded; logs include idempotency_key

## Files Modified

### Created:
- `supabase/functions/ot-notify/index.ts` - Secure proxy to OT controller
- `src/services/otNotification.ts` - Client service with request builders

### Updated:
- `src/services/emailRecipientResolver.ts` - Removed "All Plants" expansion
- `src/services/notificationHardeningService.ts` - Disabled global plant fallbacks  
- `src/services/NotificationController.ts` - Route through ot-notify (deprecated)
- `src/services/orderingEmailService.ts` - Route through otNotificationService
- `src/lib/email/sendConfirmationEmail.ts` - Route through otNotificationService
- `src/components/order-form/hooks/useOrderFormSubmit.ts` - Use sendTransferOrderNotification
- `src/components/order-form/hooks/useOrderFormSubmitV2.ts` - Import otNotification

## Remaining Direct Sends (Out of Phase 2 Scope)

The following edge functions still send emails directly but are not in Phase 2 scope:
- `complaint-notification/index.ts` - Will convert in Phase 3 
- `new-user-registration-notification/index.ts` - Admin notifications, separate workflow
- `email-testing/index.ts` - Will convert to use OT controller in dry_run mode
- `send-order-message-email/index.ts` - Message system, separate workflow

**Phase 2 is complete and ready for canary testing.**