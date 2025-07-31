/**
 * Test utilities for email resolution system
 * Used to verify Phase 3 implementation
 */

import { resolveEmailRecipients, type EmailType, type OrderDataInput } from "@/services/emailRecipientResolver";

export async function testEmailResolution() {
  console.log("🧪 TESTING EMAIL RESOLUTION SYSTEM");
  
  // Test Transfer Order
  const transferOrderData: OrderDataInput = {
    store: "Fort Worth 022",
    plant: "Grand Prairie 097",
    email: "test@example.com",
    name: "Test User"
  };
  
  console.log("📧 Testing Transfer Order Resolution...");
  const transferResult = await resolveEmailRecipients(transferOrderData, 'transfer', 'TEST-TRANSFER-001');
  
  console.log("✅ Transfer Resolution Result:", {
    recipients_count: transferResult.recipients.length,
    source: transferResult.source,
    store: transferResult.store,
    plant: transferResult.plant,
    recipients: transferResult.recipients.map(r => ({ email: r.email, role: r.role }))
  });
  
  // Test MTO Order
  const mtoOrderData: OrderDataInput = {
    store: "Grand Prairie 027",
    plant: "Grand Prairie 097",
    email: "mto-test@example.com",
    name: "MTO Test User"
  };
  
  console.log("📧 Testing MTO Order Resolution...");
  const mtoResult = await resolveEmailRecipients(mtoOrderData, 'mto', 'TEST-MTO-001');
  
  console.log("✅ MTO Resolution Result:", {
    recipients_count: mtoResult.recipients.length,
    source: mtoResult.source,
    store: mtoResult.store,
    plant: mtoResult.plant,
    recipients: mtoResult.recipients.map(r => ({ email: r.email, role: r.role }))
  });
  
  return {
    transferResult,
    mtoResult
  };
}

// Export for console testing
(window as any).testEmailResolution = testEmailResolution;