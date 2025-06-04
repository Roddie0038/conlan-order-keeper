
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
  console.log("📧 Attempting to send Transfer email via SMTP to:", to);
  
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
      await conn.write(encoder.encode(command + '\r\n'));
      return await readResponse();
    };

    // SMTP conversation
    await readResponse(); // Read greeting
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
    console.log("✅ Transfer Email sent successfully via SMTP");
    return true;
  } catch (error) {
    console.error("❌ SMTP Transfer email sending failed:", error);
    throw error;
  }
}

// Email notification for Transfer Request orders
serve(async (req) => {
  console.log("🚀 EDGE FUNCTION - transfer-notification called");
  
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
    const { transferData, orderId, recipients } = await req.json();
    console.log("📧 Processing Transfer notification:", orderId);
    console.log("📧 Recipients:", recipients);

    if (!recipients || recipients.length === 0) {
      console.log("⚠️ No email recipients provided for Transfer order:", orderId);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients provided',
        orderId: orderId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailSubject = `Transfer Request - ${transferData.store} - ${transferData.product_number || transferData.productNumber}`;
    
    const emailBody = `
      <h2>New Transfer Request Submitted</h2>
      
      <h3>Order Details:</h3>
      <ul>
        <li><strong>Store:</strong> ${transferData.store}</li>
        <li><strong>Plant:</strong> ${transferData.plant}</li>
        <li><strong>Product Number:</strong> ${transferData.product_number || transferData.productNumber}</li>
        <li><strong>Description:</strong> ${transferData.description}</li>
        <li><strong>Quantity:</strong> ${transferData.quantity}</li>
        <li><strong>Schedule Arrival:</strong> ${transferData.schedule_arrival || transferData.scheduleArrival}</li>
        <li><strong>Submitted by:</strong> ${transferData.name} (${transferData.email})</li>
      </ul>

      <h3>Additional Information:</h3>
      <p><strong>Notes:</strong> ${transferData.notes || 'None'}</p>
      
      ${transferData.cross_dock_type === 'Yes' || transferData.crossDock === 'Yes' ? `
        <h3>Cross Dock Information:</h3>
        <ul>
          <li><strong>Destination:</strong> ${transferData.cross_dock_destination || transferData.crossDockDestination}</li>
          <li><strong>Receiver Number:</strong> ${transferData.cross_dock_receiver_number || transferData.receiverNo || 'Not specified'}</li>
          <li><strong>ETA Date:</strong> ${transferData.cross_dock_eta_date || transferData.etaDate || 'Not specified'}</li>
        </ul>
      ` : ''}
      
      <hr>
      <p><em>This transfer request has been assigned ID: ${orderId}</em></p>
      <p><em>Please review and process according to transfer procedures.</em></p>
    `;

    console.log("📧 Sending Transfer notification to:", recipients);
    
    // Send email via SMTP
    await sendSMTPEmail(recipients, emailSubject, emailBody);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Transfer notification sent successfully',
      recipients: recipients.length,
      orderId: orderId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ Error in transfer-notification:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
