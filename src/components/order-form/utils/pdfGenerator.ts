
import { jsPDF } from 'jspdf';
import { OrderFormValues } from '../order-form-schema';
import { format } from 'date-fns';

export const generateCrossDockPDF = (formData: OrderFormValues) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add a title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 128);
  doc.text("Cross Dock Transfer Form", 105, 20, { align: "center" });
  
  // Add Conlan Tire logo
  // Note: This would need to be a data URL for jsPDF
  // doc.addImage(logoDataUrl, "PNG", 10, 10, 30, 15);
  
  // Add a timestamp and store reference
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 30);
  doc.text(`Store: ${formData.store}`, 15, 35);
  
  // Add form data
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let yPos = 45;
  const lineHeight = 7;
  
  // Title for form data
  doc.setFont(undefined, 'bold');
  doc.text("Cross Dock Details:", 15, yPos);
  yPos += lineHeight;
  
  // Form data
  doc.setFont(undefined, 'normal');
  doc.text(`From Store: ${formData.store}`, 15, yPos);
  yPos += lineHeight;
  
  doc.text(`To Store: ${formData.crossDockDestination}`, 15, yPos);
  yPos += lineHeight;
  
  doc.text(`Transfer Work Order Number: ${formData.transferWorkOrderNumber || "N/A"}`, 15, yPos);
  yPos += lineHeight;
  
  doc.text(`Trailer Number: ${formData.trailerNumber || "N/A"}`, 15, yPos);
  yPos += lineHeight;
  
  doc.text(`Estimated Arrival: ${formData.eta ? format(new Date(formData.eta), 'PP') : "N/A"}`, 15, yPos);
  yPos += lineHeight;
  
  // Title for order details
  yPos += 5;
  doc.setFont(undefined, 'bold');
  doc.text("Order Details:", 15, yPos);
  yPos += lineHeight;
  
  // Order details
  doc.setFont(undefined, 'normal');
  doc.text(`Product Number: ${formData.productNumber}`, 15, yPos);
  yPos += lineHeight;
  
  doc.text(`Description: ${formData.description}`, 15, yPos);
  yPos += lineHeight;
  
  doc.text(`Quantity: ${formData.quantity}`, 15, yPos);
  yPos += lineHeight;
  
  // Notes
  if (formData.notes) {
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text("Additional Notes:", 15, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    const notes = doc.splitTextToSize(formData.notes, 180);
    doc.text(notes, 15, yPos);
    yPos += lineHeight * notes.length;
  }
  
  // Add a signature line
  yPos += 15;
  doc.line(15, yPos, 95, yPos);
  yPos += 5;
  doc.text("Signature", 50, yPos);
  
  doc.line(115, yPos - 5, 195, yPos - 5);
  doc.text("Date", 150, yPos);
  
  // Save the PDF with a specific name
  const pdfName = `CrossDock_${formData.store}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(pdfName);
  
  return pdfName;
};

export const generateAndEmailCrossDockPDF = async (formData: OrderFormValues) => {
  try {
    const pdfName = generateCrossDockPDF(formData);
    
    // Here we would typically call a backend service to send the email
    console.log(`PDF generated and would send email to: ${formData.managersEmail} and admin@conlantire.com`);
    
    return {
      success: true,
      filename: pdfName
    };
  } catch (error) {
    console.error("Error generating or emailing PDF:", error);
    return {
      success: false,
      error: "Failed to generate or email PDF"
    };
  }
};
