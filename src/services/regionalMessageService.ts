import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { 
  RegionalMessage, 
  RegionalMessageRecipient, 
  SendRegionalMessageData,
  RegionalMessageWithRecipients 
} from "@/types/regionalMessages";

export type { 
  RegionalMessage, 
  RegionalMessageRecipient, 
  SendRegionalMessageData,
  RegionalMessageWithRecipients 
};

/**
 * Send a regional message to a plant using raw SQL
 */
export async function sendRegionalMessage(
  messageData: SendRegionalMessageData
): Promise<{ data: RegionalMessage | null; error: Error | null }> {
  try {
    logger.info("Sending regional message", { 
      plant: messageData.plant_code, 
      subject: messageData.subject 
    });
    
    // Use direct REST API approach since regional_messages table isn't in types yet
    const response = await fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/rest/v1/regional_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10'}`,
      },
      body: JSON.stringify({
        plant_code: messageData.plant_code,
        subject: messageData.subject,
        body: messageData.body,
        created_by: messageData.created_by
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error sending regional message", { error: errorData });
      return { data: null, error: new Error(`Failed to send regional message: ${errorData}`) };
    }

    const regionalMessage = (await response.json())[0] as RegionalMessage;
    logger.info("Regional message sent successfully", { messageId: regionalMessage.id });
    return { data: regionalMessage, error: null };
  } catch (error) {
    logger.error("Unexpected error sending regional message", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error sending regional message") 
    };
  }
}

/**
 * Get regional messages for a plant with recipient info using raw API calls
 */
export async function getRegionalMessages(
  plantCode: string
): Promise<{ data: RegionalMessageWithRecipients[]; error: Error | null }> {
  try {
    logger.info("Fetching regional messages", { plant: plantCode });
    
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10';

    // Get messages
    const messagesResponse = await fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/rest/v1/regional_messages?plant_code=eq.${plantCode}&order=created_at.desc`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.text();
      logger.error("Error fetching regional messages", { error: errorData });
      return { data: [], error: new Error(`Failed to fetch regional messages: ${errorData}`) };
    }

    const messages = await messagesResponse.json() as RegionalMessage[];

    // Get recipients for all messages
    const messagesWithCounts: RegionalMessageWithRecipients[] = [];
    
    for (const message of messages) {
      const recipientsResponse = await fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/rest/v1/regional_message_recipients?message_id=eq.${message.id}`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
          'Authorization': `Bearer ${token}`,
        }
      });

      const recipients = recipientsResponse.ok ? await recipientsResponse.json() as RegionalMessageRecipient[] : [];
      
      messagesWithCounts.push({
        ...message,
        recipients,
        unread_count: recipients.filter(r => !r.read_at).length,
        total_recipients: recipients.length
      });
    }

    logger.info("Regional messages fetched successfully", { count: messagesWithCounts.length });
    return { data: messagesWithCounts, error: null };
  } catch (error) {
    logger.error("Unexpected error fetching regional messages", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error("Unknown error fetching regional messages") 
    };
  }
}

/**
 * Mark a regional message as read for a specific user using raw API calls
 */
export async function markRegionalMessageAsRead(
  messageId: string, 
  userEmail: string
): Promise<{ error: Error | null }> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10';

    const response = await fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/rest/v1/regional_message_recipients?message_id=eq.${messageId}&user_email=eq.${userEmail}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        read_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error marking regional message as read", { error: errorData });
      return { error: new Error(`Failed to mark regional message as read: ${errorData}`) };
    }

    return { error: null };
  } catch (error) {
    logger.error("Unexpected error marking regional message as read", {}, error instanceof Error ? error : new Error(String(error)));
    return { error: error instanceof Error ? error : new Error("Unknown error marking regional message as read") };
  }
}

/**
 * Get unread regional message count for a user using raw API calls
 */
export async function getUnreadRegionalMessageCount(
  plantCode: string,
  userEmail: string
): Promise<{ count: number; error: Error | null }> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10';

    // Get messages for the plant
    const messagesResponse = await fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/rest/v1/regional_messages?plant_code=eq.${plantCode}&select=id`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!messagesResponse.ok) {
      return { count: 0, error: new Error(`Failed to fetch messages: ${await messagesResponse.text()}`) };
    }

    const messages = await messagesResponse.json() as { id: string }[];

    if (messages.length === 0) {
      return { count: 0, error: null };
    }

    const messageIds = messages.map(m => m.id);

    // Count unread messages for this user
    const countResponse = await fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/rest/v1/regional_message_recipients?message_id=in.(${messageIds.join(',')})&user_email=eq.${userEmail}&read_at=is.null&select=*`, {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
        'Authorization': `Bearer ${token}`,
        'Prefer': 'count=exact'
      }
    });

    if (!countResponse.ok) {
      logger.error("Error getting unread regional message count");
      return { count: 0, error: new Error(`Failed to get unread count: ${await countResponse.text()}`) };
    }

    const countHeader = countResponse.headers.get('Content-Range');
    const count = countHeader ? parseInt(countHeader.split('/')[1]) || 0 : 0;

    return { count, error: null };
  } catch (error) {
    logger.error("Unexpected error getting unread regional message count", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      count: 0, 
      error: error instanceof Error ? error : new Error("Unknown error getting unread count") 
    };
  }
}