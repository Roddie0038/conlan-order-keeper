import { stores } from "@/components/order-form/formConfig";

interface WheelPowderCoatingDiagnostic {
  userStore: string;
  storeMatchMethod: string;
  foundStore: any;
  storeId: string;
  storeName: string;
  issues: string[];
  recommendations: string[];
}

/**
 * Comprehensive diagnostic tool for Wheel Powder Coating form store issues
 */
export function diagnoseWheelPowderCoatingStore(userStore: string): WheelPowderCoatingDiagnostic {
  console.log("🔬 WHEEL POWDER COATING DIAGNOSTIC - Starting analysis for:", userStore);
  
  const result: WheelPowderCoatingDiagnostic = {
    userStore,
    storeMatchMethod: "",
    foundStore: null,
    storeId: "",
    storeName: "",
    issues: [],
    recommendations: []
  };

  // Log all available stores for reference
  console.log("🔬 Available stores in config:", stores.map(s => ({ id: s.id, name: s.name })));

  // Method 1: Try exact name match
  let userStoreObj = stores.find(store => store.name === userStore);
  if (userStoreObj) {
    result.storeMatchMethod = "exact_name_match";
    result.foundStore = userStoreObj;
    result.storeId = userStoreObj.id;
    result.storeName = userStoreObj.name;
    console.log("✅ WHEEL POWDER COATING DIAGNOSTIC - Exact name match found:", userStoreObj);
  } else {
    console.log("❌ WHEEL POWDER COATING DIAGNOSTIC - No exact name match found");
    result.issues.push("No exact name match found in stores config");

    // Method 2: Try store number extraction
    const storeNumberMatch = userStore.match(/(\d+)$/);
    if (storeNumberMatch) {
      const extractedNumber = storeNumberMatch[1];
      const extractedNumberNoZero = extractedNumber.replace(/^0+/, '');
      
      console.log("🔬 WHEEL POWDER COATING DIAGNOSTIC - Store number extraction:", {
        originalStore: userStore,
        regex: storeNumberMatch,
        extractedNumber,
        extractedNumberNoZero
      });

      // Try with original number
      userStoreObj = stores.find(store => store.id === extractedNumber);
      if (userStoreObj) {
        result.storeMatchMethod = "store_number_match_with_zeros";
        result.foundStore = userStoreObj;
        result.storeId = userStoreObj.id;
        result.storeName = userStoreObj.name;
        console.log("✅ WHEEL POWDER COATING DIAGNOSTIC - Store number match (with zeros):", userStoreObj);
      } else {
        // Try without leading zeros
        userStoreObj = stores.find(store => store.id === extractedNumberNoZero);
        if (userStoreObj) {
          result.storeMatchMethod = "store_number_match_no_zeros";
          result.foundStore = userStoreObj;
          result.storeId = userStoreObj.id;
          result.storeName = userStoreObj.name;
          console.log("✅ WHEEL POWDER COATING DIAGNOSTIC - Store number match (no zeros):", userStoreObj);
        } else {
          console.log("❌ WHEEL POWDER COATING DIAGNOSTIC - No store number match found");
          result.issues.push(`Store number ${extractedNumber}/${extractedNumberNoZero} not found in stores config`);
        }
      }
    } else {
      console.log("❌ WHEEL POWDER COATING DIAGNOSTIC - No store number pattern found");
      result.issues.push("No store number pattern found in user store string");
    }
  }

  // Generate recommendations
  if (result.issues.length > 0) {
    result.recommendations.push("Check if user.store value is being set correctly during login");
    result.recommendations.push("Verify stores config includes all active stores");
    result.recommendations.push("Consider adding store name normalization");
    
    const storeNumberMatch = userStore.match(/(\d+)$/);
    if (!storeNumberMatch) {
      result.recommendations.push("User store should follow format 'City Name ###' (e.g., 'Grand Prairie 027')");
    }
  }

  // Final validation
  if (!result.foundStore) {
    result.issues.push("CRITICAL: No store match found - form will not initialize correctly");
    result.recommendations.push("Enable temporary dropdown override for manual store selection");
  } else {
    console.log("✅ WHEEL POWDER COATING DIAGNOSTIC - Store successfully mapped:", {
      input: userStore,
      method: result.storeMatchMethod,
      output: { id: result.storeId, name: result.storeName }
    });
  }

  return result;
}

/**
 * Test function to run diagnostics on common problematic store values
 */
export function testCommonWheelPowderCoatingIssues(): void {
  console.log("🧪 WHEEL POWDER COATING - Testing common store issues...");
  
  const testCases = [
    "Grand Prairie 027",
    "Grand Prairie 27", 
    "Tulsa 036",
    "Tulsa 36",
    "Fort Worth 022",
    "Fort Worth 22",
    "Invalid Store Name"
  ];

  testCases.forEach(testCase => {
    console.log(`\n--- Testing: "${testCase}" ---`);
    const result = diagnoseWheelPowderCoatingStore(testCase);
    console.log("Result:", {
      method: result.storeMatchMethod,
      found: result.foundStore ? `${result.storeName} (ID: ${result.storeId})` : "NONE",
      issues: result.issues.length,
      recommendations: result.recommendations.length
    });
  });
}

// Make diagnostics available globally for console testing
declare global {
  interface Window {
    debugWheelPowderCoating: (userStore?: string) => WheelPowderCoatingDiagnostic;
    testWheelPowderCoatingIssues: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.debugWheelPowderCoating = (userStore: string = "Grand Prairie 027") => {
    return diagnoseWheelPowderCoatingStore(userStore);
  };
  
  window.testWheelPowderCoatingIssues = testCommonWheelPowderCoatingIssues;
  
  console.log("🔧 Wheel Powder Coating Debug Tools Loaded!");
  console.log("📞 Run: window.debugWheelPowderCoating('Grand Prairie 027') to test store mapping");
  console.log("📞 Run: window.testWheelPowderCoatingIssues() to test common issues");
}