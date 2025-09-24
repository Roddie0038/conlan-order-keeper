# Wheel Order Diagnostic Mode

## Overview
The enhanced wheel order submission system includes a comprehensive diagnostic mode that provides full visibility into the submission process, payload structure, and timing information.

## Enabling Diagnostic Mode

### Environment Variable
Add the following environment variable to enable diagnostic mode:

```bash
VITE_WHEEL_DIAG=true
```

### Local Development
1. Create or update your `.env.local` file:
   ```
   VITE_WHEEL_DIAG=true
   ```

2. Restart your development server
3. Navigate to the Wheel Order form

## Features

### R1 - Diagnostic Mode & Payload Viewer
When `VITE_WHEEL_DIAG=true`:
- **Diagnostic Banner**: Shows at top of form indicating diagnostic mode is active
- **Payload Viewer Modal**: Displays exact JSON sent to Supabase and response received
- **Step Timing Logs**: Tracks each step of submission with precise timestamps
- **Field Mapping Analysis**: Shows which required fields are present and schema alignment

### R2 - Server Timestamp & UI Banner
- **Success Banner**: Shows immediately after successful Supabase insert
- **Server Time Display**: Formatted timestamp from server (not client)
- **Order Reference**: Displays unique order ID for tracking
- **Payload Button**: In diagnostic mode, provides quick access to payload viewer

### R3 - Single Source of Truth
- **Supabase First**: UI success is tied only to Supabase insert completion
- **Non-blocking Sheets**: Google Sheets submission has 3-second timeout and doesn't block success
- **Error Isolation**: Sheets failures don't affect UI success state

### R4 - Field Mapping & Schema Alignment
- **Optimized Payload**: Direct mapping to `wheel_orders` table schema
- **Proper Field Names**: Uses lowercase field names (e.g., `desiredcolor`, `wheelsize`)
- **Numeric Conversion**: Ensures `quantity` and `handholes` are properly typed as numbers
- **Server Timestamp**: Timestamp set by edge function for consistency

## Using the Payload Viewer

### Opening the Viewer
1. Enable diagnostic mode (`VITE_WHEEL_DIAG=true`)
2. Submit a wheel order
3. Click "View Payload" button in diagnostic banner or success banner

### Payload Viewer Sections
- **Submission Timeline**: Step-by-step timing with success/error status
- **Server Timestamp**: Authoritative timestamp from database
- **Pre-Insert Payload**: Exact JSON sent to Supabase before insert
- **Insert Response**: Complete row returned from database after insert
- **Field Mapping Analysis**: Validation of required fields and schema alignment

### Reading Timing Logs
Each step shows:
- **Timestamp**: Precise time with millisecond accuracy
- **Duration**: Time taken for that step
- **Status**: Success (green), Error (red), or Pending (yellow)
- **Error Details**: Specific error messages if step failed

## Test Cases

### Case A: Minimal Order (qty 4)
1. Fill only required fields
2. Set quantity to 4
3. Submit and verify:
   - Success banner appears with server timestamp
   - Payload viewer shows minimal but complete payload
   - All required fields present in analysis

### Case B: Typical Order (qty 32, Pilot/Steel/WHITE)
1. Fill all standard fields
2. Set quantity to 32, type to Pilot, material to Steel, color to WHITE
3. Submit and verify:
   - All wheel specifications captured correctly
   - Timing shows reasonable performance
   - Google Sheets call doesn't block success

### Case C: Large Order (qty 64)
1. Set quantity to 64
2. Fill all optional fields
3. Submit and verify:
   - Large payload handled efficiently
   - Success shows immediately regardless of Sheets status
   - Complete field mapping in viewer

## Troubleshooting

### Diagnostic Mode Not Working
- Verify `VITE_WHEEL_DIAG=true` is set
- Restart development server
- Check browser console for diagnostic logs

### Payload Viewer Empty
- Ensure diagnostic mode is enabled before submission
- Check if submission completed successfully
- Look for JavaScript errors in console

### Timing Issues
- Network latency affects step timing
- Supabase insert should be < 500ms typically
- Google Sheets timeout is set to 3 seconds

## Performance Monitoring

Watch for these timing benchmarks:
- **Form Validation**: < 50ms
- **Payload Creation**: < 10ms  
- **Supabase Insert**: < 500ms
- **Google Sheets**: < 3000ms (with timeout)
- **Total Time**: < 4000ms

## Integration with OT Platform

The enhanced payload includes these OT-compatible fields:
- `submitted_at`: Server-side timestamp
- `store`: Normalized store name
- `plant`: Destination plant
- `status`: Always 'open'
- `ordertype`: 'WHEEL_POWDER_COATING'

These ensure orders appear correctly in OT platform views.