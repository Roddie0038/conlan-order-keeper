
import { OrderFormValues } from "@/components/order-form/order-form-schema";

/**
 * Sends a Cross Dock order notification email with the PDF attachment
 * 
 * @param formData The order form data
 * @param pdfBase64 Base64 encoded PDF to attach to the email
 * @returns Promise with the email sending result
 */
export const sendCrossDockEmail = async (
  formData: OrderFormValues, 
  pdfBase64?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    // For now, we're just logging the email details
    // In a production environment, this would connect to a backend service
    console.log('Cross Dock Email would be sent to:', formData.managersEmail);
    console.log('Email would also be CC\'d to: admin@conlantire.com');
    console.log('Email subject:', `New Cross Dock Order Submitted – ${formData.store}`);
    
    const emailBody = `
      A new Cross Dock order has been submitted:
      
      Store: ${formData.store}
      Cross Dock Destination: ${formData.crossDockDestination}
      Transfer Work Order Number: ${formData.transferWorkOrderNumber}
      Trailer Number: ${formData.trailerNumber || 'N/A'}
      ETA: ${formData.eta ? new Date(formData.eta).toLocaleDateString() : 'N/A'}
      
      Product Number: ${formData.productNumber}
      Description: ${formData.description}
      Quantity: ${formData.quantity}
      
      Submitted by: ${formData.yourName}
      Timestamp: ${new Date().toLocaleString()}
    `;
    
    console.log('Email body would contain:', emailBody);
    
    if (pdfBase64) {
      console.log('Email would include PDF attachment');
    }
    
    // Mock successful email sending
    return { 
      success: true, 
      message: 'Cross Dock notification email sent successfully' 
    };
  } catch (error) {
    console.error('Error sending Cross Dock email:', error);
    return { 
      success: false, 
      message: 'Failed to send Cross Dock notification email' 
    };
  }
};
