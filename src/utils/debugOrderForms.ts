/**
 * Debug utilities for order form testing and validation
 * Tests store mapping, email recipient resolution, and form consistency
 */

import { stores } from "@/components/order-form/formConfig";
import { debugStoreNormalization, extractStoreNumber } from "@/utils/normalization/StoreNormalizationUtils";
import { resolveEmailRecipients } from "@/services/emailRecipientResolver";
import type { EmailType } from "@/services/emailRecipientResolver";

export interface FormTestResult {
  formType: string;
  storeName: string;
  storeId: string;
  plant: string;
  emailType: EmailType;
  recipientCount: number;
  hasStoreManager: boolean;
  hasServiceManager: boolean;
  hasSuperAdmin: boolean;
  issues: string[];
}

/**
 * Test store mapping for all form types
 */
export function testStoreMapping(userStore: string): void {
  console.group("🧪 STORE MAPPING TEST");
  
  console.log("Testing store:", userStore);
  debugStoreNormalization(userStore, "test-mapping");
  
  // Test exact name match
  let storeObj = stores.find(store => store.name === userStore);
  console.log("Exact name match:", storeObj);
  
  // Test number extraction method
  if (!storeObj) {
    const storeNumberMatch = userStore.match(/(\d+)$/);
    if (storeNumberMatch) {
      const extractedNumber = storeNumberMatch[1].replace(/^0+/, '');
      storeObj = stores.find(store => store.id === extractedNumber);
      console.log("Number extraction result:", {
        extractedNumber,
        foundStore: storeObj
      });
    }
  }
  
  console.log("Final mapping result:", {
    found: !!storeObj,
    storeId: storeObj?.id,
    storeName: storeObj?.name
  });
  
  console.groupEnd();
}

/**
 * Test email recipient resolution for a specific form type
 */
export async function testEmailRecipients(
  storeName: string, 
  plant: string, 
  emailType: EmailType
): Promise<FormTestResult> {
  
  console.group(`🧪 EMAIL RECIPIENTS TEST - ${emailType.toUpperCase()}`);
  
  const orderData = {
    store: storeName,
    plant: plant
  };
  
  console.log("Testing with data:", orderData);
  
  try {
    const result = await resolveEmailRecipients(orderData, emailType);
    
    const hasStoreManager = result.recipients.some(r => r.role === 'store_manager');
    const hasServiceManager = result.recipients.some(r => r.role === 'service_manager');
    const hasSuperAdmin = result.recipients.some(r => r.role === 'super_admin');
    
    const issues: string[] = [];
    
    // Check for expected recipients
    if (!hasStoreManager && emailType !== 'warranty') {
      issues.push("Missing store_manager");
    }
    
    if (!hasServiceManager && ['transfer', 'mto', 'wheel'].includes(emailType)) {
      issues.push("Missing service_manager");
    }
    
    // Check for unwanted recipients
    if (hasSuperAdmin && ['transfer', 'mto', 'wheel'].includes(emailType)) {
      issues.push("Unexpected super_admin included");
    }
    
    const testResult: FormTestResult = {
      formType: emailType,
      storeName,
      storeId: extractStoreNumber(storeName),
      plant,
      emailType,
      recipientCount: result.recipients.length,
      hasStoreManager,
      hasServiceManager,
      hasSuperAdmin,
      issues
    };
    
    console.log("Test result:", testResult);
    console.log("Recipients found:", result.recipients.map(r => ({
      email: r.email,
      role: r.role,
      name: r.name
    })));
    
    console.groupEnd();
    return testResult;
    
  } catch (error) {
    console.error("Test failed:", error);
    console.groupEnd();
    
    return {
      formType: emailType,
      storeName,
      storeId: extractStoreNumber(storeName),
      plant,
      emailType,
      recipientCount: 0,
      hasStoreManager: false,
      hasServiceManager: false,
      hasSuperAdmin: false,
      issues: [`Error: ${error.message}`]
    };
  }
}

/**
 * Run comprehensive tests for all order types
 */
export async function runComprehensiveFormTests(
  userStore: string = "Grand Prairie 027",
  plant: string = "Grand Prairie 097"
): Promise<FormTestResult[]> {
  
  console.group("🧪 COMPREHENSIVE FORM TESTS");
  console.log("Testing for user store:", userStore, "plant:", plant);
  
  // Test store mapping first
  testStoreMapping(userStore);
  
  // Test all email types
  const emailTypes: EmailType[] = ['transfer', 'mto', 'wheel', 'warranty'];
  const results: FormTestResult[] = [];
  
  for (const emailType of emailTypes) {
    const result = await testEmailRecipients(userStore, plant, emailType);
    results.push(result);
  }
  
  // Summary
  console.log("=== TEST SUMMARY ===");
  results.forEach(result => {
    console.log(`${result.formType.toUpperCase()}:`, {
      recipients: result.recipientCount,
      issues: result.issues.length,
      details: result.issues
    });
  });
  
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  console.log(`Total issues found: ${totalIssues}`);
  
  console.groupEnd();
  return results;
}

/**
 * Quick test function to call from browser console
 */
export function quickTest(): void {
  runComprehensiveFormTests().then(results => {
    console.log("🎯 Quick test completed:", results.length, "forms tested");
  });
}

// Make functions globally available for console testing
if (typeof window !== 'undefined') {
  (window as any).testOrderForms = {
    testStoreMapping,
    testEmailRecipients,
    runComprehensiveFormTests,
    quickTest
  };
  
  console.log("🔧 Order form debug utilities loaded. Use window.testOrderForms.quickTest() to run tests.");
}