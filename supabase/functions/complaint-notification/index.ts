
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
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

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  store_number?: string;
  plant_code: string;
  is_active: boolean;
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Get plant code for store number
const getPlantCodeForStore = (storeNumber: string): string => {
  const storeNum = parseInt(storeNumber);
  
  // Grand Prairie 97 stores
  if ([22, 27, 28, 29, 30, 32, 33, 35, 36, 39].includes(storeNum)) {
    return '97';
  }
  
  // Mulberry 99 stores  
  if ([1, 2, 3, 4, 5, 6, 7, 9, 15, 23, 40].includes(storeNum)) {
    return '99';
  }
  
  // Default to Romulus 98 for other stores
  return '98';
};

// Get complaint email recipients using Supabase
const getComplaintEmailRecipients = async (
  storeNumber: string,
  submitterEmail: string
): Promise<string[]> => {
  try {
    const plantCode = getPlantCodeForStore(storeNumber);
    console.log(`Getting recipients for store ${storeNumber}, plant ${plantCode}`);
    
    // Get all relevant managers for the plant
    const { data: managers, error: managersError } = await supabase
      .from('managers')
      .select('*')
      .eq('plant_code', plantCode)
      .in('role', ['warehouse_manager', 'retread_manager', 'coordinator', 'operations_manager', 'office_manager'])
      .eq('is_active', true);

    if (managersError) {
      console.error('Error fetching managers:', managersError);
      throw managersError;
    }

    // Get store manager
    const { data: storeManager, error: storeError } = await supabase
      .from('managers')
      .select('*')
      .eq('store_number', storeNumber)
      .eq('role', 'store_manager')
      .eq('is_active', true)
      .maybeSingle();

    if (storeError) {
      console.error('Error fetching store manager:', storeError);
    }
    
    // Collect all emails
    const emails = new Set<string>();
    
    // Always include submitter
    emails.add(submitterEmail);
    
    // Add store manager if found
    if (storeManager) {
      emails.add(storeManager.email);
      console.log(`Added store manager: ${storeManager.email}`);
    }
    
    // Add all plant managers
    if (managers) {
      managers.forEach((manager: Manager) => {
        emails.add(manager.email);
        console.log(`Added ${manager.role}: ${manager.email}`);
      });
    }

    const recipients = Array.from(emails);
    console.log(`Final recipients list: ${recipients.join(', ')}`);
    return recipients;
    
  } catch (error) {
    console.error('Error getting complaint email recipients, using fallback:', error);
    
    // Fallback to original hardcoded logic
    const plantCode = getPlantCodeForStore(storeNumber);
    const fallbackEmails = [submitterEmail];
    
    if (plantCode === '97') {
      fallbackEmails.push(
        'nchilds@conlantire.com',
        'manderson@conlantire.com', 
        'gsumodobila@conlantire.com',
        'rdemarais@conlantire.com',
        'jesquivel@conlantire.com',
        'jpalos@conlantire.com'
      );
    } else if (plantCode === '99') {
      fallbackEmails.push(
        'dlee@conlantire.com',
        'wsettles@conlantire.com',
        'ogull@conlantire.com', 
        'kbriglin@conlantire.com'
      );
    } else {
      fallbackEmails.push(
        'bperry@conlantire.com',
        'chynds@conlantire.com',
        'drsanchez@conlantire.com',
        'nohernandez@conlantire.com'
      );
    }
    
    return [...new Set(fallbackEmails)];
  }
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

    // Get dynamic email recipients from Supabase
    const recipients = await getComplaintEmailRecipients(
      complaint.store_number,
      complaint.submitted_by_email
    );
    
    console.log("Sending complaint notification to:", recipients);

    const emailHTML = createEmailHTML(complaint);

    const emailResponse = await resend.emails.send({
      from: "Conlan Tire Complaints <onboarding@resend.dev>",
      to: recipients,
      subject: `New Complaint: ${complaint.complaint_type} - ${complaint.store_name}`,
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Complaint notification sent successfully",
        recipients: recipients.length,
        recipient_emails: recipients
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
