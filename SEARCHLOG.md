# Ordering Platform Refactor - Search Log

## Overview
This document tracks all removed database writes from the Ordering platform as part of the thin client refactor. All business data submissions now forward to the OT platform via HMAC-authenticated endpoint.

**Date:** 2025-11-11  
**Objective:** Remove ALL local DB writes to business tables (orders, mto_orders, wheel_orders, warranty_orders, ot_orders)

## Files Modified

### 1. `src/services/submitOtOrder.ts`
**Changes:** Complete rewrite to forward via `forward-to-ot` edge function  
**Removed writes:** 
- Previously called `supabase.functions.invoke("ingest-ot-order")` which wrote to `ot_orders` table
- Now calls `forward-to-ot` which only forwards to external OT platform

**Before:**
```typescript
const { data, error } = await supabase.functions.invoke("ingest-ot-order", {
  body: payload, // This wrote to local ot_orders table
});
```

**After:**
```typescript
const { data, error } = await supabase.functions.invoke("forward-to-ot", {
  body: payload, // This forwards to OT platform, NO local writes
});
```

### 2. `src/components/wheel-order/hooks/useWheelFormSubmission.ts`
**Changes:** Removed all local writes and webhook calls  
**Removed writes:**
- Line 204-209: `localStorage.setItem('wheelOrders', ...)` - REMOVED
- Line 162-202: `publishWheelOrderPlaced()` webhook outbox write - REMOVED
- No longer creates `OrderData` for local storage

**Impact:** Wheel orders now only submit to OT platform via `submitOtOrder()`

### 3. `src/components/mto-order/hooks/useSubmitMTOOrder.ts`
**Changes:** Removed webhook outbox writes  
**Removed writes:**
- Line 78-112: `publishMTOOrderPlaced()` webhook outbox write - REMOVED

**Impact:** MTO orders now only submit to OT platform via `submitOtOrder()`

### 4. `src/components/order-form/hooks/useOrderFormSubmit.ts`
**Changes:** Removed local storage and webhook dependencies  
**Removed writes:**
- No direct DB writes found (was already using `submitOtOrder()`)
- Cleaned up to only call forwarding service

### 5. `src/services/dynamicEmailService.ts`
**Changes:** Deprecated all functions that query routing tables  
**Removed queries:**
- `getOrderingEmailRecipients()` - Previously queried `store_email_recipients` and `platform_users`
- `getStoreEmailRecipients()` - Previously queried `platform_users`
- `getManagerEmail()` - Previously queried routing tables
- `getFirstManagerEmail()` - Previously queried routing tables

**Impact:** Ordering no longer queries OT's routing tables (store_email_recipients, platform_users)

### 6. `supabase/functions/ingest-ot-order/index.ts`
**Status:** DEPRECATED - Replaced by `forward-to-ot`  
**Removed writes:**
- Line 204-208: `await supabase.from('ot_orders').insert(insertData)` - THIS WAS THE MAIN LOCAL WRITE
- Line 85-88: Queried `store_user_roles` for authorization
- Line 129-134: Queried `platform_users` for store validation

**Impact:** This function is no longer used. All submissions now go through `forward-to-ot` which forwards to external OT platform.

### 7. New: `supabase/functions/forward-to-ot/index.ts`
**Purpose:** HMAC signing and forwarding proxy  
**Writes:** NONE - This function only computes HMAC signature and forwards to OT  
**External call:** POSTs to `OT_INGEST_URL` with `X-Signature` header

## Tables No Longer Written By Ordering

1. **`ot_orders`** - Previously written by `ingest-ot-order` edge function
2. **`orders`** - No writes found (already removed in previous refactor)
3. **`mto_orders`** - No writes found (already removed in previous refactor)
4. **`wheel_orders`** - No writes found (already removed in previous refactor)
5. **`warranty_orders`** - No writes found (already removed in previous refactor)
6. **`webhook_outbox`** - Previously written by `publishWheelOrderPlaced()` and `publishMTOOrderPlaced()`

## Tables No Longer Queried By Ordering

1. **`store_email_recipients`** - Email routing now handled by OT
2. **`platform_users`** - User/store associations now handled by OT
3. **`store_user_roles`** - Authorization now handled by OT

## Verification Checklist

- [x] `submitOtOrder()` forwards to `forward-to-ot` edge function
- [x] `forward-to-ot` computes HMAC and forwards to OT platform
- [x] Wheel order submission removed localStorage writes
- [x] Wheel order submission removed webhook outbox writes
- [x] MTO order submission removed webhook outbox writes
- [x] All email routing queries deprecated
- [x] `ingest-ot-order` edge function marked deprecated
- [x] No `.insert()` calls to business tables remain in codebase

## Testing Evidence Required

1. Console log showing `FORWARD_TO_OT` with trace_id
2. Network request to `forward-to-ot` edge function
3. No rows in Ordering's `ot_orders` table after submission
4. OT platform returns `{status:"ok", project:"OT", trace_id:...}`

## Payload Structure Update

**Date:** 2025-11-11 (Phase 2)

Added **top-level `type` field** to all OT order payloads per OT ingest requirements:
- Wheel orders: `type: "WHEEL_POWDER_COATING"`
- MTO orders: `type: "MTO"`
- Transfer orders: `type: "TRANSFER"`
- Warranty orders: `type: "WARRANTY"` (future)

The `type` field was previously only in `metadata` but OT ingest requires it at the root level.

## External Library Warnings (Not Our Code)

**MutationObserver & postMessage warnings:**
- Searched entire codebase: ZERO usage of `MutationObserver`, `.observe()`, or `postMessage` in our code
- All warnings originate from `lovable.js` (external library, not user code)
- No action needed in our codebase

## Notes

- localStorage writes for UI-only data (wheelOrders) were removed as they're not business data
- The `ingest-ot-order` function is kept for backward compatibility but should be removed in next cleanup
- All trace_id logging includes `{project:"Ordering", forward_to_ot:true}` for observability
- HMAC secret is server-side only, never exposed to browser
- Top-level `type` field is now mandatory on all submissions
