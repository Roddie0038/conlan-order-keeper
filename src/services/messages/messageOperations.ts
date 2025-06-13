
// Re-export all functionality from the modular files
export { sendOrderMessage } from './messageSender';
export { getOrderMessages, markMessagesAsRead, getOrderMessageCount } from './messageRetrieval';
export { validateOrderData } from './orderValidation';
export { safeParseInt, normalizeOrderType } from './validationUtils';
