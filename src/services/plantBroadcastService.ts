import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { 
  PlantBroadcast, 
  PlantBroadcastRecipient, 
  SendPlantBroadcastData,
  PlantBroadcastWithRecipients 
} from "@/types/plantBroadcasts";

export type { 
  PlantBroadcast, 
  PlantBroadcastRecipient, 
  SendPlantBroadcastData,
  PlantBroadcastWithRecipients 
};

/**
 * Send a plant broadcast to a plant using raw SQL
 */
export async function sendPlantBroadcast(
  messageData: SendPlantBroadcastData
): Promise<{ data: PlantBroadcast | null; error: Error | null }> {
  try {
    logger.info("Sending plant broadcast", { 
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
      logger.error("Error sending plant broadcast", { error: errorData });
      return { data: null, error: new Error(`Failed to send plant broadcast: ${errorData}`) };
    }

    const plantBroadcast = (await response.json())[0] as PlantBroadcast;
    logger.info("Plant broadcast sent successfully", { messageId: plantBroadcast.id });
    return { data: plantBroadcast, error: null };
  } catch (error) {
    logger.error("Unexpected error sending plant broadcast", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error sending plant broadcast") 
    };
  }
}

/**
 * Get plant broadcasts for a plant with recipient info using raw API calls
 */
export async function getPlantBroadcasts(
  plantCode: string
): Promise<{ data: PlantBroadcastWithRecipients[]; error: Error | null }> {
  try {
    logger.info("Fetching plant broadcasts", { plant: plantCode });
    
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
      logger.error("Error fetching plant broadcasts", { error: errorData });
      return { data: [], error: new Error(`Failed to fetch plant broadcasts: ${errorData}`) };
    }

    const messages = await messagesResponse.json() as PlantBroadcast[];

    // Get recipients for all messages
    const messagesWithCounts: PlantBroadcastWithRecipients[] = [];
    
    for (const message of messages) {
      const recipientsResponse = await fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/rest/v1/regional_message_recipients?message_id=eq.${message.id}`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
          'Authorization': `Bearer ${token}`,
        }
      });

      const recipients = recipientsResponse.ok ? await recipientsResponse.json() as PlantBroadcastRecipient[] : [];
      
      messagesWithCounts.push({
        ...message,
        recipients,
        unread_count: recipients.filter(r => !r.read_at).length,
        total_recipients: recipients.length
      });
    }

    logger.info("Plant broadcasts fetched successfully", { count: messagesWithCounts.length });
    return { data: messagesWithCounts, error: null };
  } catch (error) {
    logger.error("Unexpected error fetching plant broadcasts", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error("Unknown error fetching plant broadcasts") 
    };
  }
}

/**
 * Mark a plant broadcast as read for a specific user using raw API calls
 */
export async function markPlantBroadcastAsRead(
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
      logger.error("Error marking plant broadcast as read", { error: errorData });
      return { error: new Error(`Failed to mark plant broadcast as read: ${errorData}`) };
    }

    return { error: null };
  } catch (error) {
    logger.error("Unexpected error marking plant broadcast as read", {}, error instanceof Error ? error : new Error(String(error)));
    return { error: error instanceof Error ? error : new Error("Unknown error marking plant broadcast as read") };
  }
}

/**
 * Get unread plant broadcast count for a user using raw API calls
 */
export async function getUnreadPlantBroadcastCount(
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
      logger.error("Error getting unread plant broadcast count");
      return { count: 0, error: new Error(`Failed to get unread count: ${await countResponse.text()}`) };
    }

    const countHeader = countResponse.headers.get('Content-Range');
    const count = countHeader ? parseInt(countHeader.split('/')[1]) || 0 : 0;

    return { count, error: null };
  } catch (error) {
    logger.error("Unexpected error getting unread plant broadcast count", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      count: 0, 
      error: error instanceof Error ? error : new Error("Unknown error getting unread count") 
    };
  }
}