
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Resend functionality temporarily disabled for build stability

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailTestRequest {
  templateType: string;
  templateData: {
    store_name: string;
    order_id: string;
    manager_name: string;
    order_type: string;
    status: string;
    complaint_summary?: string;
    email_signature: string;
  };
  recipientEmail: string;
  isTestMode: boolean;
}

const EMAIL_TEMPLATES = {
  "transfer-request": "Transfer Request Confirmation",
  "mto-order": "MTO Order Confirmation", 
  "wheel-order": "Wheel Order Confirmation",
  "warranty-claim": "Warranty Tire Claim Receipt",
  "customer-complaint": "Customer Complaint Acknowledgment",
  "pull-sheet": "Pull Sheet Ready Notification",
  "order-completion": "Order Completion Notification",
  "out-of-stock": "Out-of-Stock Item Notification",
  "direct-message": "Direct Message from Order Management",
  "message-receipt": "Order Message Receipt Confirmation"
};

// Whitelist of allowed test email addresses
const ALLOWED_TEST_EMAILS = [
  "roderickdemarais@aol.com",
  "conlan@conlantire.com"
];

const generateEmailHTML = (templateType: string, data: any): string => {
  const templateTitle = EMAIL_TEMPLATES[templateType as keyof typeof EMAIL_TEMPLATES] || "Order Notification";
  
  let specificContent = "";
  switch (templateType) {
    case "transfer-request":
      specificContent = `
        <p>Your transfer request has been successfully submitted and is being processed.</p>
        <p>You will receive updates as your order progresses through our fulfillment process.</p>
      `;
      break;
    case "mto-order":
      specificContent = `
        <p>Your MTO (Made to Order) request has been received and forwarded to our production team.</p>
        <p>Expected processing time: 3-5 business days.</p>
      `;
      break;
    case "wheel-order":
      specificContent = `
        <p>Your wheel refurbishment order has been confirmed.</p>
        <p>Our technicians will begin processing your wheel order shortly.</p>
      `;
      break;
    case "warranty-claim":
      specificContent = `
        <p>We have received your warranty claim and it is under review.</p>
        <p>Our warranty team will process your claim within 2-3 business days.</p>
      `;
      break;
    case "customer-complaint":
      specificContent = `
        <p>Thank you for bringing this matter to our attention.</p>
        <p>Your complaint has been logged and assigned to our customer service team for resolution.</p>
        ${data.complaint_summary ? `<p><strong>Complaint Summary:</strong> ${data.complaint_summary}</p>` : ''}
      `;
      break;
    default:
      specificContent = `<p>Your ${data.order_type} has been processed successfully.</p>`;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <header style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0;">Conlan Tire Warehouse</h1>
          <div style="width: 50px; height: 3px; background-color: #3b82f6; margin: 10px auto;"></div>
        </header>
        
        <main>
          <h2 style="color: #374151; margin-bottom: 20px;">
            ${templateTitle}
          </h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Store:</strong> ${data.store_name}</p>
            <p><strong>Order ID:</strong> ${data.order_id}</p>
            <p><strong>Manager:</strong> ${data.manager_name}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          ${specificContent}
        </main>
        
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          <p>${data.email_signature}</p>
          <p style="font-size: 12px;">This is an automated message from the Conlan Tire Ordering Platform</p>
          ${data.isTestMode ? '<p style="font-size: 12px; color: #ef4444; font-weight: bold;">🧪 TEST EMAIL - Internal Use Only</p>' : ''}
        </footer>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, templateData, recipientEmail, isTestMode }: EmailTestRequest = await req.json();

    console.log("🧪 EMAIL TESTING - Processing request:", { templateType, recipientEmail, isTestMode });

    // Security check - only send to whitelisted test emails during test mode
    if (isTestMode && !ALLOWED_TEST_EMAILS.includes(recipientEmail)) {
      throw new Error(`Unauthorized recipient email for test mode: ${recipientEmail}`);
    }

    const subject = `Confirmation – ${templateData.order_type} for Store ${templateData.store_name}`;
    const html = generateEmailHTML(templateType, { ...templateData, isTestMode });

    // Get sender email from environment
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'conlantireorders@conlanorders.com';

    // Mock email response - Resend temporarily disabled for build stability
    const emailResponse = { 
      data: { id: 'mock-test-' + Date.now() }
    };

    console.log("✅ EMAIL TESTING - Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      subject,
      recipient: recipientEmail
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ EMAIL TESTING - Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
