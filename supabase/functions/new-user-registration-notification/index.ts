import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingRegistration {
  id: string;
  email: string;
  plant_code: string;
  store_number: string;
  role_title: string;
  created_at: string;
  email_verified: boolean;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('New user registration notification function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'no-reply@conlantire.com';

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get pending registrations that are email verified but not admin reviewed
    const { data: pendingRegistrations, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email_verified', true)
      .eq('admin_reviewed', false)
      .eq('status', 'pending_admin_review');

    if (fetchError) {
      console.error('Error fetching pending registrations:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending registrations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingRegistrations?.length || 0} pending registrations to notify about`);

    if (!pendingRegistrations || pendingRegistrations.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending registrations to notify about' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin emails (super_admin, operations_manager, corporate_director)
    const { data: adminManagers, error: adminError } = await supabase
      .from('managers')
      .select('email, name')
      .in('role', ['super_admin', 'operations_manager', 'corporate_director'])
      .eq('is_active', true);

    if (adminError || !adminManagers || adminManagers.length === 0) {
      console.error('Error fetching admin managers or no admins found:', adminError);
      return new Response(
        JSON.stringify({ error: 'No active administrators found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminEmails = adminManagers.map(admin => admin.email);
    console.log(`Sending notifications to ${adminEmails.length} administrators`);

    // Helper function to get plant name
    const getPlantName = (plantCode: string) => {
      const plantNames: Record<string, string> = {
        '97': 'Grand Prairie 97',
        '98': 'Romulus 98',
        '99': 'Mulberry 99'
      };
      return plantNames[plantCode] || `Plant ${plantCode}`;
    };

    // Helper function to get store name
    const getStoreName = (storeNumber: string) => {
      const storeNames: Record<string, string> = {
        // Grand Prairie stores
        '22': 'Fort Worth 22',
        '27': 'Grand Prairie Service 27',
        '97': 'Grand Prairie 97',
        '28': 'Houston 28',
        '29': 'San Antonio 29',
        '35': 'Laredo 35',
        '39': 'Austin 39',
        // Romulus stores
        '98': 'Romulus 98',
        '8': 'Toledo 8',
        '11': 'Detroit 11',
        '13': 'Grand Rapids 13',
        '18': 'Cleveland 18',
        '41': 'Chicago 41',
        // Mulberry stores
        '3': 'Miami 3',
        '7': 'Pompano Beach 7',
        '9': 'Fort Myers 9',
        '002': 'Jacksonville - 002',
        '5': 'Ocala 5',
        '15': 'Tallahassee 15',
        '1': 'Mulberry Service 1',
        '99': 'Mulberry 99',
        '4': 'New Orland 4',
        '6': 'Tampa 6',
        '21': 'Vero Beach 21',
        '23': 'Sarasota 23',
        '40': 'Tampa Foam Fill 40',
        '30': 'Oklahoma City 30',
        '32': 'Little Rock 32',
        '33': 'Kansas City 33',
        '36': 'Tulsa 36'
      };
      return storeNames[storeNumber] || `Store ${storeNumber}`;
    };

    // Send notification emails for each pending registration
    for (const registration of pendingRegistrations) {
      const plantName = getPlantName(registration.plant_code);
      const storeName = getStoreName(registration.store_number);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a365d; margin-top: 0;">New User Registration Pending Review</h2>
            <p style="color: #4a5568; font-size: 16px;">
              A new user has completed email verification and is waiting for admin approval to access the Ordering Platform.
            </p>
          </div>
          
          <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin-top: 0;">Registration Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Email:</td>
                <td style="padding: 8px 0; color: #2d3748;">${registration.email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Plant:</td>
                <td style="padding: 8px 0; color: #2d3748;">${plantName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Store:</td>
                <td style="padding: 8px 0; color: #2d3748;">${storeName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Role/Title:</td>
                <td style="padding: 8px 0; color: #2d3748;">${registration.role_title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Registration Date:</td>
                <td style="padding: 8px 0; color: #2d3748;">${new Date(registration.created_at).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f0f8f4; border-left: 4px solid #48bb78; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; color: #2f855a;">
              <strong>✅ Email Verified:</strong> The user has successfully verified their email address.
            </p>
          </div>
          
          <div style="background-color: #fef5e7; border-left: 4px solid #ed8936; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; color: #c05621;">
              <strong>⏳ Action Required:</strong> Please review this registration and approve or reject the user's access.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #4a5568; margin-bottom: 15px;">
              To review and manage user registrations, log in to the admin panel.
            </p>
            <a href="https://conlantireordertracking.vercel.app/login" 
               style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Review Registration
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              This is an automated notification from the ConlanTire Ordering Platform.
            </p>
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: fromEmail,
          to: adminEmails,
          subject: `New User Registration: ${registration.email} - ${storeName}`,
          html: emailHtml
        });

        console.log(`Notification sent for registration: ${registration.email}`);

        // Log the notification
        await supabase
          .from('notification_logs')
          .insert({
            notification_type: 'new_user_registration',
            order_id: registration.id,
            recipient_email: adminEmails.join(', '),
            recipient_role: 'admin',
            status: 'sent'
          });

      } catch (emailError) {
        console.error(`Failed to send notification for ${registration.email}:`, emailError);
        
        // Log the failed notification
        await supabase
          .from('notification_logs')
          .insert({
            notification_type: 'new_user_registration',
            order_id: registration.id,
            recipient_email: adminEmails.join(', '),
            recipient_role: 'admin',
            status: 'failed',
            error_message: (emailError as Error).message
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${pendingRegistrations.length} pending registrations`,
        notified_admins: adminEmails.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in new-user-registration-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);