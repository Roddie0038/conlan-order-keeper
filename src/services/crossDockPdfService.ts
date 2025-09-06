import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { OrderFormValues } from '@/components/order-form/order-form-schema';

export interface CrossDockFormData {
  id: string;
  fields: any;
  pdfUrl: string;
  status: 'current' | 'outdated' | 'regenerated';
}

export interface CrossDockFormFields {
  responsiblePerson: string;
  receiverNo: string;
  fromStore: string;
  toStore: string;
  etaToWarehouse: string;
  etaToStore: string;
  productCode: string;
  description: string;
  quantity: string;
  notes: string;
}

export const generateFormId = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const timeStr = format(now, 'HHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CD-097-${dateStr}-${timeStr}-${random}`;
};

export const createCrossDockFormHTML = (formId: string, fields: CrossDockFormFields): string => {
  const today = format(new Date(), 'MM/dd/yyyy');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Conlan Tire Cross-Dock Form</title>
<style>
  @page { size: 8.5in 11in; margin: 0.5in; }
  html, body { width: 8.5in; height: 11in; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111; }

  .page {
    width: 7.5in;
    min-height: 10in;
    margin: 0 auto;
  }

  .header {
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px;
  }
  .brand {
    display: flex; align-items: center; gap: 10px;
  }
  .brand-logo {
    width: 56px; height: 56px; background: #eee; border: 1px solid #ccc;
  }
  .title {
    font-size: 18pt; font-weight: bold; letter-spacing: 0.3px;
  }
  .meta {
    text-align: right; font-size: 10pt; line-height: 1.2;
  }
  .meta div { margin-top: 2px; }

  .section { margin-bottom: 12px; }
  .section h3 {
    font-size: 12pt; margin: 0 0 6px 0; padding-bottom: 4px; border-bottom: 1px solid #333;
  }

  .grid-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px;
  }
  .field { font-size: 10.5pt; }
  .label { color: #444; font-weight: bold; display: inline-block; min-width: 140px; }
  .value { color: #111; }

  table.items {
    width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10.5pt;
  }
  table.items th, table.items td {
    border: 1px solid #333; padding: 6px 8px; vertical-align: top;
  }
  table.items th { background: #f0f0f0; text-align: left; }

  .notes { min-height: 1.2in; border: 1px dashed #666; padding: 8px; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
  .sig-box { border-top: 1px solid #333; padding-top: 8px; min-height: 52px; }
  .sig-label { font-size: 10pt; color: #444; }

  .footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid #999; padding-top: 8px; margin-top: 12px; font-size: 9.5pt; color: #444;
  }
  .qr {
    width: 90px; height: 90px; background: #eee; border: 1px solid #ccc;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-logo"></div>
        <div class="title">Conlan Tire Cross-Dock Form</div>
      </div>
      <div class="meta">
        <div><strong>Form ID:</strong> ${formId}</div>
        <div><strong>Date:</strong> ${today}</div>
      </div>
    </div>

    <div class="section">
      <h3>Shipment Details</h3>
      <div class="grid-2">
        <div class="field"><span class="label">Responsible Person:</span> <span class="value">${fields.responsiblePerson}</span></div>
        <div class="field"><span class="label">Receiver # (MaddenCo):</span> <span class="value">${fields.receiverNo}</span></div>

        <div class="field"><span class="label">From Store:</span> <span class="value">${fields.fromStore}</span></div>
        <div class="field"><span class="label">To Store:</span> <span class="value">${fields.toStore}</span></div>

        <div class="field"><span class="label">Delivery Date to Warehouse:</span> <span class="value">${fields.etaToWarehouse}</span></div>
        <div class="field"><span class="label">ETA to Store:</span> <span class="value">${fields.etaToStore}</span></div>
      </div>
    </div>

    <div class="section">
      <h3>Items</h3>
      <table class="items">
        <thead>
          <tr>
            <th style="width: 1.2in;">Product Code</th>
            <th>Description</th>
            <th style="width: 0.7in;">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${fields.productCode}</td>
            <td>${fields.description}</td>
            <td>${fields.quantity}</td>
          </tr>
          ${Array.from({ length: 3 }, () => '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>').join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h3>Notes</h3>
      <div class="notes">${fields.notes}</div>
    </div>

    <div class="signatures">
      <div class="sig-box">
        <div class="sig-label">Loaded by (Warehouse) — Name / Signature / Date</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Received by (Store) — Name / Signature / Date</div>
      </div>
    </div>

    <div class="footer">
      <div>Questions? Contact Warehouse 097 or the sending store.</div>
      <div class="qr"></div>
    </div>
  </div>
</body>
</html>`;
};

export const generateCrossDockPDF = async (formValues: OrderFormValues): Promise<CrossDockFormData> => {
  const formId = generateFormId();
  
  // Extract fields from form values
  const fields: CrossDockFormFields = {
    responsiblePerson: formValues.yourName || '',
    receiverNo: formValues.receiverNo || '',
    fromStore: formValues.store || '',
    toStore: formValues.crossDockDestination || '',
    etaToWarehouse: formValues.dateReceived ? format(new Date(formValues.dateReceived), 'MM/dd/yyyy') : '',
    etaToStore: formValues.etaDate ? format(new Date(formValues.etaDate), 'MM/dd/yyyy') : '',
    productCode: formValues.productNumber || '',
    description: formValues.description || '',
    quantity: formValues.quantity?.toString() || '',
    notes: formValues.notes || ''
  };

  // Create HTML and render to PDF
  const htmlContent = createCrossDockFormHTML(formId, fields);
  
  // Create a temporary container for rendering
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.style.pointerEvents = 'none';
  tempDiv.style.opacity = '0';
  document.body.appendChild(tempDiv);

  // Inject the HTML
  tempDiv.innerHTML = htmlContent;

  // Ensure any <style> tags inside the template apply during rendering
  const templateStyles = Array.from(tempDiv.querySelectorAll('style'));
  const injectedStyles: HTMLStyleElement[] = [];
  for (const styleEl of templateStyles) {
    const s = document.createElement('style');
    s.textContent = styleEl.textContent || '';
    document.head.appendChild(s);
    injectedStyles.push(s);
  }

  try {
    // Find the main page container and force explicit dimensions for html2canvas
    const pageElement = tempDiv.querySelector('.page') as HTMLElement | null;
    if (!pageElement) {
      throw new Error('Template did not contain a .page element');
    }

    // Force predictable dimensions (Letter @ 96DPI ≈ 816x1056)
    pageElement.style.width = '816px';
    pageElement.style.minHeight = '1056px';
    pageElement.style.backgroundColor = '#ffffff';
    pageElement.style.boxSizing = 'border-box';

    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      width: 816,
      height: Math.max(1056, pageElement.scrollHeight)
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Rendered canvas has zero size');
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const imgData = canvas.toDataURL('image/png');
    if (!imgData || !imgData.startsWith('data:image/png')) {
      throw new Error('Failed to produce PNG data from canvas');
    }
    pdf.addImage(imgData, 'PNG', 0, 0, 612, 792);

    // Convert to blob
    const pdfBlob = pdf.output('blob');

    // Print immediately from blob (doesn't wait for upload)
    openPrintDialogFromBlob(pdfBlob);

    // Upload in background and return form data with storage path
    const storagePath = `forms/${formId}.pdf`;
    
    // Start background upload but return immediately
    uploadAndPersist(pdfBlob, formId, storagePath, fields).catch(error => {
      console.error('Background upload failed:', error);
      // Could emit a custom event or use a global error handler here
    });

    return {
      id: formId,
      fields,
      pdfUrl: storagePath, // Store path, not public URL
      status: 'current'
    };

  } finally {
    // Clean up
    try { document.body.removeChild(tempDiv); } catch {}
    // Remove any injected styles we added
    try { injectedStyles.forEach(s => s.remove()); } catch {}
  }
};

// Helper function to print from blob using hidden iframe
const openPrintDialogFromBlob = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      iframe.remove();
    }, 2000);
  };
};

// Background upload and persist function
const uploadAndPersist = async (
  pdfBlob: Blob, 
  formId: string, 
  storagePath: string, 
  fields: CrossDockFormFields
): Promise<void> => {
  try {
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('crossdock-pdfs')
      .upload(storagePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Save form metadata to database
    const { error: dbError } = await supabase
      .from('cross_dock_forms')
      .insert({
        id: formId,
        fields: fields as any,
        pdf_url: storagePath, // Store storage path, not public URL
        status: 'current'
      });

    if (dbError) {
      throw new Error(`Failed to save form metadata: ${dbError.message}`);
    }

    console.log('Cross-dock form uploaded and persisted successfully:', formId);
  } catch (error) {
    console.error('Failed to upload and persist cross-dock form:', error);
    throw error;
  }
};

// Helper function to get signed URL for viewing/printing stored PDFs
export const getSignedPdfUrl = async (storagePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('crossdock-pdfs')
    .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry
  
  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }
  
  return data.signedUrl;
};

export const openPrintDialog = async (pdfUrl: string): Promise<void> => {
  try {
    // If it's a storage path, get signed URL first
    if (!pdfUrl.startsWith('http')) {
      const signedUrl = await getSignedPdfUrl(pdfUrl);
      const printWindow = window.open(signedUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else {
      // Direct URL (fallback for old format)
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  } catch (error) {
    console.error('Failed to open print dialog:', error);
    throw error;
  }
};

export const validateCrossDockFields = (formValues: OrderFormValues): string[] => {
  const errors: string[] = [];
  
  if (!formValues.crossDockDestination) {
    errors.push('Destination store is required');
  }
  
  if (!formValues.receiverNo) {
    errors.push('Receiver number is required');
  }
  
  if (!formValues.etaDate) {
    errors.push('ETA date is required');
  }
  
  if (!formValues.yourName) {
    errors.push('Responsible person name is required');
  }
  
  if (!formValues.productNumber) {
    errors.push('Product number is required');
  }
  
  if (!formValues.description) {
    errors.push('Product description is required');
  }
  
  if (!formValues.quantity) {
    errors.push('Quantity is required');
  }

  return errors;
};