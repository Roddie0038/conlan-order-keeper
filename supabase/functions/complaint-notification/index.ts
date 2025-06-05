
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplaintData {
  id: string;
  store_number: string;
  store_name: string;
  sales_person?: string;
  complaint_type: string;
  work_order_number?: string;
  order_id?: string;
  issue_type: string;
  identified_concern: string;
  attachments?: string[];
  submitted_by_name: string;
  submitted_by_email: string;
  date_submitted: string;
}

// Plant-specific email routing
const getPlantEmails = (storeNumber: string): string[] => {
  const storeNum = parseInt(storeNumber);
  
  // Grand Prairie 97 stores (22, 27, 28, 29, 30, 32, 33, 35, 36, 39)
  if ([22, 27, 28, 29, 30, 32, 33, 35, 36, 39].includes(storeNum)) {
    return [
      "nchilds@conlantire.com",
      "manderson@conlantire.com", 
      "gsumodobila@conlantire.com",
      "rdemarais@conlantire.com",
      "jesquivel@conlantire.com",
      "jpalos@conlantire.com"
    ];
  }
  
  // Mulberry Retread 99 stores (001, 002, 003, 004, 005, 006, 007, 009, 015, 023, 040)
  if ([1, 2, 3, 4, 5, 6, 7, 9, 15, 23, 40].includes(storeNum)) {
    return [
      "dlee@conlantire.com",
      "wsettles@conlantire.com",
      "ogull@conlantire.com", 
      "kbriglin@conlantire.com"
    ];
  }
  
  // Romulus 98 stores (default for other stores)
  return [
    "bperry@conlantire.com",
    "chynds@conlantire.com",
    "drsanchez@conlantire.com",
    "nohernandez@conlantire.com"
  ];
};

const createEmailHTML = (complaint: ComplaintData): string => {
  const attachmentsList = complaint.attachments && complaint.attachments.length > 0
    ? complaint.attachments.map((url, index) => 
        `<li><a href="${url}" style="color: #2563eb;">Attachment ${index + 1}</a></li>`
      ).join('')
    : '<li>No attachments</li>';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">New Complaint Submitted</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Complaint ID: ${complaint.id}</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Complaint Details</h2>
          <div style="display: grid; gap: 15px;">
            <div>
              <strong style="color: #374151;">Store:</strong> ${complaint.store_name} (#${complaint.store_number})
            </div>
            <div>
              <strong style="color: #374151;">Complaint Type:</strong> 
              <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                ${complaint.complaint_type}
              </span>
            </div>
            <div>
              <strong style="color: #374151;">Issue Type:</strong>
              <span style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                ${complaint.issue_type}
              </span>
            </div>
            ${complaint.sales_person ? `<div><strong style="color: #374151;">Sales Person:</strong> ${complaint.sales_person}</div>` : ''}
            ${complaint.work_order_number ? `<div><strong style="color: #374151;">Work Order:</strong> ${complaint.work_order_number}</div>` : ''}
            ${complaint.order_id ? `<div><strong style="color: #374151;">Order ID:</strong> ${complaint.order_id}</div>` : ''}
            <div>
              <strong style="color: #374151;">Submitted by:</strong> ${complaint.submitted_by_name} (${complaint.submitted_by_email})
            </div>
            <div>
              <strong style="color: #374151;">Date Submitted:</strong> ${new Date(complaint.date_submitted).toLocaleString()}
            </div>
          </div>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">Identified Concern</h3>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; border-left: 4px solid #ef4444;">
            ${complaint.identified_concern}
          </div>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 6px;">
          <h3 style="color: #1f2937; margin-top: 0;">Attachments</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${attachmentsList}
          </ul>
        </div>
      </div>
      
      <div style="background-color: #1f2937; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">
          This complaint requires attention and resolution. Please review and respond accordingly.
        </p>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const complaint: ComplaintData = await req.json();
    console.log("Processing complaint notification for:", complaint.id);

    // Get plant-specific emails
    const plantEmails = getPlantEmails(complaint.store_number);
    
    // Always include operations manager and submitter
    const allRecipients = [
      complaint.submitted_by_email, // Store manager who submitted
      "bperry@conlantire.com", // Operations manager (always included)
      ...plantEmails // Plant-specific recipients
    ];

    // Remove duplicates
    const uniqueRecipients = [...new Set(allRecipients)];
    
    console.log("Sending complaint notification to:", uniqueRecipients);

    const emailHTML = createEmailHTML(complaint);

    const emailResponse = await resend.emails.send({
      from: "Conlan Tire Complaints <onboarding@resend.dev>",
      to: uniqueRecipients,
      subject: `New Complaint: ${complaint.complaint_type} - ${complaint.store_name}`,
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Complaint notification sent successfully",
        recipients: uniqueRecipients.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in complaint-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
