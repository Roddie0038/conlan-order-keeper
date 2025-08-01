/**
 * Debug utility for Wheel Order Store Mismatch Issue
 * Use: Run `window.debugWheelOrder()` in console to investigate store mapping issues
 */

import { stores } from "@/components/order-form/formConfig";

interface DebugResult {
  userStore: string;
  extractedNumber: string;
  foundExactMatch: any;
  foundByNumber: any;
  finalStoreId: string;
  finalStoreName: string;
  allAvailableStores: Array<{id: string, name: string}>;
  issueFound: boolean;
  recommendations: string[];
}

export function debugWheelOrderStoreMismatch(userStore: string): DebugResult {
  console.log("🔍 DEBUGGING WHEEL ORDER STORE MISMATCH");
  console.log("======================================");
  
  const recommendations: string[] = [];
  
  // Method 1: Try exact name match first
  const exactMatch = stores.find(store => store.name === userStore);
  console.log("📍 Exact name match result:", exactMatch);
  
  // Method 2: Extract number and match by ID
  const storeNumberMatch = userStore.match(/(\d+)$/);
  let extractedNumber = "";
  let foundByNumber = null;
  
  if (storeNumberMatch) {
    extractedNumber = storeNumberMatch[1].replace(/^0+/, ''); // Remove leading zeros
    foundByNumber = stores.find(store => store.id === extractedNumber);
    console.log("📍 Number extraction result:", {
      originalStore: userStore,
      extractedNumber,
      foundByNumber
    });
  }
  
  const finalStore = exactMatch || foundByNumber;
  const finalStoreId = finalStore?.id || "";
  const finalStoreName = finalStore?.name || "";
  
  // Check for issues
  let issueFound = false;
  
  if (!finalStore) {
    issueFound = true;
    recommendations.push("❌ CRITICAL: No store found for user store '" + userStore + "'");
    recommendations.push("✅ FIX: Check if user store name format matches stores array");
  }
  
  if (finalStoreName !== userStore && exactMatch) {
    issueFound = true;
    recommendations.push("⚠️  Store name mismatch: User='" + userStore + "' vs Found='" + finalStoreName + "'");
  }
  
  if (!extractedNumber && !exactMatch) {
    issueFound = true;
    recommendations.push("❌ Could not extract store number from '" + userStore + "'");
  }
  
  const result: DebugResult = {
    userStore,
    extractedNumber,
    foundExactMatch: exactMatch,
    foundByNumber,
    finalStoreId,
    finalStoreName,
    allAvailableStores: stores.map(s => ({ id: s.id, name: s.name })),
    issueFound,
    recommendations
  };
  
  console.log("📊 FINAL DEBUG RESULT:", result);
  console.log("======================================");
  
  if (issueFound) {
    console.error("🚨 ISSUES FOUND:");
    recommendations.forEach(rec => console.error(rec));
  } else {
    console.log("✅ No issues found - store mapping should work correctly");
  }
  
  return result;
}

// Make available globally for debugging
declare global {
  interface Window {
    debugWheelOrder: (userStore?: string) => DebugResult;
  }
}

// Auto-register if running in browser
if (typeof window !== 'undefined') {
  window.debugWheelOrder = (userStore = "Grand Prairie 027") => {
    return debugWheelOrderStoreMismatch(userStore);
  };
  
  console.log("🔧 Wheel Order Debug Tool Loaded!");
  console.log("📞 Run: window.debugWheelOrder('Grand Prairie 027') to test store mapping");
}