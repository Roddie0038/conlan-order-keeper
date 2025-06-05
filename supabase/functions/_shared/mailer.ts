
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    console.log("📧 MAILER - Sending email to:", to);
    console.log("📧 MAILER - Subject:", subject);
    
    // Get sender email from environment
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'conlantireorders@conlanorders.com';
    
    // Filter recipients based on allowed domains if configured
    const allowedDomains = Deno.env.get('ALLOWED_DOMAINS')?.split(',') || [];
    let filteredRecipients = to;
    
    if (allowedDomains.length > 0) {
      filteredRecipients = to.filter(email => {
        const domain = email.split('@')[1];
        return allowedDomains.includes(domain);
      });
      console.log("📧 MAILER - Filtered recipients:", filteredRecipients);
    }
    
    if (filteredRecipients.length === 0) {
      console.log("⚠️ MAILER - No valid recipients after domain filtering");
      return { success: false, error: "No valid recipients" };
    }

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: filteredRecipients,
      subject: subject,
      html: html,
    });

    console.log("✅ MAILER - Email sent successfully:", emailResponse);
    return { success: true, data: emailResponse };
    
  } catch (error) {
    console.error("❌ MAILER - Error sending email:", error);
    return { success: false, error: error.message };
  }
}
