
// Main message service - exports all functionality from modular files
export type { OrderMessage, SendMessageData } from './messages/types';
export { 
  sendOrderMessage, 
  getOrderMessages, 
  markMessagesAsRead, 
  getOrderMessageCount 
} from './messages/messageOperations';
export { sendEmailNotification } from './messages/emailUtils';
