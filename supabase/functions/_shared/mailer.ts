
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
}

interface EmailTemplateData {
  orderType: string;
  orderDetails: Record<string, any>;
  submitterInfo: {
    name: string;
    email: string;
  };
  orderId: string;
  isCrossDock?: boolean;
  crossDockDetails?: {
    destination: string;
    receiverNumber?: string;
    etaDate?: string;
  };
}

interface LogEmailOptions {
  orderId: string;
  orderType: string;
  recipients: string[];
  status: 'sent' | 'failed';
  notificationType: string;
  platform?: string;
  isCrossDock?: boolean;
  emailProvider?: string;
  errorMessage?: string;
}

/**
 * Create standardized HTML template for all order notifications
 */
export function createEmailTemplate(data: EmailTemplateData): string {
  const { orderType, orderDetails, submitterInfo, orderId, isCrossDock, crossDockDetails } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">
          ${isCrossDock ? '🚚 Cross-Dock ' : ''}${orderType} Order Submitted
        </h1>
      </div>
      
      ${isCrossDock ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0; font-size: 16px;">
            ⚠️ Cross-Dock Order Alert
          </h3>
          <p style="margin: 5px 0; color: #856404;">This order requires cross-dock processing</p>
          ${crossDockDetails ? `
            <ul style="list-style: none; padding: 0; margin: 10px 0;">
              <li style="margin: 5px 0;"><strong>Destination:</strong> ${crossDockDetails.destination}</li>
              <li style="margin: 5px 0;"><strong>Receiver Number:</strong> ${crossDockDetails.receiverNumber || 'Not specified'}</li>
              <li style="margin: 5px 0;"><strong>ETA Date:</strong> ${crossDockDetails.etaDate || 'Not specified'}</li>
            </ul>
          ` : ''}
        </div>
      ` : ''}
      
      <div style="padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0; font-size: 18px;">Order Details:</h3>
          <ul style="list-style: none; padding: 0;">
            ${Object.entries(orderDetails).map(([key, value]) => {
              if (value === null || value === undefined || value === '') return '';
              const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return `<li style="margin: 8px 0; padding: 5px; border-bottom: 1px solid #dee2e6;">
                <strong>${displayKey}:</strong> ${value}
              </li>`;
            }).join('')}
          </ul>
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0; font-size: 18px;">Submitter Information:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${submitterInfo.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${submitterInfo.email}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <div style="text-align: center; color: #6c757d; font-size: 14px;">
          <p><em>Order ID: ${orderId}</em></p>
          <p><em>Please review and process according to company procedures.</em></p>
          <p style="margin-top: 20px; font-weight: bold;">Conlan Tire Order Management System</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Enhanced email sending with domain filtering and logging
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    console.log("📧 MAILER - Sending email to:", to);
    console.log("📧 MAILER - Subject:", subject);
    
    // Get sender email from environment
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'conlantireorders@conlanorders.com';
    
    // Enhanced domain filtering with support for verified emails
    const allowedDomains = Deno.env.get('ALLOWED_DOMAINS')?.split(',') || 
      ['conlantire.com', 'aol.com', 'gmail.com', 'conlanorders.com'];
    
    let filteredRecipients = to.filter(email => {
      const domain = email.split('@')[1];
      // Always allow conlantire.com and aol.com
      if (['conlantire.com', 'aol.com', 'conlanorders.com'].includes(domain)) {
        return true;
      }
      // For other domains, check if they're in allowed list
      return allowedDomains.includes(domain);
    });
    
    console.log("📧 MAILER - Filtered recipients:", filteredRecipients);
    
    if (filteredRecipients.length === 0) {
      console.log("⚠️ MAILER - No valid recipients after domain filtering");
      return { success: false, error: "No valid recipients after domain filtering" };
    }

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: filteredRecipients,
      subject: subject,
      html: html,
    });

    console.log("✅ MAILER - Email sent successfully:", emailResponse);
    return { 
      success: true, 
      data: emailResponse,
      sentTo: filteredRecipients
    };
    
  } catch (error) {
    console.error("❌ MAILER - Error sending email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Log email notifications to the database
 */
export async function logEmailNotification(options: LogEmailOptions) {
  try {
    const {
      orderId,
      orderType,
      recipients,
      status,
      notificationType,
      platform = 'ordering_platform',
      isCrossDock = false,
      emailProvider = 'resend',
      errorMessage
    } = options;

    // Log each recipient separately for better tracking
    const logPromises = recipients.map(recipient => 
      supabase.from('notification_logs').insert({
        order_id: orderId,
        order_type: orderType,
        recipient_email: recipient,
        status: status,
        notification_type: notificationType,
        platform: platform,
        cross_dock_order: isCrossDock,
        email_provider: emailProvider,
        error_message: errorMessage,
        metadata: {
          timestamp: new Date().toISOString(),
          recipients_count: recipients.length
        }
      })
    );

    const results = await Promise.allSettled(logPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`📊 EMAIL LOGGING - Logged ${successful}/${recipients.length} email notifications`);
    
    return { success: true, logged: successful };
  } catch (error) {
    console.error("❌ EMAIL LOGGING - Error logging email notification:", error);
    return { success: false, error: error.message };
  }
}
