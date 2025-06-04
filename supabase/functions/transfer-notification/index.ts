
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SMTP configuration using environment variables
const SMTP_CONFIG = {
  host: Deno.env.get('SMTP_HOST') || 'smtp.zoho.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  user: Deno.env.get('SMTP_USER') || '',
  pass: Deno.env.get('SMTP_PASS') || '',
  from: Deno.env.get('FROM_EMAIL') || 'conlantireorders@conlanorders.com',
};

async function sendSMTPEmail(to: string[], subject: string, htmlBody: string) {
  console.log("📧 TRANSFER EMAIL - Attempting to send email via SMTP to:", to);
  console.log("📧 TRANSFER EMAIL - SMTP Config:", {
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    user: SMTP_CONFIG.user,
    from: SMTP_CONFIG.from,
    hasPassword: !!SMTP_CONFIG.pass
  });
  
  // Validate SMTP configuration
  if (!SMTP_CONFIG.user || !SMTP_CONFIG.pass) {
    throw new Error("SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.");
  }
  
  try {
    // Create email message in RFC 5322 format
    const boundary = `boundary_${Date.now()}`;
    const emailContent = [
      `From: ${SMTP_CONFIG.from}`,
      `To: ${to.join(', ')}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      htmlBody,
      ``,
      `--${boundary}--`
    ].join('\r\n');

    // Connect to SMTP server and send email
    const conn = await Deno.connect({
      hostname: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read SMTP response
    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      if (n === null) return '';
      return decoder.decode(buffer.subarray(0, n));
    };

    // Helper function to send SMTP command
    const sendCommand = async (command: string) => {
      console.log("📧 SMTP Command:", command.startsWith('AUTH') ? 'AUTH LOGIN' : command);
      await conn.write(encoder.encode(command + '\r\n'));
      const response = await readResponse();
      console.log("📧 SMTP Response:", response.trim());
      return response;
    };

    // SMTP conversation
    const greeting = await readResponse(); // Read greeting
    console.log("📧 SMTP Greeting:", greeting.trim());
    
    await sendCommand(`EHLO ${SMTP_CONFIG.host}`);
    await sendCommand('STARTTLS');
    
    await sendCommand(`AUTH LOGIN`);
    await sendCommand(btoa(SMTP_CONFIG.user));
    await sendCommand(btoa(SMTP_CONFIG.pass));
    await sendCommand(`MAIL FROM:<${SMTP_CONFIG.from}>`);
    
    for (const recipient of to) {
      await sendCommand(`RCPT TO:<${recipient}>`);
    }
    
    await sendCommand('DATA');
    await conn.write(encoder.encode(emailContent + '\r\n.\r\n'));
    await readResponse();
    await sendCommand('QUIT');
    
    conn.close();
    console.log("✅ TRANSFER EMAIL - Email sent successfully via SMTP");
    return true;
  } catch (error) {
    console.error("❌ TRANSFER EMAIL - SMTP email sending failed:", error);
    throw error;
  }
}

// Email notification for Transfer Request orders
serve(async (req) => {
  console.log("🚀 TRANSFER NOTIFICATION - Edge function called");
  console.log("🚀 TRANSFER NOTIFICATION - Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestBody = await req.json();
    console.log("📧 TRANSFER NOTIFICATION - Request body:", JSON.stringify(requestBody, null, 2));
    
    const { transferData, orderId, recipients } = requestBody;
    
    console.log("📧 TRANSFER NOTIFICATION - Processing order:", orderId);
    console.log("📧 TRANSFER NOTIFICATION - Recipients:", recipients);
    console.log("📧 TRANSFER NOTIFICATION - Transfer data:", transferData);

    if (!recipients || recipients.length === 0) {
      console.log("⚠️ TRANSFER NOTIFICATION - No email recipients provided for order:", orderId);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients provided',
        orderId: orderId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create comprehensive email subject and body
    const emailSubject = `Order Confirmation - ${transferData.store} - ${transferData.productNumber || transferData.product_number}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Order Submitted - Confirmation
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>Store:</strong> ${transferData.store}</li>
            <li style="margin: 8px 0;"><strong>Plant:</strong> ${transferData.plant}</li>
            <li style="margin: 8px 0;"><strong>Product Number:</strong> ${transferData.productNumber || transferData.product_number}</li>
            <li style="margin: 8px 0;"><strong>Description:</strong> ${transferData.description}</li>
            <li style="margin: 8px 0;"><strong>Quantity:</strong> ${transferData.quantity}</li>
            <li style="margin: 8px 0;"><strong>Schedule Arrival:</strong> ${transferData.scheduleArrival || transferData.schedule_arrival}</li>
            <li style="margin: 8px 0;"><strong>Submitted by:</strong> ${transferData.name} (${transferData.email})</li>
          </ul>
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Additional Information:</h3>
          <p><strong>Notes:</strong> ${transferData.notes || 'None'}</p>
        </div>
        
        ${transferData.crossDock === 'Yes' || transferData.cross_dock_type === 'Yes' ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Cross Dock Information:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;"><strong>Destination:</strong> ${transferData.crossDockDestination || transferData.cross_dock_destination}</li>
              <li style="margin: 8px 0;"><strong>Receiver Number:</strong> ${transferData.receiverNo || transferData.cross_dock_receiver_number || 'Not specified'}</li>
              <li style="margin: 8px 0;"><strong>ETA Date:</strong> ${transferData.etaDate || transferData.cross_dock_eta_date || 'Not specified'}</li>
            </ul>
          </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <div style="text-align: center; color: #6c757d; font-size: 14px;">
          <p><em>This order has been assigned ID: ${orderId}</em></p>
          <p><em>Please review and process according to company procedures.</em></p>
          <p style="margin-top: 20px;">Conlan Tire Order Management System</p>
        </div>
      </div>
    `;

    console.log("📧 TRANSFER NOTIFICATION - Sending email to:", recipients);
    console.log("📧 TRANSFER NOTIFICATION - Email subject:", emailSubject);
    
    // Send email via SMTP
    await sendSMTPEmail(recipients, emailSubject, emailBody);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order confirmation email sent successfully',
      recipients: recipients.length,
      orderId: orderId,
      orderType: transferData.type || 'TRANSFER',
      store: transferData.store
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ TRANSFER NOTIFICATION - Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
