export const ROUTES = {
  // Dashboard
  dashboard: '/dashboard',
  
  // Request Types
  transferRequest: '/transfer-request',
  mtoRequest: '/mto-order',
  wheelPowderCoat: '/wheel-order',
  warrantySubmission: '/retread-warranty',
  crossDockRequest: '/cross-dock-request',
  customerComplaint: '/complaint-tracking',
  regionalTransfer: '/regional-transfer',
  
  // Orders & Transfers
  orders: '/all-orders',
  transferHistory: '/regional-transfer-history',
  
  // Tools & Resources
  approvedTread: '/approved-treads',
  crossDockForms: '/cross-dock',
  
  // Admin
  userManagement: '/user-management',
  emailRouting: '/email-routing',
  testSuite: '/test-suite',
  featureToggles: '/feature-toggles',
  templates: '/templates',
  
  // Profile
  profile: '/profile',
  
  // Auth
  login: '/login',
} as const;
