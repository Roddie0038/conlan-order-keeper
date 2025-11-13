export const ROUTES = {
  // Dashboard
  dashboard: '/dashboard',
  
  // Request Types
  transferRequest: '/transfer-request',
  mtoRequest: '/mto-request',
  wheelPowderCoat: '/powder-coat-request',
  warrantySubmission: '/warranty-submission',
  crossDockRequest: '/cross-dock-request',
  customerComplaint: '/customer-complaint',
  regionalTransfer: '/regional-transfer',
  
  // Orders & Transfers
  orders: '/all-orders',
  transferHistory: '/transfer-history',
  
  // Tools & Resources
  approvedTread: '/approved-tread-list',
  crossDockForms: '/cross-dock-printable',
  
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
