# Cross-Dock Form Generation System

## Overview

This system provides professional PDF generation for Cross-Dock transfer forms in the Ordering Platform. When users select "Cross-Dock: Yes", they can generate a letter-sized PDF form that automatically opens the print dialog and adds the line to their order.

## Features

- **Professional PDF Generation**: Letter-sized (8.5" x 11") PDFs using jsPDF + html2canvas
- **Auto-Print Workflow**: Opens system print dialog immediately after generation
- **Auto-Add to Order**: Automatically adds the cross-dock line to the draft order
- **Form Persistence**: Saves form metadata and PDF to Supabase for reprinting
- **Change Detection**: Detects when form fields change after generation
- **Status Tracking**: Shows current/outdated status with regeneration options

## File Structure

```
src/
├── services/
│   └── crossDockPdfService.ts          # Core PDF generation logic
└── components/order-form/sections/cross-dock/
    ├── CrossDockFormBanner.tsx         # Info banner for cross-dock mode
    ├── CrossDockFormStatus.tsx         # Status chip with view/print/regenerate
    ├── CrossDockStickyActions.tsx      # Sticky footer with main action button
    └── CrossDockSection.tsx            # Updated main section component
```

## Database Schema

### cross_dock_forms Table
```sql
CREATE TABLE cross_dock_forms (
  id          TEXT PRIMARY KEY,           -- Format: CD-097-YYYYMMDD-HHMMSS-###
  order_id    BIGINT,                     -- Links to orders table when submitted
  line_id     TEXT,                       -- Client-side line identifier
  fields      JSONB NOT NULL,             -- Snapshot of form fields used
  pdf_url     TEXT NOT NULL,              -- Public URL to stored PDF
  status      TEXT DEFAULT 'current',     -- 'current' | 'outdated' | 'regenerated'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### orders Table (Additional Columns)
```sql
ALTER TABLE orders ADD COLUMN 
  cross_dock_form_id TEXT,               -- References cross_dock_forms.id
  cross_dock_form_url TEXT,              -- Direct PDF URL for quick access
  cross_dock_snapshot JSONB;             -- Form field snapshot
```

## User Flow

1. **Enable Cross-Dock**: User toggles "Cross-Dock: Yes"
   - Shows info banner: "Creating Cross-Dock — This is for stores shipping cross-dock only..."
   - Reveals cross-dock form fields
   - Shows sticky footer with main action button

2. **Generate Form**: User clicks "Generate & Print Cross-Dock Form + Add Line"
   - Validates required fields (destination, receiver #, ETA, etc.)
   - Generates professional PDF using HTML template
   - Uploads PDF to `crossdock-pdfs` bucket
   - Saves metadata to `cross_dock_forms` table
   - Opens system print dialog immediately
   - Auto-adds line to current draft order
   - Shows success toast

3. **Form Status**: After generation, shows status chip with:
   - Form ID badge (e.g., "Form #CD-097-20250904-...")
   - "View/Print" button (reopens PDF for printing)
   - Regeneration option if form becomes outdated

4. **Change Detection**: If user modifies any cross-dock field after generation:
   - Marks form as "outdated"
   - Shows warning: "Form out of date → Regenerate"
   - Provides "↻ Regenerate" button

5. **Order Submission**: Continues existing OT Platform integration
   - Form metadata preserved with submitted order
   - PDF remains accessible for reprinting

## PDF Template

The generated PDF includes:
- **Header**: Conlan Tire branding, Form ID, Date
- **Shipment Details**: Responsible person, receiver #, from/to stores, ETA dates
- **Items Table**: Product code, description, quantity (with extra rows)
- **Notes Section**: Free-form notes field
- **Signatures**: Warehouse (loaded by) and Store (received by) signature lines
- **Footer**: Contact info and QR code placeholder

## Technical Implementation

### PDF Generation (`crossDockPdfService.ts`)

```typescript
// Generate unique form ID
const formId = generateFormId(); // CD-097-YYYYMMDD-HHMMSS-###

// Create HTML template with form data
const htmlContent = createCrossDockFormHTML(formId, fields);

// Render to PDF using html2canvas + jsPDF
const canvas = await html2canvas(tempDiv, { ... });
const pdf = new jsPDF({ orientation: 'portrait', format: 'letter' });
pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 612, 792);

// Upload to Supabase storage
const { data } = await supabase.storage
  .from('crossdock-pdfs')
  .upload(`${formId}.pdf`, pdfBlob);

// Save metadata
await supabase.from('cross_dock_forms').insert({ ... });
```

### Change Detection

The system tracks form field changes by:
1. Creating a JSON snapshot of relevant fields when form is generated
2. Watching form values with React Hook Form
3. Comparing current values to stored snapshot
4. Setting `isFormOutdated` flag when differences detected

### Storage & Persistence

- **Storage Bucket**: `crossdock-pdfs` (existing bucket)
- **File Naming**: `{formId}.pdf` (e.g., `CD-097-20250904-143022-001.pdf`)
- **Public Access**: PDFs are publicly accessible via storage URLs
- **Metadata**: Full form field snapshot stored in database for regeneration

## Validation Rules

Required fields for cross-dock form generation:
- Destination store/plant (`crossDockDestination`)
- Receiver number (`receiverNo`) 
- ETA date (`etaDate`)
- Responsible person name (`yourName`)
- Product number (`productNumber`)
- Product description (`description`)
- Quantity (`quantity`)

## Integration Points

- **No Changes to OT Platform**: Existing cross-dock submission logic unchanged
- **Backwards Compatible**: Existing cross-dock orders continue to work
- **Storage**: Uses existing `crossdock-pdfs` bucket
- **Auth**: Uses existing Supabase RLS policies
- **Styling**: Follows design system patterns

## Testing Scenarios

1. **Basic Flow**: Generate form → Print → Add line → Submit order
2. **Multiple Lines**: Create order with 2 cross-dock + 1 regular line
3. **Regeneration**: Modify fields after generation → Regenerate
4. **Reprinting**: View/Print from status chip after generation
5. **Validation**: Try generating without required fields
6. **Layout**: Test with long product descriptions and many items
7. **Integration**: Ensure OT Platform processes orders correctly

## Error Handling

- **Validation Errors**: Toast with specific missing field messages
- **PDF Generation Fails**: Toast with error details, no partial state
- **Upload Fails**: Toast with upload error, cleanup temporary files
- **Database Errors**: Toast with persistence error, PDF still generated
- **Print Dialog Blocked**: Graceful fallback, PDF still accessible via status chip

## Performance Considerations

- **Client-Side Generation**: Avoids server load, immediate feedback
- **Temporary DOM**: HTML template rendered off-screen, cleaned up after capture
- **File Size**: PDFs optimized for print quality vs file size
- **Storage**: Uses Supabase storage CDN for fast access
- **Debounced Change Detection**: Prevents excessive outdated flag updates