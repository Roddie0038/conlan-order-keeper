
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplaintNotificationRequest {
  complaint: {
    id: string;
    store_number: string;
    store_name: string;
    complaint_type: string;
    issue_type: string;
    work_order_number?: string;
    order_id?: string;
    identified_concern: string;
    submitted_by_name: string;
    submitted_by_email: string;
    sales_person?: string;
    date_submitted: string;
  };
  recipients: string[];
  attachmentUrls: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { complaint, recipients, attachmentUrls }: ComplaintNotificationRequest = await req.json();

    console.log(`📧 Sending complaint notification for complaint ID: ${complaint.id}`);
    console.log(`📧 Recipients: ${recipients.join(', ')}`);

    // Format the email content
    const emailSubject = `COMPLAINT ALERT - ${complaint.complaint_type} Issue at ${complaint.store_name}`;
    
    // Create attachment links
    const attachmentLinks = attachmentUrls.length > 0 
      ? `
        <h3 style="color: #1f2937; margin-top: 20px;">Attachments:</h3>
        <ul style="list-style-type: disc; margin-left: 20px;">
          ${attachmentUrls.map((url, index) => 
            `<li><a href="${url}" target="_blank" style="color: #2563eb; text-decoration: underline;">Download Attachment ${index + 1}</a></li>`
          ).join('')}
        </ul>
      `
      : '<p><em>No attachments provided</em></p>';

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚨 Customer Complaint Alert</h1>
        </div>
        
        <div style="padding: 30px;">
          <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">New Complaint Submitted</h2>
            <p style="margin: 0; font-weight: bold;">Complaint Type: ${complaint.complaint_type}</p>
            <p style="margin: 5px 0 0 0; font-weight: bold;">Issue Type: ${complaint.issue_type}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Store Information</h3>
            <p><strong>Store:</strong> ${complaint.store_name}</p>
            <p><strong>Store Number:</strong> ${complaint.store_number}</p>
            <p><strong>Submitted By:</strong> ${complaint.submitted_by_name} (${complaint.submitted_by_email})</p>
            <p><strong>Date Submitted:</strong> ${new Date(complaint.date_submitted).toLocaleString()}</p>
            ${complaint.sales_person ? `<p><strong>Sales Person:</strong> ${complaint.sales_person}</p>` : ''}
          </div>

          ${complaint.work_order_number || complaint.order_id ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Order Information</h3>
            ${complaint.work_order_number ? `<p><strong>Work Order Number:</strong> ${complaint.work_order_number}</p>` : ''}
            ${complaint.order_id ? `<p><strong>Order ID:</strong> ${complaint.order_id}</p>` : ''}
          </div>
          ` : ''}

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Complaint Details</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${complaint.identified_concern}</p>
            </div>
          </div>

          ${attachmentLinks}

          <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 6px; border: 1px solid #0ea5e9;">
            <p style="margin: 0; color: #0c4a6e; font-weight: bold;">⚡ Action Required</p>
            <p style="margin: 5px 0 0 0; color: #075985;">Please review this complaint and take appropriate action. Contact the submitter directly if additional information is needed.</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">This is an automated notification from the Conlan Tire Customer Complaint System</p>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Complaint ID: ${complaint.id}</p>
        </div>
      </div>
    `;

    // Send email to all recipients
    const emailResponse = await resend.emails.send({
      from: Deno.env.get("FROM_EMAIL") || "Conlan Tire Complaints <complaints@conlantire.com>",
      to: recipients,
      subject: emailSubject,
      html: emailContent,
    });

    console.log("✅ Complaint notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse,
      sentTo: recipients 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Error in complaint-notification function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
