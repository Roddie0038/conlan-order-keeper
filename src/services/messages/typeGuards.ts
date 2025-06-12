
// Type guard utilities for order_type validation
const validOrderTypes = ["orders", "mto_orders", "wheel_orders"] as const;
type ValidOrderType = typeof validOrderTypes[number];

function isValidOrderType(value: string): value is ValidOrderType {
  return validOrderTypes.includes(value as ValidOrderType);
}

export function parseOrderType(value: string): ValidOrderType {
  if (!isValidOrderType(value)) {
    console.warn(`[OrderTypeGuard] Invalid order_type detected: ${value}. Defaulting to 'orders'.`);
  }
  return isValidOrderType(value) ? value : "orders";
}

// Type guard utilities for sender_role validation
const validRoles = ["store_manager", "warehouse_admin"] as const;
type ValidSenderRole = typeof validRoles[number];

export function parseSenderRole(role: string | null): ValidSenderRole {
  if (role && validRoles.includes(role as ValidSenderRole)) {
    return role as ValidSenderRole;
  }
  console.warn(`[SenderRoleGuard] Invalid or null sender_role: ${role}. Defaulting to 'store_manager'.`);
  return "store_manager";
}

// Type guard utilities for source validation
const validSources = ["platform", "email_reply", "email_direct"] as const;
type ValidSource = typeof validSources[number];

export function parseSource(value: string | null): ValidSource {
  if (value && validSources.includes(value as ValidSource)) {
    return value as ValidSource;
  }
  console.warn(`[SourceGuard] Invalid or null source: ${value}. Defaulting to 'platform'.`);
  return "platform";
}
