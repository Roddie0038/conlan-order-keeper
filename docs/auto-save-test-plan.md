# Auto-Save Feature Test Plan

## Overview
This document outlines the testing requirements for the comprehensive auto-save functionality implemented across all forms in the Ordering Platform.

## Forms Covered
- ✅ Order Transfer Forms
- ✅ Customer Complaint Forms  
- ✅ Warranty Claim Forms (Retread)
- ✅ MTO (Make-to-Order) Forms
- ✅ Wheel Powder Coating Order Forms

## Test Scenarios

### 1. Basic Auto-Save Functionality
- [ ] Enter data in any form field
- [ ] Verify data saves automatically after 2 seconds (debounced)
- [ ] Check localStorage contains saved data with correct structure
- [ ] Verify "Last saved" timestamp appears in banner

### 2. Data Restoration
- [ ] Fill out form partially
- [ ] Refresh page/navigate away and return
- [ ] Verify restoration banner appears
- [ ] Confirm all entered data is restored correctly
- [ ] Check excluded fields (files, timestamps) are not restored

### 3. Cross-Browser Compatibility  
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Verify localStorage persistence works across browsers
- [ ] Test with different localStorage quotas

### 4. Edge Cases
- [ ] Fill localStorage to capacity - verify graceful degradation
- [ ] Test with browser privacy mode/incognito
- [ ] Verify auto-save disabled for admin users
- [ ] Test form submission clears auto-saved data

### 5. Data Security & Isolation
- [ ] Verify data isolated per user (different user IDs)
- [ ] Check sensitive data (files) excluded from persistence
- [ ] Test cleanup of old auto-save entries (7+ days)

### 6. Performance Testing
- [ ] Verify no performance impact during rapid typing
- [ ] Test with large form data (stress test)
- [ ] Check memory usage doesn't grow excessively

### 7. Critical Field Priority Saving
- [ ] Test immediate save for critical fields (customer name, etc.)
- [ ] Verify 100ms debounced save triggers correctly

### 8. Manual Clear Functionality
- [ ] Use "Clear Form" button
- [ ] Verify localStorage data removed
- [ ] Check form resets to initial state
- [ ] Confirm "Form Cleared" toast appears

## Expected Behaviors

### Storage Structure
```json
{
  "data": { /* form fields */ },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "formType": "complaint|warranty|order|mto|wheel-powder-coating",
  "userId": "user-id",
  "version": "1.0"
}
```

### Visual Indicators
- Restoration banner on data load
- Auto-save status with timestamps
- Clear form button availability
- Toast notifications for actions

## Success Criteria
- ✅ Zero data loss during normal usage
- ✅ Seamless user experience
- ✅ No performance degradation  
- ✅ Proper cleanup and data isolation
- ✅ Cross-browser compatibility
- ✅ Admin users excluded from auto-save

## Browser Simulation Tests
1. **Page Refresh**: Fill form → F5 → verify restoration
2. **Navigation**: Fill form → go to different page → return → verify restoration  
3. **Browser Close**: Fill form → close browser → reopen → verify restoration
4. **Tab Close**: Fill form → close tab → open new tab → verify restoration