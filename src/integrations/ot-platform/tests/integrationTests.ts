import { otClient } from '../client';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  data?: any;
  duration?: number;
}

/**
 * Phase 1: Basic Connectivity Test
 */
export async function testConnection(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const { data, error } = await otClient
      .from('app_plants')
      .select('id, plant_name, plant_code')
      .limit(1);
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) throw error;
    
    return {
      name: 'Connection Test',
      passed: true,
      message: `✅ Connection successful (${duration}ms)`,
      data,
      duration
    };
  } catch (err: any) {
    return {
      name: 'Connection Test',
      passed: false,
      message: `❌ Connection failed: ${err.message}`,
      duration: Math.round(performance.now() - startTime)
    };
  }
}

/**
 * Phase 2.1: Test Pull All Stores
 */
export async function testStores(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const { data: stores, error } = await otClient
      .from('stores')
      .select('store_number, store_name, plant, is_active')
      .eq('is_active', true)
      .order('store_number');
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) throw error;
    if (!stores) throw new Error('No stores returned');

    // Validate format
    const formatIssues = stores.filter(s => 
      !s.store_number.match(/^\d{3}$/) || // Must be 3 digits
      !s.store_name.match(/\s0\d{2}$/) || // Must end with " 0XX"
      !s.plant.match(/^[A-Za-z\s]+ 0\d{2}$/) // Must be "Plant Name 0XX"
    );
    
    if (formatIssues.length > 0) {
      return {
        name: 'Stores Query',
        passed: false,
        message: `❌ Format validation failed for ${formatIssues.length} stores`,
        data: formatIssues,
        duration
      };
    }
    
    return {
      name: 'Stores Query',
      passed: true,
      message: `✅ Retrieved ${stores.length} stores with correct format (${duration}ms)`,
      data: stores,
      duration
    };
  } catch (err: any) {
    return {
      name: 'Stores Query',
      passed: false,
      message: `❌ Stores query failed: ${err.message}`,
      duration: Math.round(performance.now() - startTime)
    };
  }
}

/**
 * Phase 2.2: Test Pull Store Colors
 */
export async function testStoreColors(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const { data: colors, error } = await otClient
      .from('app_store_colors')
      .select('store_code, store_name, color_name, color_hex')
      .order('store_code');
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) throw error;
    if (!colors) throw new Error('No colors returned');

    return {
      name: 'Store Colors Query',
      passed: true,
      message: `✅ Retrieved ${colors.length} store color mappings (${duration}ms)\n⚠️ Note: Only ${colors.length}/29 stores have colors - fallback logic required`,
      data: colors,
      duration
    };
  } catch (err: any) {
    return {
      name: 'Store Colors Query',
      passed: false,
      message: `❌ Store colors query failed: ${err.message}`,
      duration: Math.round(performance.now() - startTime)
    };
  }
}

/**
 * Phase 2.3: Test Pull Plants
 */
export async function testPlants(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const { data: plants, error } = await otClient
      .from('app_plants')
      .select('id, plant_name, plant_code, status, associated_stores, enable_ordering_access')
      .eq('status', 'active')
      .order('id');
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) throw error;
    if (!plants) throw new Error('No plants returned');

    // Validate format
    const formatIssues = plants.filter(p => 
      !p.plant_code.match(/^0\d{2}$/) || // Must be "0XX"
      !p.plant_name.match(/^[A-Za-z\s]+ 0\d{2}$/) // Must be "Plant Name 0XX"
    );
    
    if (formatIssues.length > 0) {
      return {
        name: 'Plants Query',
        passed: false,
        message: `❌ Plant format validation failed for ${formatIssues.length} plants`,
        data: formatIssues,
        duration
      };
    }
    
    return {
      name: 'Plants Query',
      passed: true,
      message: `✅ Retrieved ${plants.length} active plants with correct format (${duration}ms)`,
      data: plants,
      duration
    };
  } catch (err: any) {
    return {
      name: 'Plants Query',
      passed: false,
      message: `❌ Plants query failed: ${err.message}`,
      duration: Math.round(performance.now() - startTime)
    };
  }
}

/**
 * Phase 2.4: Test Pull Users
 */
export async function testUsers(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const { data: users, error } = await otClient
      .from('ot_platform_users')
      .select('id, email, full_name, role, status, can_access_ordering, plant')
      .eq('can_access_ordering', true)
      .eq('status', 'active')
      .order('email');
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) throw error;
    if (!users) throw new Error('No users returned');

    return {
      name: 'Users Query',
      passed: true,
      message: `✅ Retrieved ${users.length} users with ordering access (${duration}ms)`,
      data: users,
      duration
    };
  } catch (err: any) {
    return {
      name: 'Users Query',
      passed: false,
      message: `❌ Users query failed: ${err.message}`,
      duration: Math.round(performance.now() - startTime)
    };
  }
}

/**
 * Phase 2.5: Test Cross-Reference Query (Stores + Colors)
 * Tests embedded join using FK relationship
 */
export async function testStoresWithColors(): Promise<TestResult> {
  const startTime = performance.now();
  try {
    const { data: storesWithColors, error } = await otClient
      .from('stores')
      .select(`
        store_number,
        store_name,
        plant,
        is_active,
        app_store_colors!fk_app_store_colors_store_code (
          color_name,
          color_hex
        )
      `)
      .eq('is_active', true)
      .order('store_number');
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) throw error;
    if (!storesWithColors) throw new Error('No data returned');

    // Count stores without colors
    const storesWithoutColors = storesWithColors.filter((s: any) => 
      !s.app_store_colors || s.app_store_colors.length === 0
    );
    
    const storesWithoutColorsList = storesWithoutColors.map((s: any) => s.store_number);
    
    return {
      name: 'Cross-Reference Query',
      passed: true,
      message: `✅ Cross-reference query successful (${duration}ms)\n⚠️ ${storesWithoutColors.length} stores have no color mapping: ${storesWithoutColorsList.join(', ')}`,
      data: { storesWithColors, storesWithoutColors: storesWithoutColorsList },
      duration
    };
  } catch (err: any) {
    return {
      name: 'Cross-Reference Query',
      passed: false,
      message: `❌ Cross-reference query failed: ${err.message}`,
      duration: Math.round(performance.now() - startTime)
    };
  }
}

/**
 * Run all tests in sequence
 */
export async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🧪 Starting OT Platform Integration Tests...\n');
  
  // Phase 1: Connection
  const connectionResult = await testConnection();
  results.push(connectionResult);
  console.log(connectionResult.message);
  
  if (!connectionResult.passed) {
    console.log('❌ Connection test failed. Aborting remaining tests.');
    return results;
  }
  
  // Phase 2: Data Pull Tests
  const storesResult = await testStores();
  results.push(storesResult);
  console.log(storesResult.message);
  
  const colorsResult = await testStoreColors();
  results.push(colorsResult);
  console.log(colorsResult.message);
  
  const plantsResult = await testPlants();
  results.push(plantsResult);
  console.log(plantsResult.message);
  
  const usersResult = await testUsers();
  results.push(usersResult);
  console.log(usersResult.message);
  
  const crossRefResult = await testStoresWithColors();
  results.push(crossRefResult);
  console.log(crossRefResult.message);
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);
  
  return results;
}
